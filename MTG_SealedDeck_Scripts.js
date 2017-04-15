/*
TODOs: 
	Allow user-defined sorting
		Fix alphabetical sort (only works with 2 sort options)
		Add groupings
		Link options (make selection from sort 1 modify options for sort 2)
	Support 2HG
	Deckbuilding stats
		Display updated stats live
		Card count, Mana curve, Color info
	Store additional card info
		Display below cardZoom
	Mobile support
		Card popup on long press
		Adapt card size and canvas size for card pool and deck
Done: 
	Store additional card info
		Get color
	Allow user-defined sorting
	Hand similator
		Add basic lands
		Draw opening hands
		Don't keep cards in hand when modifying deck
		Display cardpool correctly after viewing hand
		Add mulligan button
		Add "Draw New Hand" button
	Why does page sometime give "Wait" prompt? (This went away by itself)
	Change verbiage from draft to sealed
Time: 80 hrs
Note: The seed of this project was my initial attempt at implementing Magic in a browser.
*/

// UNUSED
var hand2=[], deck2=[];
// Globals 
var insertPos = 1;
var cardPool1 = [];
var deck1 = [];
var deck1_Cache = [];
var hand1 = [];
var mulliganVal1 = 7;
var status = "";
var cardWidth = 100;
var cardHeight = 140;
var canvas_cardPool1 = null;
var canvas_deck1 = null;
var canvas_hand1 = null;
var canvas_cardZoom = null;
var context_cardPool1 = null;
var context_deck1 = null;
var context_hand1 = null;
var context_cardZoom = null;
var cardPoolFilter1 = null;
var cardPoolFilter2 = null;
var deck1Filter1 = null;
var deck1Filter2 = null;
var text_status = null;
// Handy definition
function isNumber(str) { return !isNaN(str) || str=='X'; }

// Set up the game once the page has loaded
$(document).ready(setUpGame);

// Diplay ajax error messages nicely
$(document).ajaxError(function(event) {
    $("#test_txt").text("An error occurred: " + event);
});

/**
 * Currently:
 * Tries an ajax call to gatherer.
 */
function testFunction() {
	$("#test_txt").text("Running test...");
	$.ajax({url: "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=423769", 
		success: function(result){$("#test_txt").text(result)
	}});
}

/**
 * Links display variables to the DOM. Creates and displays card pool of random cards. 
 * Currently, this is called when the page loads: "$(document).ready(setUpGame);"
 */
function setUpGame() {
	// Link drawing space variables to the DOM 
	canvas_cardPool1 = document.getElementById("cardPool");
	context_cardPool1 = canvas_cardPool1.getContext("2d");
	context_cardPool1.font = "10px Arial";
	canvas_deck1 = document.getElementById("deck");
	context_deck1 = canvas_deck1.getContext("2d");
	context_deck1.font = "10px Arial";
	canvas_hand1 = document.getElementById("hand");
	context_hand1 = canvas_hand1.getContext("2d");
	context_hand1.font = "10px Arial";
	canvas_cardZoom = document.getElementById("cardZoom");
	context_cardZoom = canvas_cardZoom.getContext("2d");
	// Link text display variables to the DOM
	text_player1 = document.getElementById("player1_txt");
	text_player2 = document.getElementById("player2_txt");
	text_status = document.getElementById("status_txt");
	// Link dropdowns to the DOM
	cardPoolFilter1 = document.getElementById("cardPoolFilter1");
	cardPoolFilter2 = document.getElementById("cardPoolFilter2");
	deck1Filter1 = document.getElementById("deck1Filter1");
	deck1Filter2 = document.getElementById("deck1Filter2");
	// Register mouse events
	canvas_cardPool1.addEventListener("click", function(){ 
		handleScreenClick(canvas_cardPool1, event, cardPool1, deck1); });
	canvas_cardPool1.addEventListener("mousemove", function(){ 
		handleMouseHover(canvas_cardPool1, event, cardPool1); });
	canvas_deck1.addEventListener("click", function(){ 
		handleScreenClick(canvas_deck1, event, deck1, cardPool1); });
	canvas_deck1.addEventListener("mousemove", function(){ 
		handleMouseHover(canvas_deck1, event, deck1); });
	// (No need to register a click event for the hand)
	canvas_hand1.addEventListener("mousemove", function(){ 
		handleMouseHover(canvas_hand1, event, hand1); });
	// Placeholder text for the cardZoom canvas
	context_cardZoom.strokeRect(0, 0, canvas_cardZoom.width, canvas_cardZoom.height);
	context_cardZoom.fillText("Hover over a card to display it here", 28, 150);
	// Other necessary setup items
	updateStatus("Creating card pool...");
	createCardPool();
	//updateStatus("Sorting card pool...");
	//sortCardPool(cardPool1);
	updateStatus("Displaying card pool...");
	displayEverything();
	updateStatus("Card pool ready. Feel free to start choosing cards for your deck.");
}

