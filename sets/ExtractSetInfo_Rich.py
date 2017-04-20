import os

# Constants
inputFileName = "cardSearchResults.html"
imgStr_Front = "http://gatherer.wizards.com"
mythicsFname = "Mythics.js"
raresFname = "Rares.js"
uncommonsFname = "Uncommons.js"
commonsFname = "Commons.js"
commons2Fname = "Commons2.js"

# Check that file exists
if not os.path.isfile(inputFileName):
    raw_input("Please save your Gatherer search results in a file named "
        + inputFileName + " and try again")
    exit()

# Identify rarity
rarity = raw_input("Choose rarity (M=Mythics, R=Rares, U=Uncommons, C=Commons, "
    + "C2=2nd Commons File): ")
rarity = rarity.upper()
if rarity not in ['M', 'R', 'U', 'C', "C2"]:
    print "Bad input for rarity (program will exit)"
    exit()

# Variables for the main loop
jsLines = ""
cardProperty = 0
cardLine = 0
splitCard = False
# Open input file and process it
with open(inputFileName) as file:
    # Main loop
    for line in file:
        ### Start processing a new card ###
        if cardProperty==0 and '<span class="cardTitle">' in line:
            # Skip the second search result for this split card
            if splitCard:
                splitCard = False
            # Get ready to process this card
            else:
                cardProperty = 1
            continue
        # The processing of some properties should wait until a few lines have 
        # been skipped
        if cardLine:
            cardLine += 1
        ### Name and Multiverse Id ###
        if cardProperty==1 and "?multiverseid=" in line:
            idx1 = line.index("?multiverseid=") + 14
            idx2 = idx1 + 6
            mvid = line[idx1:idx2]
            idx1 += 8
            idx2 = line.index("</a>")
            name = line[idx1:idx2]
            # Handle split cards
            if "//" in name:
               idx1 = name.index(">") + 1
               # Chop off card-specific name (Example: "Dusk // Dawn (Dawn)")
               idx2 = name.index("(") - 1
               name = name[idx1:idx2]
               splitCard = True
            jsLines += '\t\t{name:"'+ name + '", mvid:' + mvid
            cardProperty = 2
            cardLine = 1
        ### Mana cost ###
        if cardProperty==2 and cardLine==2:
            # Create a list of indices where alt attributes start
            idxList = [i for i,_ in enumerate(line[:-5]) if line[i:i+5]=='alt="']
            manaCost = ""
            for idx in idxList:
                idx1 = idx + 5
                idx2 = idx1 + 4
                if line[idx1:idx2]=="Blue":
                    manaCost += 'U'
                elif line[idx1:idx2]=="Vari":
                    manaCost += 'X'
                else:
                    manaCost += line[idx1:idx1+1]
            idx1 = line.index("convertedManaCost") + 19 # Includes '">'
            idx2 = len(line.rstrip()) - 8 # End of line is "</span>)"
            cmc = line[idx1:idx2]
            jsLines += ', manaCost:"' + manaCost
            jsLines += '", cmc:' + cmc
            cardProperty = 3
            cardLine = 1
        ### Card types ###
        if cardProperty==3 and cardLine==4:
            types = line.strip()
            # Replace double space with single space (gatherer has a weird
            # double space before the long dash)
            types = types.replace("  ", " ")
            jsLines += ', types:"' + types
            # Don't update cardProperty yet, because we might need the next line
        ### Power/Toughness or Loyalty ###
        if cardProperty==3 and cardLine==5:
            if "Creature" in types or "Planeswalker" in types:
                ptl = line.strip()[:-7] # EOL is "</span>"
                ptl = ptl.strip('()') # Paren are not needed or wanted
            else:
                ptl = ""
            jsLines += ', powerToughness_Loyalty:"' + ptl
            cardProperty = 4
        ### Rarity ###
        jsLines += ', rarity:"' + rarity
        ### Rules text ###
        if cardProperty==4 and 'class="rulesText"' in line:
            cardProperty = 5
            cardLine = 1
        if cardProperty==5 and cardLine==2:
            rulesText = line.strip()[:-6] # Chop off "</div>"
            # Escape quotes
            rulesText = rulesText.replace('"', '\\"')
            # Complete and fix the image URL for energy, tap, and mana symbols
            if "/Handlers/" in rulesText:
                rulesText = rulesText.replace("/Handlers/",
                    imgStr_Front + "/Handlers/")
                rulesText = rulesText.replace("&amp;", "&")
            jsLines += ', rulesText:"' + rulesText + '"}, \n'
            # Reset for next card
            cardProperty = 0
            cardLine = 0

