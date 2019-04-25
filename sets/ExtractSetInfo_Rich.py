import os

# Constants
inputFileName1 = "cardSearchResults1.html"
inputFileName2 = "cardSearchResults2.html"
inputFileName3 = "cardSearchResults3.html"
imgStr_Front = "http://gatherer.wizards.com"

# Variables for the main loop
mythicsJsLines = ""
raresJsLines = ""
uncommonsJsLines = ""
commonsJsLines = ""
cardProperty = 0
cardLine = 0
splitCard = False

### Main loop ###
for inputFileName in [inputFileName1, inputFileName2, inputFileName3]:
    # Check that file exists
    if not os.path.isfile(inputFileName):
        raw_input("File " + inputFileName + " is missing")
        continue
    # Open each input file and process it
    with open(inputFileName) as file:
        # Main loop
        for line in file:
            ### Start processing a new card ###
            if cardProperty==0 and '<span class="cardTitle">' in line:
                cardJsLines = ""
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
                idx1 = line.index(">") + 1
                idx2 = line.index("</a>")
                name = line[idx1:idx2]
                # Handle split cards
                if "//" in name:
                   # Chop off card-specific name (Example: "Dusk // Dawn (Dawn)")
                   idx2 = name.index("(") - 1
                   name = name[idx1:idx2]
                   splitCard = True
                cardJsLines += '\t\t{name:"'+ name + '", mvid:' + mvid
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
                cardJsLines += ', manaCost:"' + manaCost # " added on next line
                cardJsLines += '", cmc:' + cmc
                cardProperty = 3
                cardLine = 1
            ### Card types ###
            if cardProperty==3 and cardLine==4:
                types = line.strip()
                # Replace double space with single space (gatherer has a weird
                # double space before the long dash)
                types = types.replace("  ", " ")
                cardJsLines += ', types:"' + types + '"'
                # Don't update cardProperty yet, because we might need the next line
            ### Power/Toughness or Loyalty ###
            if cardProperty==3 and cardLine==5:
                if "Creature" in types or "Planeswalker" in types:
                    ptl = line.strip()[:-7] # EOL is "</span>"
                    ptl = ptl.strip('()') # Paren are not needed or wanted
                else:
                    ptl = ""
                cardJsLines += ', powerToughness_Loyalty:"' + ptl + '"'
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
                cardJsLines += ', rulesText:"' + rulesText + '"'
            ### Rarity ###
            # 2nd instance of "?multiverseid="
            if cardProperty==5  and "?multiverseid=" in line:
                idx1 = line.index("rarity=") + 7
                idx2 = idx1 + 1
                rarity = line[idx1:idx2]
                cardJsLines += ', rarity:"' + rarity + '"}, \n'
                # Prepare for next card
                if(rarity == "M"):
                    mythicsJsLines += cardJsLines
                elif(rarity == "R"):
                    raresJsLines += cardJsLines
                elif(rarity == "U"):
                    uncommonsJsLines += cardJsLines
                elif(rarity == "C"):
                    commonsJsLines += cardJsLines
                else:
                    print "Bad rarity: " + rarity
                cardProperty = 0
                cardLine = 0

setId = raw_input("What is the 3 letter set code for this set? ")
# Start the set object; cast to string because otherwise Python uses unicode
jsLines = str("var " + setId + " = {\n\tmythics = [\n")
# Add the meat of the set object, one rarity at a time
jsLines += mythicsJsLines[:-3] # Chop ", \n" off the end
jsLines += "\n\t], \n\trares = [\n"
jsLines += raresJsLines[:-3]
jsLines += "\n\t], \n\tuncommons = [\n"
jsLines += uncommonsJsLines[:-3]
jsLines += "\n\t], \n\tcommons = [\n"
jsLines += commonsJsLines[:-3]
jsLines += "\n\t]\n}"
# Write the set file
setFileName = setId + ".js"
with open(setFileName, 'w') as file:
    file.writelines(jsLines)

# Pause
endOfScript = raw_input("The data has been extracted. Press Enter to exit.")