/**
 * Fills the cardPool variables (currently cardPool1).
 */
function createCardPool() {
	// Add the prerelease promo card (randomly selected rare or mythic)
	var cardPool = AER;
	var promoPool = cardPool.mythicPool.concat(cardPool.rarePool);
	var promoCard = getIndividualCard(promoPool, "Promo", insertPos);
	cardPool1.push(promoCard);
	// Create 4 packs from small set
	for (var i=0; i<4; i++) {
		cardPool1 = cardPool1.concat( createPack(cardPool) );
	}
	// Create 2 packs from large set
	cardPool = KLD;
	for (var i=0; i<2; i++) {
		cardPool1 = cardPool1.concat( createPack(cardPool) );
	}
}

/**
 * Grabs the card pools from already-included .js files, and adds colors to the cards.
 * [CURRENTLY UNUSED]
 */
function readCardPools() {
	var cardSets = [KLD, AER];
	for (var set in cardSets) {
		for (var card in set) {
			card.color = getColor(card.manaCost);
		}
	}
	return cardSets;
}

/**
 * Returns a pack of cards from the given cardPool.
 */
function createPack(cardPool, isPromoPack=false) {
	var pack = [];
	// Add the prerelease promo card, if applicable
	if (isPromoPack) {
		var promoPool = cardPool.mythicPool.concat(cardPool.rarePool);
		pack.push( getIndividualCard(promoPool, "Promo", insertPos) );
	}
	// Add a single rare
	insertPos++;
	var rareIsMythic = Math.random() > 0.875;
	if (rareIsMythic) {
		pack.push( getIndividualCard(cardPool.mythicPool, "Mythic", insertPos) );
	} else {
		pack.push( getIndividualCard(cardPool.rarePool, "Rare", insertPos) );
	}
	// Add 3 uncommons
	for (var i=0; i<3; i++) {
		insertPos++;
		pack.push( getIndividualCard(cardPool.uncommonPool, "Uncommon", insertPos) );
	}
	// Add 9-10 commons
	var numCommons = isPromoPack ? 9 : 10;
	for (var i=0; i<numCommons; i++) {
		insertPos++;
		pack.push( getIndividualCard(cardPool.commonPool, "Common", insertPos) );
	}
	return pack;
}

/**
 * Returns a single card from any arbitrary card pool.
 */
function getIndividualCard(cardPool, rarity, insertPos) {
	var card = cardPool[Math.floor(Math.random() * cardPool.length)];
	card = JSON.parse(JSON.stringify(card)); // Create copy
	card.rarity = rarity;
	card.color = getColor(card.manaCost);
	card.packOpenOrder = insertPos;
	return card;
}

/**
 * Removes the top card from deck and adds it to hand. If deck is an empty array, then 
 * player loses instead.
 * @param deck An array of card objects
 * @param hand Another array of card objects
 */
function drawCardFromLibrary(deck, hand, player) {
	if (deck.length == 0) { // deck is empty
		alert("Player " + player.toString() + " tried to draw from an empty library.");
		loseGame(player);
	}
	else
		hand.push(deck.pop());
}

/**
 * Displays all cards in hand1, hand2, deck1, and deck2 and defines 
 * cardArea for each card displayed. Also updates playerInfo for each player.
 */
