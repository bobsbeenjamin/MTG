fileName = "cardSearchResults.html"
jsLines = "\r"
look = False
with open(fileName) as file:
    for line in file:
        if '<span class="cardTitle">' in line:
            look = True
            continue
        if look and "?multiverseid=" in line:
            idx1 = line.index("?multiverseid=") + 14
            idx2 = idx1 + 6
            mvid = line[idx1:idx2]
            idx1 += 8
            idx2 = line.index("</a>")
            name = line[idx1:idx2]
            jsLines += '\t\t{name:"'+ name + '", mvid:' + mvid + '}, \r'
            look = False # reset for next card
fileName = "output.js"
with open(fileName, 'w') as file:
    file.write(jsLines)