/*
TODOs: 
Done: 
Time: 8 hrs
Note: The seed of this page was my initial try at implementing Magic in a browser.
*/

// UNUSED
var hand1=[], hand2=[], deck2=[];
var life1=0; life2=0;
// Globals 
var cardPool1 = [];
var deck1 = [];
var status = "";
var cardWidth = 100;
var cardHeight = 140;
var canvas_cardPoolTop = null;
var canvas_deck = null;
var canvas_bottomHand = null;
var canvas_cardZoom = null;
var cardPoolTop = null;
var deck = null;
var bottomHand = null;
var cardZoom = null;
var text_status = null;

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
 * Links display variables to the DOM. Creates and displays random card pool.
 */
function setUpGame() {
	// Link drawing space variables to the DOM 
	canvas_cardPoolTop = document.getElementById("cardPool");
	cardPoolTop = canvas_cardPoolTop.getContext("2d");
	cardPoolTop.font = "10px Arial";
	canvas_deck = document.getElementById("deck");
	deck = canvas_deck.getContext("2d");
	deck.font = "10px Arial";
	canvas_bottomHand = document.getElementById("bottomHand");
	bottomHand = canvas_bottomHand.getContext("2d");
	bottomHand.font = "10px Arial";
	canvas_cardZoom = document.getElementById("cardzoom");
	cardZoom = canvas_cardZoom.getContext("2d");
	// Link text display variables to the DOM
	text_player1 = document.getElementById("player1_txt");
	text_player2 = document.getElementById("player2_txt");
	text_status = document.getElementById("status_txt");
	// Register mouse events
	canvas_cardPoolTop.addEventListener("click", function(){ handleScreenClick(canvas_cardPoolTop, event, cardPool1, deck1); });
	canvas_cardPoolTop.addEventListener("mousemove", function(){ handleMouseHover(canvas_cardPoolTop, event, cardPool1); });
	canvas_deck.addEventListener("click", function(){ handleScreenClick(canvas_deck, event, deck1, cardPool1); });
	canvas_deck.addEventListener("mousemove", function(){ handleMouseHover(canvas_deck, event, deck1); });
	// (No need to register a click event for the hand)
	canvas_bottomHand.addEventListener("mousemove", function(){ handleMouseHover(canvas_bottomHand, event, hand1); });
	// Placeholder text for the cardZoom canvas
	cardZoom.strokeRect(0, 0, canvas_cardZoom.width, canvas_cardZoom.height);
	cardZoom.fillText("Hover over a card to display it here", 28, 150);
	// Other necessary setup items
	updateStatus("Creating card pool...");
	createCardPool();
	updateStatus("Sorting card pool...");
	//sortCardPool(cardPool1);
	updateStatus("Displaying card pool...");
	displayEverything();
	updateStatus("Card pool ready. Feel free to start choosing cards for your deck.");
}

/**
 * Fills the cardPool variables (currently cardPool1).
 */
function createCardPool() {
	// Currently unused
	low = 423668;
	hi = 423850;
	
	// Add the prerelease promo card (randomly selected rare or mythic)
	var cardPool = AER;
	var promoPool = cardPool.mythicPool.concat(cardPool.rarePool);
	var promoCard = getIndividualCard(promoPool, "Promo");
	cardPool1.push(promoCard);
	// Create 4 packs from small set
	for (var i=0; i<4; i++) {
		cardPool1 = cardPool1.concat( createPack(cardPool) );
	}
	// Create 2 packs from large set
	var cardPool = KLD;
	for (var i=0; i<2; i++) {
		cardPool1 = cardPool1.concat( createPack(cardPool) );
	}
}

/**
 * Reads the desired card pool from a JSON file.
 */
function readCardPool(setName) {
	var cardPool = null;
	$.getJSON(
		"sets/" + setName + ".json", 
		function(json) { cardPool = json; }
	);
	//var cardPool = require("./sets/" + setName + ".json");
	return cardPool;
}

/**
 * Returns a pack of cards from the given cardPool.
 */
function createPack(cardPool, isPromoPack=false) {
	var pack = [];
	// Add the prerelease promo card, if applicable
	if (isPromoPack) {
		var promoPool = cardPool.mythicPool.concat(cardPool.rarePool);
		pack.push( getIndividualCard(promoPool, "Promo") );
	}
	// Add a single rare
	var rareIsMythic = Math.random() > 0.875;
	if (rareIsMythic) {
		pack.push( getIndividualCard(cardPool.mythicPool, "Mythic") );
	} else {
		pack.push( getIndividualCard(cardPool.rarePool, "Rare") );
	}
	// Add 3 uncommons
	for (var i=0; i<3; i++) {
		pack.push( getIndividualCard(cardPool.uncommonPool, "Uncommon") );
	}
	// Add 9-10 commons
	var numCommons = isPromoPack ? 9 : 10;
	for (var i=0; i<numCommons; i++) {
		pack.push( getIndividualCard(cardPool.commonPool, "Common") );
	}
	return pack;
}

/**
 * Returns a single card from any arbitrary card pool.
 */
function getIndividualCard(cardPool, rarity) {
	var card = cardPool[Math.floor(Math.random() * cardPool.length)];
	card = JSON.parse(JSON.stringify(card)); // Create copy
	card.rarity = rarity;
	return card;
}

/**
 * Removes the top card from deck and adds it to hand. If deck is an empty array, then 
 * player loses instead.
 * @param deck An array of card objects
 * @param hand Another array of card objects
 */