function displayEverything() {
	displayCardPool1();
	var button_showHand = document.getElementById("show_hand");
	if (button_showHand.innerHTML == "Modify Deck")
		displayHand1()
	else
		displayDeck1();
}

/**
 * Displays all cards in cardPool and defines cardArea for each card displayed.
 */
function displayCardPool1() {
	displayOneCanvas(canvas_cardPool1, context_cardPool1, cardPool1);
}

/**
 * Displays all cards in deck1 and defines cardArea for each card displayed.
 */
function displayDeck1() {
	displayOneCanvas(canvas_deck1, context_deck1, deck1);
}

/**
 * Displays all cards in hand1 and defines cardArea for each card displayed.
 */
function displayHand1() {
	displayOneCanvas(canvas_hand1, context_hand1, hand1);
	updatePlayerInfo(1);
}

/**
 * Displays all cards in collection and defines cardArea for each card displayed.
 */
function displayOneCanvas(canvas, context, collection) {
	// Recalculate canvas size
	var numRows = Math.ceil(collection.length / 8);
	// Make sure that an empty row is displayed for an empty collection
	numRows = (numRows == 0) ? 1 : numRows;
	canvas.height = (cardHeight + 4) * numRows + 2;
	// Clear canvas
	context.clearRect(0, 0, canvas.width, canvas.height);
	// Display collection
	var row = -1;
	for (var card=0; card<collection.length; card++) {
		if (card%8 == 0)
			row++;
		var leftBorder = (cardWidth + 4) * (card%8) + 2;
		var topBorder = (cardHeight + 4) * row + 2;
		collection[card].cardArea = getCardArea(leftBorder, topBorder);
		displayCard(collection[card], context, leftBorder, topBorder);
	}
}

/**
 * Returns an object that represents the area a card covers relative to its containing 
 * canvas.
 */
function getCardArea(leftBorder, topBorder) {
    return {left:leftBorder, 
		right:leftBorder+cardWidth, 
		top: topBorder, 
		bottom: topBorder+cardHeight};
}

/**
 * Displays a card on the given drawSpace.
 * @param card A card object
 * @param drawSpace The canvas context where the card should be displayed
 * @param leftBorder {number} Number of pixels to the right of the left canvas edge
 * @param topBorder {number} Number of pixels below the top canvas edge
 */
function displayCard(card, drawSpace, leftBorder, topBorder) {
	/*****  First, draw the card in text form (as placholder) *****/
	// blank out the drawing space
	drawSpace.clearRect(leftBorder, topBorder, cardWidth, cardHeight);
	//// Draw placholder text  ////
	// border
	drawSpace.strokeRect(leftBorder, topBorder, cardWidth, cardHeight);
	// name
	drawSpace.fillText(card.name, leftBorder+3, topBorder+10);
	// cost
	/*
	drawSpace.fillText(card.cost, leftBorder+76, topBorder+10);
	// type - subtype
	if (card.subtype)
		var fullType = card.type + " - " + card.subtype;
	else 
		var fullType = card.type;
	drawSpace.fillText(fullType, leftBorder+3, topBorder+27);
	// abilities
	drawSpace.fillText(card.abilities, leftBorder+3, topBorder+40);
	// p/t
	if (card.type == "Creature") {
		p_t = card.power.toString() + "/" + card.toughness.toString();
		drawSpace.fillText(p_t, leftBorder+80, topBorder+95);
	}
	*/
	/*****  Then, display the card nicely using gatherer *****/
	var cardImg = new Image();
	cardImg.src = "http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" 
		+ card.mvid + "&type=card";
	cardImg.onload = function() { 
		drawSpace.drawImage(cardImg, leftBorder, topBorder, cardWidth, cardHeight);
		if (card.rarity == "Promo") {
			var strokeStyle = drawSpace.strokeStyle;
			drawSpace.strokeStyle = "White";
			drawSpace.strokeText("Promo Card", leftBorder+35, topBorder+75);
			drawSpace.strokeStyle = strokeStyle;
		}
	};
}

/**
 * Randomizes the cards in the deck, then returns it for convenience.
 * @param deck An array of card objects
 * @return deck The shuffled deck of cards
 */
