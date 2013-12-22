/**
 * Colour Memory main javascript
 *
 * Requires jQuery
 *
 * Markus Östberg
 * 2013-03-21
 */

var score;	// score of current game
var position; //Stores card type, two matching cards have the same type (and coulor) 
var nrOfTurnedCards; 
var turnedType; //Type (Colour) of turned card
var turnedPosition; //Possition of turned cards
var semafor; //Semafor to prevent turning cards during animation and wait
var cardList;  //List to initiate and sort card types
var selected; //Selected Card
var colours; //Possible coloures of cards
var nrOfHiddenCards; 

var DIRECTION = {
  UP : 0,
  DOWN: 2,
  RIGHT : 1,
  LEFT : 3
};

$(document).ready(function(){
	printGameInstructions();
	init();
	addKeyboardControll();
});

function printGameInstructions(){
	$('#output').prepend('-------------------------\r\n' + 
		' Welcome to Colour Memory\r\n' +
		'-------------------------\r\n' + 
		'- To Play use your\r\n' + 
		'  keybord.\r\n' + 
		'- Move between the cards\r\n' + 
		'  using your arrow keys.\r\n' + 
		'- To select a card\r\n' + 
		'  use the enter key.\r\n' + 
		'- You can always restart\r\n' + 
		'  the game by selecting\r\n' + 
		'  the restart button\r\n' + 
		'  and press enter.\r\n' + 
		'-------------------------\r\n');
}

//init game
function init()
{
	score = 0;
	position = new Array(4);
	turnedType = new Array(2);
	turnedPosition = new Array(2);
	nrOfTurnedCards = 0;
	nrOfHiddenCards = 0
	
	cardList = new Array(16);
	for(var i=0;i<8;i++)
	{
		cardList[i] = i;
		cardList[15-i] = i;
	}
	
	selected = new Array(2);
	selected[0] = 0;
	selected[1] = 0;

	loadColours();
	shuffle();
	buildBoard();
	
	addMouseControll();
	
	select(selected);
	setTimeout(function () {semafor = true;}, 500);
}

//Build gameboard
function buildBoard(){

	board = document.getElementById("board");
	for(var i=0;i<4;i++)
	{
		position[i] = new Array(4);
		
		for(var j=0;j<4;j++)
		{
			position[i][j] = cardList[i + j*4];
			board.innerHTML = board.innerHTML + "<div class='cardContainer'><div id='card_" + i + "_" + j +"' class='card notTurned'></div></div>";
		}
	}
	return true
}

//Shuffle cards
function shuffle(){
	//Fisher-yates shuffle
	for(var i = cardList.length - 1; i >= 0; i--){
		var j = parseInt(Math.random() * i);
		var x = cardList[i];
		cardList[i] = cardList[j]
		cardList[j] = x
	}
}

//Load Card coloures
function loadColours(){
	$.getJSON('service.php', function(data) {
		colours = data.Colours;
		if(colours.length != 8){
			loadDefaultColoures();
		}
	})
	.fail(function() { loadDefaultColoures(); });
}

//Load default colours in case of error
function loadDefaultColoures(){
	$('#output').prepend('Error loading config... Using Default coloures\r\n');
	colours = new Array(8);
	colours[0] = "#ff0000";
	colours[1] = "#00ff00";
	colours[2] = "#0000ff";
	colours[3] = "#ffff00";
	colours[4] = "#ff00ff";
	colours[5] = "#00ffff";
	colours[6] = "#f0f0f0";
	colours[7] = "#0f0f0f";
}

//Add Keyboard event
function addKeyboardControll(){
	$(document).keydown(function(e) {
		if (e.keyCode == 13) {
			turn(selected);
		}	
		else if (e.keyCode == 37) {
			keyboardMove(DIRECTION.LEFT);
		}
		else if (e.keyCode == 38) {
			keyboardMove(DIRECTION.UP);
		}
		else if (e.keyCode == 40) {
			keyboardMove(DIRECTION.DOWN);
		}
		else if (e.keyCode == 39) {
			keyboardMove(DIRECTION.RIGHT);
		}
	});
}

function addMouseControll(){
	$('.card').click(function(e){
		console.log("Clicked:" + $(this).attr('id'));
		var cell = $(this).attr('id').split("_");
		var row = cell[1];
		var col = cell[2];
		if (!$(this).hasClass('turned') && !$(this).hasClass('hidden')){
			turn([row, col])
			select([2,4]);
		}
	});
	
	$('.restart').click(function(e){
		select([2,4]);
		turn([2, 4]);
	});
}

//Handle move
function keyboardMove(direction){
	var card = getClosestFreeCard(selected, direction)
	select(card);
}

//Get closest not turned card
function getClosestFreeCard(card, direction){
	var next = getNextCardInDirection(card, direction)
	var found = false;
	var lastDir = 1
	var distance = 0;
	var count = 0;
	
	while(!found){
		if(isBoard(next)){
			if(isCard(next)){
				return next;
			}
			else{
				next = getNextCardInDirection(next, direction)
			}
		}
		else{	//Check cards on the right and left side of the direction
			lastDir = lastDir*-1;
			next = getNextCardInDirection(card, (((direction+lastDir)% 4) + 4) % 4)
			for(var i = 1; i < distance; i++){
				next = getNextCardInDirection(next, (((direction+lastDir)% 4) + 4) % 4)
			}
			next = getNextCardInDirection(next, direction)
			count++;
			if(count % 2 == 0)
				distance++;
		}
		//No free card found
		if(distance > 4)
			break;
	}
	return [2,4] //return to restart
}

