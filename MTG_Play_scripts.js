/*
TODOs:
	Set up decks
		Mulligan
	DOM/Graphics
		Wrap text on abilities
		Show tapped cards sideways
		Ensure that cards show on setup
		Hover to zoom
	Play cards
		Seperate lands from spells on battlefield
		Pay for spells
		Ensure one-land-per-turn
	Combat
		Attack
		Block
		Damage
		Summoning sickness
	Evergreen keywords
		Flying
		Trample
		First Strike
	New keywords
		Vehicles
		Energy
	Zone changes
		Show graveyards
		Set triggers on zone changes
	Misc
		Read decks from file
		Enforce turns
			Phases and steps
Done:
	Set up decks
		Create data
		Shuffle decks
		Draw hands
		Temp display cards
		Display cards
	DOM/Graphics
		Add shuffle button
		Display life totals and cards in hand/deck
	Play cards
		Play lands
		Cast spells
		Arrange cards on battlefield
	Misc
		Player loses
Time: 15 hrs
*/

// Globals 
deck1 = [];
deck2 = [];
hand1 = [];
hand2 = [];
battlefield1 = [];
battlefield2 = [];
life1 = 20;
life2 = 20;
cardWidth = 100;
cardHeight = 100;
canvas_topHand = null;
canvas_bottomHand = null;
canvas_battlefield = null;
canvas_cardZoom = null;
topHand = null;
bottomHand = null;
battlefield = null;
cardZoom = null;
text_player1 = null;
text_player2 = null;

// Set up the game once the page has loaded
$(document).ready(setUpGame);

/**
 * Links display variables to the DOM. Shuffles both decks. Displays both opening hands.
 */
function setUpGame() {
	// Link drawing space variables to the DOM 
	canvas_topHand = document.getElementById("topHand");
	topHand = canvas_topHand.getContext("2d");
	topHand.font = "10px Arial";
	canvas_bottomHand = document.getElementById("bottomHand");
	bottomHand = canvas_bottomHand.getContext("2d");
	bottomHand.font = "10px Arial";
	canvas_battlefield = document.getElementById("battlefield");
	battlefield = canvas_battlefield.getContext("2d");
	battlefield.font = "10px Arial";
	canvas_cardZoom = document.getElementById("cardzoom");
	cardZoom = canvas_cardZoom.getContext("2d");
	text_player1 = document.getElementById("player1_txt");
	text_player2 = document.getElementById("player2_txt");
	// Register key mouse events
	canvas_topHand.addEventListener("click", function(){ handleScreenClick(canvas_topHand, event, hand1, 1); });
	canvas_topHand.addEventListener("mousemove", function(){ handleMouseHover(canvas_topHand, event, hand1); });
	canvas_bottomHand.addEventListener("click", function(){ handleScreenClick(canvas_bottomHand, event, hand2, 2); });
	canvas_bottomHand.addEventListener("mousemove", function(){ handleMouseHover(canvas_bottomHand, event, hand2); });
	canvas_battlefield.addEventListener("mousemove", function(){ handleMouseHover(canvas_battlefield, event, battlefield1); });
	canvas_battlefield.addEventListener("mousemove", function(){ handleMouseHover(canvas_battlefield, event, battlefield2); });
	// Other necessary setup items
	createDecks();
	shuffle(deck1);
	shuffle(deck2);
	drawOpeningHands();
	displayEverything();
	$("#setup").remove();
}

/**
 * Fills the deck variables (deck1 and deck2).
 */