function shuffle(deck) {
	for (var i=deck.length-1; i>0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = deck[i];
		deck[i] = deck[j];
		deck[j] = temp;
	}
	return deck;
}


/**********************************/
/*******   Event Handling   *******/
/**********************************/

/**
 * Handle a button click for one of the sorting buttons.
 */
function button_sortCards(collectionStr) {
	if (collectionStr == "cardPool1") {
		sortCards(cardPool1, collectionStr, cardPoolFilter1, cardPoolFilter2);
	}
	if (collectionStr == "deck1") {
		sortCards(deck1, collectionStr, deck1Filter1, deck1Filter2);
	}
}

/**
 * Sorts a collection and redraws it on canvas (cardPool and deck1 are the collections).
 */
function sortCards(collection, collectionStr, filter1, filter2) {
	// Set the values of sort1 and sort for each card in the collection
	var sortVal = filter1.value;
	collection.forEach(function(card) { card.sort1 = getSortVal(card, sortVal); });
	sortVal = filter2.value;
	collection.forEach(function(card) { card.sort2 = getSortVal(card, sortVal); });
	// Sort the cards, using the compareCards function to compare 2 cards
	collection.sort(function(card1, card2){ return compareCards(card1, card2); });
	// Redraw the sorted collection
	if (collectionStr == "deck1")
		displayDeck1();
	else
		displayCardPool1();
}

/**
 * Sets the sort property for a card. sortVal is a string pulled from a DOM dropdown, 
 * and the card is "this".
 * NOTE: This is a helper for the sortCards function.
 */
function getSortVal(card, sortVal) {
	if (sortVal == "color") {
		var colorSortDict = {"C":1, "W":2, "U":3, "B":4, "R":5, "G":6, "M":7};
		// Make lands sort to the end
		if (card.types.includes("Land"))
			return 10;
		else
			return colorSortDict[card.color];
	}
	else if (sortVal == "cmc") {
		return card.cmc;
	}
	else if (sortVal == "types") {
		// Modify type line to sort more like players would want
		var typeLine = card.types;
		if (typeLine.includes("Legendary"))
			typeLine = typeLine.slice(10); // slice off "Legendary" from front
		if (typeLine.includes("Creature")) {
			if (typeLine.includes("Artifact"))
				typeLine = "Artifact Creature";
			else
				typeLine = "Creature";
		}
		return typeLine;
	}
	else if (sortVal == "rarity") {
		var raritySortDict = {"Promo":1, "Mythic":1, "Rare":2, "Uncommon":3, 
			"Common":4, "BasicLand":5};
		return raritySortDict[card.rarity];
	}
	// sortVal is not set, meaning the user didn't select a value from the dropdown
	else {
		// Returning 0 ensures that this sort will result in zero for all comparisons
		return 0;
	}
}

/**
 * Compares 2 cards.
 * NOTE: This is a helper for the sortCards function.
 */
function compareCards(card1, card2) {
	//return card1.color.localeCompare(card2.color);
	var comparison = 0;
	if (typeof(card1.sort1) == "string")
		comparison = card1.sort1.localeCompare(card2.sort1);
	else
		comparison = card1.sort1 - card2.sort1;
	if (comparison == 0) { // The first sort compared equal
		if (typeof(card1.sort2) == "string")
			comparison = card1.sort2.localeCompare(card2.sort2);
		else
			comparison = card1.sort2 - card2.sort2;
	}
	// Sort cards alphabetically, after all other sorts
	if (comparison == 0) { // The cards still sort completely the same
		comparison = card1.name.localeCompare(card2.name);
	}
	return comparison;
}

/**
 * Draws a card from the appropriate deck, then displays the hand.
 */
function button_drawCard(deck, hand, player) {
	drawCardFromLibrary(deck, hand, player);
	displayHand1();
}

/**
 * If the click was on a card in cardCollectionSrc, then it is removed from the source 
 * and added to cardCollectionDest.
 */
