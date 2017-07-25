
/**
* Grab raw data from the external source and parse it
*/
function getDataMyWay(displayMethod) {
	var feedbackSpan = document.getElementById("feedback");
	feedbackSpan.innerHTML = "Fetching data...";
	
	var tableData;
	// Load data, and handle it with anonymous function
	$.get(
		"https://docs.google.com/spreadsheets/d/1fVmB1TR9tLTbkJLIaEmV8ncWSOAplMA-VO5ViGbLtoI/gviz/tq?tq=offset%202", 
		function(data, status) {
			feedbackSpan.innerHTML = "Processing data...";
			// Handle back data load
			if (!status=="success") {
				var errorMsg = "Error loading data: " + status;
				feedbackSpan.innerHTML = errorMsg;
				return;
			}
			
			// Slice off "google.visualization.Query.setResponse(" from front and ");" from end
			data = data.slice(47, -2);
			// Convert data from a string to a JavaScript object
			data = JSON.parse(data);
			// Ignore metadata and column definitions
			data = data.table.rows;
			// Remove redundant entries
			var middleRow = (data.length - 41) / 2 + 41;
			data = data.slice(0, middleRow);
			// Save data for later
			tableData = data;
			alert(tableData[0].c[0].v);
			data = processData(data, displayMethod);
			feedbackSpan.innerHTML = data;
		}
	);
}


/**
* Decide which function to pass data to
*/
function processData(data, displayMethod) {
	switch (displayMethod) {
		case "bracket" : return bracketizeResponse(data);
			break;
		case "table" : return tablefyResponse(data);
			break;
		default : return data;
	}
}


/**
* Turn raw data into rich data with pictures embedded
*/
function bracketizeResponse(data) {
	var tableStr = "<table><tr><th>Card</th><th>Round 1 batch</th><th>Round 1 opponent</th><th>Round 1 score</th><th>Round 2 batch</th><th>Round 2 opponent</th><th>Round 2 score</th></tr>";
	for (var row in data) {
		tableStr += "<tr>";
		row = data[row].c;
		for (let col in row) {
			item = row[col];
			element = "<td>";
			if (col==0 || col==2 || col==5) {
				cardName = (item==null || item.v==null) ? "" : item.v.toString();
				cardName = cardName.replace("'", "");
				source = "http://gatherer.wizards.com/Handlers/Image.ashx?name=" + cardName + "&type=card";
				element += "<a href='" + source + "'><img src='" + source + "' alt='" + cardName + "'></a>";
			}
			else if (col==3) {
				element += (item==null || item.f==null) ? "" : item.f.toString();
			}
			else {
				element += (item==null || item.v==null) ? "" : item.v.toString();
			}
			element += "</td>";
			tableStr += element;
		}
		tableStr += "</tr>";
	}
	tableStr += "</table>";
	return tableStr;
}


/**
* Turn raw data into an html table
*/
function tablefyResponse(data) {
	var tableStr = "<table>";
	for (var row in data) {
		tableStr += "<tr>";
		row = data[row].c;
		for (var col in row) {
			col = row[col];
			tableStr += "<td>";
			tableStr += (col==null || col.v==null) ? "" : col.v.toString();
			tableStr += "</td>";
		}
		tableStr += "</tr>";
	}
	tableStr += "</table>";
	return tableStr;
}