function createDecks() {
	deck1 = [
		{id:01, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 01
		{id:02, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 02
		{id:03, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 03
		{id:04, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 04
		{id:05, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 05
		{id:06, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 06
		{id:07, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 07
		{id:08, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 08
		{id:09, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 09
		{id:10, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 10
		{id:11, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 11
		{id:12, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 12
		{id:13, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 13
		{id:14, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 14
		{id:15, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 15
		{id:16, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 16
		{id:17, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 17
		{id:18, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 18
		{id:19, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 19
		{id:20, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 20
		{id:21, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 21
		{id:22, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 22
		{id:23, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 23
		{id:24, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 24
		{id:25, name:"Runeclaw Bear", cost:"1G", cmc:2, type:"Creature", subtype:"Bear", power:2, toughness:2, mvid:189888, abilities:""}, // Card 25
		{id:26, name:"Runeclaw Bear", cost:"1G", cmc:2, type:"Creature", subtype:"Bear", power:2, toughness:2, mvid:189888, abilities:""}, // Card 26
		{id:27, name:"Runeclaw Bear", cost:"1G", cmc:2, type:"Creature", subtype:"Bear", power:2, toughness:2, mvid:189888, abilities:""}, // Card 27
		{id:28, name:"Runeclaw Bear", cost:"1G", cmc:2, type:"Creature", subtype:"Bear", power:2, toughness:2, mvid:189888, abilities:""}, // Card 28
		{id:29, name:"Trained Armodon", cost:"1GG", cmc:3, type:"Creature", subtype:"Elephant", power:3, toughness:3, mvid:397448, abilities:""}, // Card 29
		{id:30, name:"Trained Armodon", cost:"1GG", cmc:3, type:"Creature", subtype:"Elephant", power:3, toughness:3, mvid:397448, abilities:""}, // Card 30
		{id:31, name:"Trained Armodon", cost:"1GG", cmc:3, type:"Creature", subtype:"Elephant", power:3, toughness:3, mvid:397448, abilities:""}, // Card 31
		{id:32, name:"Trained Armodon", cost:"1GG", cmc:3, type:"Creature", subtype:"Elephant", power:3, toughness:3, mvid:397448, abilities:""}, // Card 32
		{id:33, name:"Rumbling Baloth", cost:"3G", cmc:4, type:"Creature", subtype:"Beast", power:4, toughness:4, mvid:370764, abilities:""}, // Card 33
		{id:34, name:"Rumbling Baloth", cost:"3G", cmc:4, type:"Creature", subtype:"Beast", power:4, toughness:4, mvid:370764, abilities:""}, // Card 34
		{id:35, name:"Rumbling Baloth", cost:"3G", cmc:4, type:"Creature", subtype:"Beast", power:4, toughness:4, mvid:370764, abilities:""}, // Card 35
		{id:36, name:"Rumbling Baloth", cost:"3G", cmc:4, type:"Creature", subtype:"Beast", power:4, toughness:4, mvid:370764, abilities:""}, // Card 36
		{id:37, name:"Leaf Gilder", cost:"1G", cmc:2, type:"Creature", subtype:"Elf", power:2, toughness:1, mvid:139487, abilities:"Tap: Add G to your mana pool."}, // Card 37
		{id:38, name:"Leaf Gilder", cost:"1G", cmc:2, type:"Creature", subtype:"Elf", power:2, toughness:1, mvid:139487, abilities:"Tap: Add G to your mana pool."}, // Card 38
		{id:39, name:"Leaf Gilder", cost:"1G", cmc:2, type:"Creature", subtype:"Elf", power:2, toughness:1, mvid:139487, abilities:"Tap: Add G to your mana pool."}, // Card 39
		{id:40, name:"Leaf Gilder", cost:"1G", cmc:2, type:"Creature", subtype:"Elf", power:2, toughness:1, mvid:139487, abilities:"Tap: Add G to your mana pool."}, // Card 40
		{id:41, name:"Mana Dork", cost:"G", cmc:1, type:"Creature", subtype:"Elf", power:1, toughness:1, mvid:383229, abilities:"Tap: Add G to your mana pool."}, // Card 41
		{id:42, name:"Mana Dork", cost:"G", cmc:1, type:"Creature", subtype:"Elf", power:1, toughness:1, mvid:383229, abilities:"Tap: Add G to your mana pool."}, // Card 42
		{id:43, name:"Mana Dork", cost:"G", cmc:1, type:"Creature", subtype:"Elf", power:1, toughness:1, mvid:383229, abilities:"Tap: Add G to your mana pool."}, // Card 43
		{id:44, name:"Mana Dork", cost:"G", cmc:1, type:"Creature", subtype:"Elf", power:1, toughness:1, mvid:383229, abilities:"Tap: Add G to your mana pool."}, // Card 44
		{id:45, name:"Wurm", cost:"4G", cmc:5, type:"Creature", subtype:"Wurm", power:5, toughness:4, mvid:129742, abilities:""}, // Card 45
		{id:46, name:"Wurm", cost:"4G", cmc:5, type:"Creature", subtype:"Wurm", power:5, toughness:4, mvid:129742, abilities:""}, // Card 46
		{id:47, name:"Wurm", cost:"4G", cmc:5, type:"Creature", subtype:"Wurm", power:5, toughness:4, mvid:129742, abilities:""}, // Card 47
		{id:48, name:"Wurm", cost:"4G", cmc:5, type:"Creature", subtype:"Wurm", power:5, toughness:4, mvid:129742, abilities:""}, // Card 48
		{id:49, name:"Nature's Lore", cost:"1G", cmc:2, type:"Sorcery", subtype:"", power:0, toughness:0, mvid:201840, abilities:"Search your library for a Forest card and put that card onto the battlefield. Then shuffle your library."}, // Card 49
		{id:50, name:"Nature's Lore", cost:"1G", cmc:2, type:"Sorcery", subtype:"", power:0, toughness:0, mvid:201840, abilities:"Search your library for a Forest card and put that card onto the battlefield. Then shuffle your library."}, // Card 50
		{id:51, name:"Nature's Lore", cost:"1G", cmc:2, type:"Sorcery", subtype:"", power:0, toughness:0, mvid:201840, abilities:"Search your library for a Forest card and put that card onto the battlefield. Then shuffle your library."}, // Card 51
		{id:52, name:"Nature's Lore", cost:"1G", cmc:2, type:"Sorcery", subtype:"", power:0, toughness:0, mvid:201840, abilities:"Search your library for a Forest card and put that card onto the battlefield. Then shuffle your library."}, // Card 52
		{id:53, name:"Canopy Gorger", cost:"4GG", cmc:6, type:"Creature", subtype:"Wurm", power:6, toughness:5, mvid:407639, abilities:""}, // Card 53
		{id:54, name:"Canopy Gorger", cost:"4GG", cmc:6, type:"Creature", subtype:"Wurm", power:6, toughness:5, mvid:407639, abilities:""}, // Card 54
		{id:55, name:"Canopy Gorger", cost:"4GG", cmc:6, type:"Creature", subtype:"Wurm", power:6, toughness:5, mvid:407639, abilities:""}, // Card 55
		{id:56, name:"Canopy Gorger", cost:"4GG", cmc:6, type:"Creature", subtype:"Wurm", power:6, toughness:5, mvid:407639, abilities:""}, // Card 56
		{id:57, name:"Rootbreaker Wurm", cost:"5GG", cmc:7, type:"Creature", subtype:"Wurm", power:6, toughness:6, mvid:83151, abilities:"Trample"}, // Card 57
		{id:58, name:"Rootbreaker Wurm", cost:"5GG", cmc:7, type:"Creature", subtype:"Wurm", power:6, toughness:6, mvid:83151, abilities:"Trample"}, // Card 58
		{id:59, name:"Rootbreaker Wurm", cost:"5GG", cmc:7, type:"Creature", subtype:"Wurm", power:6, toughness:6, mvid:83151, abilities:"Trample"}, // Card 59
		{id:60, name:"Rootbreaker Wurm", cost:"5GG", cmc:7, type:"Creature", subtype:"Wurm", power:6, toughness:6, mvid:83151, abilities:"Trample"}, // Card 60
	];
	deck2 = [
		{id:01, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 01
		{id:02, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 02
		{id:03, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 03
		{id:04, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 04
		{id:05, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 05
		{id:06, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 06
		{id:07, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 07
		{id:08, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 08
		{id:09, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 09
		{id:10, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 10
		{id:11, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 11
		{id:12, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 12
		{id:13, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 13
		{id:14, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 14
		{id:15, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 15
		{id:16, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 16
		{id:17, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 17
		{id:18, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 18
		{id:19, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 19
		{id:20, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 20
		{id:21, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 21
		{id:22, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 22
		{id:23, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 23
		{id:24, name:"Forest", cost:"", cmc:0, type:"Land", subtype:"Forest", power:0, toughness:0, mvid:195158, abilities:"G"}, // Card 24
		{id:25, name:"Runeclaw Bear", cost:"1G", cmc:2, type:"Creature", subtype:"Bear", power:2, toughness:2, mvid:189888, abilities:""}, // Card 25
		{id:26, name:"Runeclaw Bear", cost:"1G", cmc:2, type:"Creature", subtype:"Bear", power:2, toughness:2, mvid:189888, abilities:""}, // Card 26
		{id:27, name:"Runeclaw Bear", cost:"1G", cmc:2, type:"Creature", subtype:"Bear", power:2, toughness:2, mvid:189888, abilities:""}, // Card 27
		{id:28, name:"Runeclaw Bear", cost:"1G", cmc:2, type:"Creature", subtype:"Bear", power:2, toughness:2, mvid:189888, abilities:""}, // Card 28
		{id:29, name:"Trained Armodon", cost:"1GG", cmc:3, type:"Creature", subtype:"Elephant", power:3, toughness:3, mvid:397448, abilities:""}, // Card 29
		{id:30, name:"Trained Armodon", cost:"1GG", cmc:3, type:"Creature", subtype:"Elephant", power:3, toughness:3, mvid:397448, abilities:""}, // Card 30
		{id:31, name:"Trained Armodon", cost:"1GG", cmc:3, type:"Creature", subtype:"Elephant", power:3, toughness:3, mvid:397448, abilities:""}, // Card 31
		{id:32, name:"Trained Armodon", cost:"1GG", cmc:3, type:"Creature", subtype:"Elephant", power:3, toughness:3, mvid:397448, abilities:""}, // Card 32
		{id:33, name:"Rumbling Baloth", cost:"3G", cmc:4, type:"Creature", subtype:"Beast", power:4, toughness:4, mvid:370764, abilities:""}, // Card 33
		{id:34, name:"Rumbling Baloth", cost:"3G", cmc:4, type:"Creature", subtype:"Beast", power:4, toughness:4, mvid:370764, abilities:""}, // Card 34
		{id:35, name:"Rumbling Baloth", cost:"3G", cmc:4, type:"Creature", subtype:"Beast", power:4, toughness:4, mvid:370764, abilities:""}, // Card 35
		{id:36, name:"Rumbling Baloth", cost:"3G", cmc:4, type:"Creature", subtype:"Beast", power:4, toughness:4, mvid:370764, abilities:""}, // Card 36
		{id:37, name:"Leaf Gilder", cost:"1G", cmc:2, type:"Creature", subtype:"Elf", power:2, toughness:1, mvid:139487, abilities:"Tap: Add G to your mana pool."}, // Card 37
		{id:38, name:"Leaf Gilder", cost:"1G", cmc:2, type:"Creature", subtype:"Elf", power:2, toughness:1, mvid:139487, abilities:"Tap: Add G to your mana pool."}, // Card 38
		{id:39, name:"Leaf Gilder", cost:"1G", cmc:2, type:"Creature", subtype:"Elf", power:2, toughness:1, mvid:139487, abilities:"Tap: Add G to your mana pool."}, // Card 39
		{id:40, name:"Leaf Gilder", cost:"1G", cmc:2, type:"Creature", subtype:"Elf", power:2, toughness:1, mvid:139487, abilities:"Tap: Add G to your mana pool."}, // Card 40
		{id:41, name:"Mana Dork", cost:"G", cmc:1, type:"Creature", subtype:"Elf", power:1, toughness:1, mvid:383229, abilities:"Tap: Add G to your mana pool."}, // Card 41
		{id:42, name:"Mana Dork", cost:"G", cmc:1, type:"Creature", subtype:"Elf", power:1, toughness:1, mvid:383229, abilities:"Tap: Add G to your mana pool."}, // Card 42
		{id:43, name:"Mana Dork", cost:"G", cmc:1, type:"Creature", subtype:"Elf", power:1, toughness:1, mvid:383229, abilities:"Tap: Add G to your mana pool."}, // Card 43
		{id:44, name:"Mana Dork", cost:"G", cmc:1, type:"Creature", subtype:"Elf", power:1, toughness:1, mvid:383229, abilities:"Tap: Add G to your mana pool."}, // Card 44
		{id:45, name:"Wurm", cost:"4G", cmc:5, type:"Creature", subtype:"Wurm", power:5, toughness:4, mvid:129742, abilities:""}, // Card 45
		{id:46, name:"Wurm", cost:"4G", cmc:5, type:"Creature", subtype:"Wurm", power:5, toughness:4, mvid:129742, abilities:""}, // Card 46
		{id:47, name:"Wurm", cost:"4G", cmc:5, type:"Creature", subtype:"Wurm", power:5, toughness:4, mvid:129742, abilities:""}, // Card 47
		{id:48, name:"Wurm", cost:"4G", cmc:5, type:"Creature", subtype:"Wurm", power:5, toughness:4, mvid:129742, abilities:""}, // Card 48
		{id:49, name:"Nature's Lore", cost:"1G", cmc:2, type:"Sorcery", subtype:"", power:0, toughness:0, mvid:201840, abilities:"Search your library for a Forest card and put that card onto the battlefield. Then shuffle your library."}, // Card 49
		{id:50, name:"Nature's Lore", cost:"1G", cmc:2, type:"Sorcery", subtype:"", power:0, toughness:0, mvid:201840, abilities:"Search your library for a Forest card and put that card onto the battlefield. Then shuffle your library."}, // Card 50
		{id:51, name:"Nature's Lore", cost:"1G", cmc:2, type:"Sorcery", subtype:"", power:0, toughness:0, mvid:201840, abilities:"Search your library for a Forest card and put that card onto the battlefield. Then shuffle your library."}, // Card 51
		{id:52, name:"Nature's Lore", cost:"1G", cmc:2, type:"Sorcery", subtype:"", power:0, toughness:0, mvid:201840, abilities:"Search your library for a Forest card and put that card onto the battlefield. Then shuffle your library."}, // Card 52
		{id:53, name:"Canopy Gorger", cost:"4GG", cmc:6, type:"Creature", subtype:"Wurm", power:6, toughness:5, mvid:407639, abilities:""}, // Card 53
		{id:54, name:"Canopy Gorger", cost:"4GG", cmc:6, type:"Creature", subtype:"Wurm", power:6, toughness:5, mvid:407639, abilities:""}, // Card 54
		{id:55, name:"Canopy Gorger", cost:"4GG", cmc:6, type:"Creature", subtype:"Wurm", power:6, toughness:5, mvid:407639, abilities:""}, // Card 55
		{id:56, name:"Canopy Gorger", cost:"4GG", cmc:6, type:"Creature", subtype:"Wurm", power:6, toughness:5, mvid:407639, abilities:""}, // Card 56
		{id:57, name:"Rootbreaker Wurm", cost:"5GG", cmc:7, type:"Creature", subtype:"Wurm", power:6, toughness:6, mvid:83151, abilities:"Trample"}, // Card 57
		{id:58, name:"Rootbreaker Wurm", cost:"5GG", cmc:7, type:"Creature", subtype:"Wurm", power:6, toughness:6, mvid:83151, abilities:"Trample"}, // Card 58
		{id:59, name:"Rootbreaker Wurm", cost:"5GG", cmc:7, type:"Creature", subtype:"Wurm", power:6, toughness:6, mvid:83151, abilities:"Trample"}, // Card 59
		{id:60, name:"Rootbreaker Wurm", cost:"5GG", cmc:7, type:"Creature", subtype:"Wurm", power:6, toughness:6, mvid:83151, abilities:"Trample"}, // Card 60
	];
}

/**
 * Draws the top 7 cards of each deck by calling drawCardFromLibrary() 7 times for each 
 * deck / hand.
 */
function drawOpeningHands() {
	for (var i=0; i<7; i++) {
		drawCardFromLibrary(deck1, hand1, 1);
	}
	for (var i=0; i<7; i++) {
		drawCardFromLibrary(deck2, hand2, 2);
	}
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
 * Displays all cards in hand1 and hand2, and defines cardArea for each card displayed.
 */
function displayEverything() {
	// Clear everything
	topHand.clearRect(0, 0, canvas_topHand.width, canvas_topHand.height);
	bottomHand.clearRect(0, 0, canvas_bottomHand.width, canvas_bottomHand.height);
	battlefield.clearRect(0, 0, canvas_battlefield.width, canvas_battlefield.height);
	// topHand
	for (var card=0; card<hand1.length; card++) {
		var leftBorder = 103 * card + 2;
		var topBorder = 2;
		hand1[card].cardArea = getCardArea(leftBorder, topBorder);
		displayCard(hand1[card], topHand, leftBorder, topBorder);
	}
	// bottomHand
	for (var card=0; card<hand2.length; card++) {
		var leftBorder = 103 * card + 2;
		var topBorder = 2;
		hand2[card].cardArea = getCardArea(leftBorder, topBorder);
		displayCard(hand2[card], bottomHand, leftBorder, topBorder);
	}
	// battlefield1
	for (var card=0; card<battlefield1.length; card++) {
		var leftBorder = 103 * card + 2;
		var topBorder = 2;
		battlefield1[card].cardArea = getCardArea(leftBorder, topBorder);
		displayCard(battlefield1[card], battlefield, leftBorder, topBorder);
	}
	// battlefield2
	for (var card=0; card<battlefield2.length; card++) {
		var leftBorder = 103 * card + 2;
		var topBorder = 210;
		battlefield2[card].cardArea = getCardArea(leftBorder, topBorder);
		displayCard(battlefield2[card], battlefield, leftBorder, topBorder);
	}
	updatePlayerInfo(1);
	updatePlayerInfo(2);
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
	// blank out the drawing space
	drawSpace.clearRect(leftBorder, topBorder, cardWidth, cardHeight);
	//// Draw placholder text  ////
	// border
	drawSpace.strokeRect(leftBorder, topBorder, cardWidth, cardHeight);
	// name
	drawSpace.fillText(card.name, leftBorder+3, topBorder+10);
	// cost
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
	// Draw nicely with gatherer
	var cardImg = new Image();
	cardImg.src = "http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" + card.mvid + "&type=card";
	drawSpace.drawImage(cardImg, leftBorder, topBorder, cardWidth, cardHeight);
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



/*******   Event Handling   *******/


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
function handleScreenClick(canvas, event, cardCollection, player) {
	// Catch right click
	if(event.button == 2) {
		event.preventDefault();
		alert("");
		return;
	}
	var pointerPos = getPointerPositionOnCanvas(canvas, event);
	var card = getCardThatWasClicked(pointerPos.x, pointerPos.y, cardCollection);
	if(card == null)
		return;
	card = cardCollection.splice(card, 1)[0];
	if(player == 1)
		battlefield1.push(card);
	else
		battlefield2.push(card);
	displayEverything();
}

/**
 * If user is hovering over a card, then zoom in on the card.
 */
function handleMouseHover(canvas, event, cardCollection) {
	var pointerPos = getPointerPositionOnCanvas(canvas, event);
	var cardIdx = getCardThatWasClicked(pointerPos.x, pointerPos.y, cardCollection);
	if(cardIdx == null)
		return;
	var card = cardCollection[cardIdx];
	//alert(card);
	var cardImg = new Image();
	cardImg.src = "http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" + card.mvid + "&type=card";
	cardZoom.drawImage(cardImg, 0, 0, canvas_cardZoom.width, canvas_cardZoom.height);
}

/**
 * Returns the index of the card in cardCollection that was clicked, or null if no card 
 * was clicked.
 * @param x The x variable from pointerPosition
 * @param y The y variable from pointerPosition
 * @param cardCollection The set of card objects to iterate over, each of which should 
 *            have a proper cardArea property defined
 */
function getCardThatWasClicked(x, y, cardCollection) {
	for (var card=0; card<cardCollection.length; card++) {
		cardArea = cardCollection[card].cardArea;
		if(x>=cardArea.left && x<=cardArea.right && y>=cardArea.top && y<=cardArea.bottom)
			return card;
	}
	return null;
}

/**
 * Updates the player header for the given player.
 * @param player A number representing player1 or player2
 */
function updatePlayerInfo(player) {
	if(player == 1) {
		newText = "Player 1";
		newText += "  |  Life: " + life1;
		newText += "  |  Cards in hand: " + hand1.length;
		newText += "  |  Cards in deck: " + deck1.length;
		$("#player1_txt").text(newText);
	}
	else {
		newText = "Player 2";
		newText += "  |  Life: " + life2;
		newText += "  |  Cards in hand: " + hand2.length;
		newText += "  |  Cards in deck: " + deck2.length;
		$("#player2_txt").text(newText);
	}
}



/*******   Helpers   *******/


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
 * Description.
 * @param var Description
 * @return var Description
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