function handleScreenClick(canvas, event, cardCollectionSrc, cardCollectionDest) {
	// Catch right click
	if (event.button == 2) {
		event.preventDefault();
		alert("");
		return;
	}
	var pointerPos = getPointerPositionOnCanvas(canvas, event);
	var cardIdx = getCardByCoordinates(pointerPos.x, pointerPos.y, cardCollectionSrc);
	if (cardIdx == null)
		return;
	card = cardCollectionSrc.splice(cardIdx, 1)[0];
	cardCollectionDest.push(card);
	displayEverything();
}

/**
 * If user is hovering over a card, then display the card in the cardZoom pane.
 */
function handleMouseHover(canvas, event, cardCollection) {
	// Get card to display
	var pointerPos = getPointerPositionOnCanvas(canvas, event);
	var cardIdx = getCardByCoordinates(pointerPos.x, pointerPos.y, cardCollection);
	if (cardIdx == null)
		return;
	var card = cardCollection[cardIdx];
	cardStr = JSON.stringify(card);
	// Draw the card in the zoom box
	context_cardZoom.fillText(card.name, 3, 150);
	var cardImg = new Image();
	cardImg.src = "http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" 
		+ card.mvid + "&type=card";
	cardImg.onload = function() {
		context_cardZoom.drawImage(cardImg, 0, 0, canvas_cardZoom.width, canvas_cardZoom.height);
		if (card.rarity == "Promo") {
			var oldFont = context_cardZoom.font;
			context_cardZoom.font = "20px Arial";
			context_cardZoom.strokeStyle = "White";
			context_cardZoom.strokeText("Promo Card", 95, 170);
			context_cardZoom.font = oldFont;
		}
	};
}

/**
 * Returns the index of the card in cardCollection that was clicked, or null if no card 
 * was clicked.
 * @param x The x variable from pointerPosition
 * @param y The y variable from pointerPosition
 * @param cardCollection The set of card objects to iterate over, each of which should 
 *            have a proper cardArea property defined
 */
function getCardByCoordinates(x, y, cardCollection) {
	for (var cardIdx=0; cardIdx<cardCollection.length; cardIdx++) {
		cardArea = cardCollection[cardIdx].cardArea;
		if (x>=cardArea.left && x<=cardArea.right 
			&& y>=cardArea.top && y<=cardArea.bottom)
			return cardIdx;
	}
	return null;
}

/**
 * Updates player stats for the given player. If nothing is passed, then this updates 
 * both players.
 * @param player A number representing player1 or player2
 */
function updatePlayerInfo(player=null) {
	if (!player) {
		updatePlayerInfo(1);
		updatePlayerInfo(2);
		return;
	}
	if (player == 1) {
		var newText = "Player 1";
		newText += "  |  Cards in hand: " + hand1.length;
		newText += "  |  Cards in deck: " + deck1.length;
		$("#player1_txt").text(newText);
	}
	else {
		var newText = "Player 2";
		newText += "  |  Cards in hand: " + hand2.length;
		newText += "  |  Cards in deck: " + deck2.length;
		$("#player2_txt").text(newText);
	}
}

/**
 * Adds numOfEachLand of each basic land to cardPool, then redraws cardPool.
 * NOTE: BasicLands was defined in "sets/BasicLands.js", which was inserted in <head>.
 */
function showLands(numOfEachLand=9) {
	// Remove the "Show Lands" button
	$("#show_lands").remove();
	// Build up a land array, then append it to the cardPool array
	var lands = [];
	for (landType=0; landType<BasicLands.length; landType++) {
		// Make a 1-element array with this land type, for getIndividualCard() to consume
		var thisLandType = [BasicLands[landType]];
		for (var i=0; i<numOfEachLand; i++) {
			insertPos++;
			lands.push( getIndividualCard(thisLandType, "BasicLand", insertPos) );
		}
	}
	cardPool1 = cardPool1.concat(lands);
	displayCardPool1();
}

/**
 * Shows the hidden hand elements, and displays a 7 card opener.
 */
function showHand() {
	$(".hand").show();
	var button_showHand = document.getElementById("show_hand");
	button_showHand.innerHTML = "Modify Deck";
	button_showHand.onclick = function(){ modifyDeck(); };
	$(".deck").hide();
	deck1_Cache = deck1.slice(); // Store copy for later
	shuffle(deck1);
	drawOpeningHands();
	displayHand1();
}

