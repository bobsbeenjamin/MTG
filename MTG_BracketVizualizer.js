
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
			
			// Slice off "google.visualization.Query.setResponse(" from front
			data = data.slice(47);
			// Slice off ");" from end
			data = data.slice(0, -2);
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
			data = tablefyResponse(data);
			feedbackSpan.innerHTML = data;
		}
	);
}

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
