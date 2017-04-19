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

# Variables for the main loop
jsLines = ""
cardProperty = 0
cardLine = 0
# Open input file and process it
with open(inputFileName) as file:
    # Main loop
    for line in file:
        if cardProperty==0 and '<span class="cardTitle">' in line:
            cardProperty = 1
            continue
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
            jsLines += '\t\t{name:"'+ name + '", mvid:' + mvid + '}, \n'
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
            jsLines = jsLines[:-4] + ', manaCost:"' + manaCost
            jsLines += '", cmc:' + cmc + '}, \n'
            cardProperty = 3
            cardLine = 1
        ### Card types ###
        if cardProperty==3 and cardLine==4:
            types = line.strip()
            # Replace double space with single space (gatherer has a weird
            # double space before the long dash)
            types = types.replace("  ", " ")
            jsLines = jsLines[:-4] + ', types:"'  + types + '"}, \n'
            # Don't update cardProperty yet, because we might need the next line
        ### Power/Toughness or Loyalty ###
        if cardProperty==3 and cardLine==5:
            if "Creature" in types or "Planeswalker" in types:
                ptl = line.strip()[:-7] # EOL is "</span>"
                ptl = ptl.strip('()') # Paren are not needed or wanted
            else:
                ptl = ""
            jsLines = jsLines[:-4] + ', powerToughness_Loyalty:"' + ptl + '"}, \n'
            cardProperty = 4
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
            jsLines = jsLines[:-4] + ', rulesText:"' + rulesText + '"}, \n'
            # Reset for next card
            cardProperty = 0
            cardLine = 0

# Select output file name and write it
outputOption = raw_input("Choose rarity (M=Mythics, R=Rares, U=Uncommons, "
    + "C=Commons, C2=2nd Commons File): ")
outputOption = outputOption.upper()
if outputOption == 'M':
    outputFileName = mythicsFname
elif outputOption == 'R':
    outputFileName = raresFname
elif outputOption == 'U':
    outputFileName = uncommonsFname
elif outputOption == 'C':
    outputFileName = commonsFname
elif outputOption == "C2":
    outputFileName = commons2Fname
else:
    print "Bad input for rarity"
    exit()
with open(outputFileName, 'w') as file:
    file.write(jsLines)

# If all appropriate files have been created, then create the combined file
if os.path.isfile(mythicsFname) and os.path.isfile(raresFname) and \
    os.path.isfile(uncommonsFname) and os.path.isfile(commonsFname):
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
    # Start the set object (this time, jsLines is an array of strings, instead
    # of one long string)
    jsLines = ["var " + setId + " = {\n"]
    # Build the set object, one rarity at a time
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
    # Close off the set object
    jsLines.append("}")
    setFileName = setId + ".js"
    with open(setFileName, 'w') as file:
        file.writelines(jsLines)

# Pause
endOfScript = raw_input("The data has been extracted. Press Enter to exit.")