/**
 * Returns the user from the hand display feature to the deck building feature.
 */
function modifyDeck() {
	$(".hand").hide();
	var button_showHand = document.getElementById("show_hand");
	button_showHand.innerHTML = "Show Hand";
	button_showHand.onclick = function(){ showHand(); };
	deck1 = deck1.concat(hand1);
	// deck1_Cache should evaluate true under normal circumstances; I'm being defensive
	if (deck1_Cache)
		deck1 = deck1_Cache;
	hand1 = [];
	$(".deck").show();
	displayCardPool1();
}

/**
 * Shuffles hand back into deck, then displays a 7 card opener.
 */
function newHand(player, mulligan=false) {
	if (player==1) {
		deck1 = deck1.concat(hand1);
		hand1 = [];
		shuffle(deck1);
		drawOpeningHands(mulligan);
		displayHand1();
	}
}

/**
 * Draws the top 7 cards of each deck by calling drawCardFromLibrary() 7 times for each 
 * deck / hand.
 * NOTE: This is a helper for the showHand function.
 */
function drawOpeningHands(mulligan=false) {
	if (mulligan)
		mulliganVal1--;
	else
		mulliganVal1 = 7;
	if (deck1.length >= mulliganVal1) {
		for (var i=0; i<mulliganVal1; i++) {
			drawCardFromLibrary(deck1, hand1, 1);
		}
	}
	else
		alert("Warning: Deck 1 has too few cards for an opening hand.");
	if (deck2.length > 6) {
		for (var i=0; i<7; i++) {
			drawCardFromLibrary(deck2, hand2, 2);
		}
	}
	// else
		// alert("Warning: Deck 2 has too few cards for an opening hand.");
}

/**
 * Updates the current status message. If overWrite is true (or not passed), then status 
 * is replaced with newStatus. Otherwise, newStatus is appended to the end of status.
 * @param newStatus The new status to display
 * @param overWrite (optional) Pass false to append this message to existing messages
 */
function updateStatus(newStatus, overWrite=true) {
	if (overWrite)
		status = newStatus;
	else
		status += newStatus;
	$("#status_txt").text("Status: " + status);
}


/**********************************/
/***********   Helpers   **********/
/**********************************/

/**
 * Returns an object with the x and y coordinates, as related to canvas.
 * @param canvas The canvas that detected the click
 * @param event The onclick event
 */
function getPointerPositionOnCanvas(canvas, event) {
    var boundingRect = canvas.getBoundingClientRect();
    var xPos = event.clientX - boundingRect.left;
    var yPos = event.clientY - boundingRect.top;
    return {x:xPos, y:yPos};
}

/**
 * Returns an object's color, based on it's mana cost.
 * @param String manaCost
 * @return String color
 */
function getColor(manaCost) {
	// Handle lands
	if (manaCost.length == 0)
		return "C";
	// Reverse string, in order to process it right-to-left more intuitively
	manaCost = manaCost.split("").reverse().join("");
	var color = manaCost[0];
	if (isNumber(color)) { 
		// 1st char is a number, so return colorless
		return "C";
	}
	else {
		if ( manaCost.length == 1 || isNumber(manaCost[1]) || color==manaCost[1] )
			return color;
		else 
			return "M";
	}
}

/**
 * Returns the full name of a color, given a one-character color indicator.
 * NOTE: This should probably be re-implemented as an object.
 * @param String color A single-character color indicator (ie, 'G' -> "Green")
 * @return String fullColor The full color name associated with the given color indicator
 */
function getFullColor(color) {
	switch (color) {
		// There is no need to break after each case, because they all return
		case "C" : return "Colorless";
		case "W" : return "White";
		case "U" : return "Blue";
		case "B" : return "Black";
		case "R" : return "Red";
		case "G" : return "Green";
		case "M" : return "Multicolor";
		case "H" : return "Hybrid";
		default  : return "(No color information)";
	}
}

/**
 * Description.
 * @param var Description
 * @return var Description
 */
function template(variable) {
	alert(JSON.stringify(card));
}