# Select output file name and write the output file for this rarity
if rarity == 'M':
    outputFileName = mythicsFname
elif rarity == 'R':
    outputFileName = raresFname
elif rarity == 'U':
    outputFileName = uncommonsFname
elif rarity == 'C':
    outputFileName = commonsFname
elif rarity == "C2":
    outputFileName = commons2Fname
# This should have been caught earlier, but I'm leaving it defensively
else:
    print "Bad input for rarity"
    exit()
with open(outputFileName, 'w') as file:
    file.write(jsLines)

# If all rarity files have been created, then create the combined set file
print "All rarities have been extracted. The set js file is being generated..."
if os.path.isfile(mythicsFname) and os.path.isfile(raresFname) and \
    os.path.isfile(uncommonsFname) and os.path.isfile(commonsFname):
    ### Set up to create a set JS object ###
    fileNameProcessingList = [
        ["mythicPool", mythicsFname],
        ["rarePool", raresFname],
        ["uncommonPool", uncommonsFname],
        ["commonPool", commonsFname]
    ]
    # Add the 2nd search results file for commons to the common pool list
    if os.path.isfile(commons2Fname):
        fileNameProcessingList[3].append(commons2Fname)
    # Get the set id for the beginning of the file
    setId = raw_input("What is the 3 letter set code for this set? ")
    ### Start the set object ###
    # (This time, jsLines is an array of strings, instead of one long string)
    jsLines = ["var " + setId + " = {\n"]
    ### Add the meat of the set object, one rarity at a time ###
    for rarityItem in fileNameProcessingList:
        jsLines.append('\t"' + rarityItem[0] + '": [\n')
        with open(rarityItem[1]) as file:
            singleRarityFileContents = file.readlines()
        # Handle the 2nd common file, if needed
        if len(rarityItem) > 2:
            # Add the contents of the first common file, then read the second
            jsLines += (singleRarityFileContents)
            with open(rarityItem[2]) as file:
                singleRarityFileContents = file.readlines()
        # Chop the last 3 characters off the last line (", \n")
        lastLine = singleRarityFileContents.pop()
        lastLine = lastLine[:-3] + "\n"
        singleRarityFileContents.append(lastLine)
        jsLines += (singleRarityFileContents)
        # Add "    ]" to the end of the file, or "    ], " if the we're still
        # building the file
        if rarityItem[0] == "commonPool":
            jsLines.append("\t]\n")
        else:
            jsLines.append("\t], \n")
    ### Close off the set object ###
    jsLines.append("}")
    ### Handle duplicate cards ###
    # (Duplicates happen when old cards are reprinted in a new set with a 
    # different rarity)
    cardNames = []
    cardLineNums = []
    dupsFound = 0
    newJsLines = jsLines[:] # copy
    for lineNum, line in enumerate(jsLines):
        if not line.startswith("\t\t{"):
            continue
        idx1 = line.index("name:") + 6
        idx2 = line.index("mvid:") - 3
        name = line[idx1:idx2]
        if name in cardNames:
            # Have user determine appropriate rarity
            rarity = raw_input("What is the appropriate rarity for " 
                + name + "? (M=Mythic, R=Rare, U=Uncommon, C=Common")
            if rarity not in ['M', 'R', 'U', 'C']:
                print "Bad input for rarity (this duplicate will remain)"
                continue
            # Determine which line number to keep and which to eliminate
            idx1 = line.index("rarity:") + 7
            idx2 = idx1 + 1
            lineRarity = line[idx1:idx2]
            if lineRarity == rarity:
                lineToDelete = lineNum
            else:
                lineToDelete = cardLineNums[cardNames.index(name)]
            lineToDelete -= dupsFound
            # Eliminate the appropriate line
            newJsLines.pop(lineToDelete)
            dupsFound += 1
        else:
            cardNames.append(name)
            cardLineNums.append(lineNum)
    jsLines = newJsLines
    # Write the set file
    setFileName = setId + ".js"
    with open(setFileName, 'w') as file:
        file.writelines(jsLines)

# Pause
endOfScript = raw_input("The data has been extracted. Press Enter to exit.")