//Get next possible card in direction
function getNextCardInDirection(card, direction){
	var next = new Array(2);
	next[0] = card[0];
	next[1] = card[1];
	
	if(direction == DIRECTION.UP){
		next[0] = (card[0] - 1);
	}
	else if(direction == DIRECTION.DOWN){
		next[0] = (card[0] + 1);
	}
	else if(direction == DIRECTION.LEFT){
		next[1] = (card[1] - 1);
	}
	else if(direction == DIRECTION.RIGHT){
		next[1] = (card[1] + 1);
	}
	
	return next;
}

//Check if card is on board
function isBoard(card){
	if(card[0] > 3 || card[1] > 3 || card[0] < 0 || card[1] < 0)
		return false;
	else
		return true;
}

//Check if card possition contains a unturned card
function isCard(card){
	var next = $('#card_'+ card[0] + '_' + card[1] + '');
	
	if (next.hasClass('turned') || next.hasClass('hidden'))
		return false;
	else
		return true;
}

//Select card
function select(card){
	selected = card;
	
	if(card[1] == 4){ //restart
		card[1] = 4;
		card[0] = 3;
		$('.selected').toggleClass('selected');
		$('.restart').toggleClass('selected');
	}
	else{
		$('.selected').toggleClass('selected');
		$('#card_'+ card[0] + '_' + card[1] + '').addClass('selected');
	}
}

//Handle a turn
function turn(selected){
	if(semafor){
		semafor = false;
		if(selected[1] == 4){
			restart();
			return;
		}
		
		var card = new Array(2);
		card[0] = selected[0];
		card[1] = selected[1];
		checkTurnedCards(card);
		
		selected = getClosestFreeCard(card, 0);
		var count = 0;
		while(selected[1] == 4){
			selected = getClosestFreeCard(card, count);
			count++
			if(count > 3)
				break;
		}
		
		toggleCard(card);
		select(selected);
		
	}
}

//Handle turned cards, points and if game is done
function checkTurnedCards(card){
	if(nrOfTurnedCards < 2){ //Zero or one card shown
		turnedType[nrOfTurnedCards] = position[card[0]][card[1]];
		turnedPosition[nrOfTurnedCards] = card;
		nrOfTurnedCards++;
	}
	
	if (nrOfTurnedCards == 2){
		if(turnedType[0] == turnedType[1]){
			updateScore(1);
			nrOfHiddenCards += 2;
			nrOfTurnedCards = 0;
			setTimeout(hideTurnedCards, 2000);
		}
		else{
			updateScore(-1);
			setTimeout(toggleTurnedCards, 2000);
			nrOfTurnedCards = 0;
		}
		
		setTimeout(function () {semafor = true;}, 2500);
	}
	
	if (nrOfTurnedCards == 1){
		setTimeout(function () {semafor = true;}, 500);
	}
}

//Update the current score and print to output
function updateScore(points){
	score += points;
	
	if(points > 0)
		$('#output').prepend(" +" + points + " point (Score: " +score + ")\r\n");
	else
		$('#output').prepend(" " + points + " point (Score: " +score + ")\r\n");
}

//Toggle turned cards
function toggleTurnedCards(){
	toggleCard(turnedPosition[0]);
	toggleCard(turnedPosition[1]);
}
function toggleCard(card){
	$('#card_'+ card[0] + '_' + card[1] + '').hide(200);
	setTimeout(function () {delayedToggle(card)}, 200);
}
function delayedToggle(card){
	$('#card_'+ card[0] + '_' + card[1] + '').css('background-color', colours[position[card[0]][card[1]]]) //Set colour of card
	$('#card_'+ card[0] + '_' + card[1] + '').toggleClass('notTurned');
	$('#card_'+ card[0] + '_' + card[1] + '').toggleClass('turned').delay(200).show(200);
}

//Hide correctly matched card
function hideTurnedCards(){
	hideCard(turnedPosition[0]);
	hideCard(turnedPosition[1]);
	
	if(nrOfHiddenCards == 16){
		endGame();
	}
}
function hideCard(card){
	$('#card_'+ card[0] + '_' + card[1] + '').hide(200);
}

//Prints messages when game is done
function endGame(){
	$('#output').prepend(' You won!\r\n' +
			' You got ' + score + ' points.\r\n' + 
			'-------------------------\r\n');
	
	if (window.confirm('Congratulations, you found all the pairs.\r\n You got ' + score + ' points.\r\n Do you want to play another round?'))
	{
		restart();
	}
	else
	{
		$('#output').prepend('-------------------------\r\n' + 
			' Thank you for playing\r\n' +
			' Colour Memory!\r\n' + 
			' Select restart if you\r\n' + 
			' want to play again.\r\n' +
			'-------------------------\r\n');
	}
}

//Restart gameboard
function restart(){
	board = document.getElementById("board");
	$('#output').prepend('-------------------------\r\n' + 
		' Game Restarted!\r\n' + 
		'-------------------------\r\n');
			
	board.innerHTML = "";
		
	init();
}