function drawCardFromLibrary(deck, hand, player) {
	if(deck.length == 0) { // deck is empty
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
	// Recalculate canvas sizes
	var numRows = Math.floor(cardPool1.length / 8) + 1;
	canvas_cardPoolTop.height = (cardHeight + 4) * numRows + 2;
	numRows = Math.floor(deck1.length / 8) + 1;
	canvas_deck.height = (cardHeight + 4) * numRows + 2;
	// Clear everything
	cardPoolTop.clearRect(0, 0, canvas_cardPoolTop.width, canvas_cardPoolTop.height);
	deck.clearRect(0, 0, canvas_deck.width, canvas_deck.height);
	bottomHand.clearRect(0, 0, canvas_bottomHand.width, canvas_bottomHand.height);
	// Display cardPoolTop
	var row = -1;
	for (var card=0; card<cardPool1.length; card++) {
		if (card%8 == 0)
			row++;
		var leftBorder = (cardWidth + 4) * (card%8) + 2;
		var topBorder = (cardHeight + 4) * row + 2;
		cardPool1[card].cardArea = getCardArea(leftBorder, topBorder);
		displayCard(cardPool1[card], cardPoolTop, leftBorder, topBorder);
	}
	// Display deck1
	row = -1;
	for (var card=0; card<deck1.length; card++) {
		if (card%8 == 0)
			row++;
		var leftBorder = (cardWidth + 4) * (card%8) + 2;
		var topBorder = (cardHeight + 4) * row + 2;
		deck1[card].cardArea = getCardArea(leftBorder, topBorder);
		displayCard(deck1[card], deck, leftBorder, topBorder);
	}
	// Display bottomHand
	for (var card=0; card<hand2.length; card++) {
		var leftBorder = 103 * card + 2;
		var topBorder = 2;
		hand2[card].cardArea = getCardArea(leftBorder, topBorder);
		displayCard(hand2[card], bottomHand, leftBorder, topBorder);
	}
}

/**
 * Returns an object that represents the area a card covers relative to its containing 
 * canvas.
 */
function getCardArea(leftBorder, topBorder) {
    return {left:leftBorder, right:leftBorder+cardWidth, top: topBorder, bottom: topBorder+cardHeight};
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
	if(card.subtype)
		var fullType = card.type + " - " + card.subtype;
	else 
		var fullType = card.type;
	drawSpace.fillText(fullType, leftBorder+3, topBorder+27);
	// abilities
	drawSpace.fillText(card.abilities, leftBorder+3, topBorder+40);
	// p/t
	if(card.type == "Creature") {
		p_t = card.power.toString() + "/" + card.toughness.toString();
		drawSpace.fillText(p_t, leftBorder+80, topBorder+95);
	}
	*/
	/*****  Then, display the card nicely using gatherer *****/
	var cardImg = new Image();
	cardImg.src = "http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" + card.mvid + "&type=card";
	cardImg.onload = function() { 
		drawSpace.drawImage(cardImg, leftBorder, topBorder, cardWidth, cardHeight);
		if (card.rarity=="Promo") {
			drawSpace.strokeStyle = "White";
			drawSpace.strokeText("Promo Card", leftBorder+35, topBorder+75);
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
 * Draws a card from the appropriate deck, then redraws everything.
 */
function button_drawCard(deck, hand, player) {
	drawCardFromLibrary(deck, hand, player);
	displayEverything();
}

/**
 * If the click was on a card in hand1 or hand2, then it is removed from that hand and 
 * added to the battlefield.
 */
function handleScreenClick(canvas, event, cardCollectionSrc, cardCollectionDest) {
	// Catch right click
	if(event.button == 2) {
		event.preventDefault();
		alert("");
		return;
	}
	var pointerPos = getPointerPositionOnCanvas(canvas, event);
	var cardIdx = getCardByCoordinates(pointerPos.x, pointerPos.y, cardCollectionSrc);
	if(cardIdx == null)
		return;
	card = cardCollectionSrc.splice(cardIdx, 1)[0];
	cardCollectionDest.push(card);
	displayEverything();
}

/**
 * If user is hovering over a card, then zoom in on the card.
 */
function handleMouseHover(canvas, event, cardCollection) {
	// Get card to display
	var pointerPos = getPointerPositionOnCanvas(canvas, event);
	var cardIdx = getCardByCoordinates(pointerPos.x, pointerPos.y, cardCollection);
	if(cardIdx == null)
		return;
	var card = cardCollection[cardIdx];
	cardStr = JSON.stringify(card);
	// Draw the card in the zoom box
	cardZoom.fillText(card.name, 3, 150);
	var cardImg = new Image();
	cardImg.src = "http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" + card.mvid + "&type=card";
	cardImg.onload = function() {
		cardZoom.drawImage(cardImg, 0, 0, canvas_cardZoom.width, canvas_cardZoom.height);
		if (card.rarity=="Promo") {
			var oldFont = cardZoom.font;
			cardZoom.font = "20px Arial";
			cardZoom.strokeStyle = "White";
			cardZoom.strokeText("Promo Card", 95, 170);
			cardzoom.font = oldFont;
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
		if(x>=cardArea.left && x<=cardArea.right && y>=cardArea.top && y<=cardArea.bottom)
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
	if(player == 1) {
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
 * Displays a lose message for the given player. Removes all action buttons (to prevent 
 * weird game states).
 * @param var player The player who lost (a number)
 */
function loseGame(player) {
    alert("Player " + player.toString() + " has lost the game!");
	$("#player1_draw").remove();
	$("#player1_shuffle").remove();
	$("#player2_draw").remove();
	$("#player2_shuffle").remove();
}

/**
 * Description.
 * @param var Description
 * @return var Description
 */
function template(variable) {
	alert(JSON.stringify(card));
}

