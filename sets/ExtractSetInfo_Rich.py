# Constants
fileName = "cardSearchResults.html"
oldImgStr_Front = "./Card Search - Search_ +_Aether Revolt_ - Gatherer - Magic_ The Gathering_files/Image("
oldImgStr_Back = ").ashx"
newImgStr_Front = "http://gatherer.wizards.com/Handlers/Image.ashx?size=small&name="
newImgStr_Back = "&type=symbol"
# NOTE: You will need to update this for each Gatherer search.  :(
# The best way to do this is to simply run this script, search the output file
# for "Image(", look at which number should be replaced with which symbol, then
# make the changes to the keys below. (999 means don't care)
imageMap = {
    15:"e", # Energy
    21:"tap", # Tap
    9:"1", # 1
    999:"2", # 2
    6:"3", # 3
    13:"4", # 4
    22:"5", # 5
    999:"6", # 6
    65:"7", # 7
    28:"8", # 8
    2:"W", # White
    14:"U", # Blue
    8:"B", # Black
    30:"R", # Red
    37:"G", # Green
    55:"C", # Colorless
    999:"X" # X generic
}
# Variables for loop
jsLines = "\r"
look = 0
cardLine = 0
# Open file for processing
with open(fileName) as file:
    # Main loop
    for line in file:
        if not look and '<span class="cardTitle">' in line:
            look = 1
            continue
        if cardLine:
            cardLine += 1
        # Name and Multiverse Id
        if look==1 and "?multiverseid=" in line:
            idx1 = line.index("?multiverseid=") + 14
            idx2 = idx1 + 6
            mvid = line[idx1:idx2]
            idx1 += 8
            idx2 = line.index("</a>")
            name = line[idx1:idx2]
            jsLines += '\t\t{name:"'+ name + '", mvid:' + mvid + '}, \r'
            look = 2
            cardLine = 1
        # Mana cost
        if look==2 and cardLine==2:
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
            jsLines += '", cmc:' + cmc + '}, \r'
            look = 3
            cardLine = 1
        # Card types
        if look==3 and cardLine==4:
            types = line.strip()
            jsLines = jsLines[:-4] + ', types:"'  + types + '"}, \r'
            # Don't update look yet, because we might need the next line
        # Power/Toughness or Loyalty
        if look==3 and cardLine==5:
            if "Creature" in types or "Planeswalker" in types:
                ptl = line.strip()[:-7] # EOL is "</span>"
                ptl = ptl.strip('()') # Paren are not needed or wanted
            else:
                ptl = ""
            jsLines = jsLines[:-4] + ', powerToughness_Loyalty:"' + ptl + '"}, \r'
            look = 4
        # Rules text
        if look==4 and 'class="rulesText"' in line:
            look = 5
            cardLine = 1
        if look==5 and cardLine==2:
            rulesText = line.strip()[:-6] # Chop off "</div>"
            # Escape quotes
            rulesText = rulesText.replace('"', '\\"')
            # Replace energy, tap, and mana symbols
            if oldImgStr_Front in rulesText:
                for imgKey, imgVal in imageMap.iteritems():
                    oldImg = oldImgStr_Front + str(imgKey) + oldImgStr_Back
                    newImg = newImgStr_Front + imgVal + newImgStr_Back
                    rulesText = rulesText.replace(oldImg, newImg)
            jsLines = jsLines[:-4] + ', rulesText:"' + rulesText + '"}, \r'
            look = 0; cardLine = 0 # reset for next card
fileName = "output.js"
with open(fileName, 'w') as file:
    file.write(jsLines)
endOfScript = raw_input("The data has been extracted. Press Enter to exit.")