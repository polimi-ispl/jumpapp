//Settings
var resolution = [window.innerWidth, window.innerHeight]
var gravity = 850;
var gameVelocity = 1;
var playerGravity = 2000*gameVelocity;
var numberOfLevels = 8;
var backgroundGridColor = 0xffe8e8;
var backgroundColor = 0xFFFFFF;
var platformColor = 0x41423c;
var gridColor = "186, 181, 180, "
var gridOpacity = 0.4;
var fontSize = 20;
var fontColor = '#F00';
var pointsToChangeLevel = 5;

//Default Settings
//var noteReference -> Not here
var gameModality = GAME_MODE.STATIC; //Identify the default modality set when the game is loaded in the page
var startGameLevel = 0; //Identify the position of the default starting scale (from the relation scales[gameLevel])
//Then there's the noteReference variable that is not declared and set default here


var modalScaleName = scales[startGameLevel]; //Identify the name of the default scale taken from the startGameLevel position
changeScaleReference(modalScaleName);





//Game Configuration
var config = {
	type: Phaser.AUTO,
	width: resolution[0],
	height: resolution[1],
	backgroundColor: backgroundColor,
	physics: {
		default: 'arcade',
		arcade: {
				gravity: { y: gravity },
				debug: false
		}
	}
};

var game = new Phaser.Game(config);


//GAME VARIABLES

//Player object, player dimension
var player;
var playerWidth;
var playerHeight;

//Game score
var score; //Int
var scoreText;

//Game grid-rhythm settings
var timeSignature;

//Game status managing
var gameStatus;
var restartScene;
var changeLevelEvent;
var changeLevelStatusDuration;
var scoreToChangeLevel;
var changeLevelTextShown;

//Jump event managing
var goAhead;
var noAnswer;
var jumpArea;
var jumpAreaWidth;

//Player position
var gameInitialX;
var playerInitialY;
var playerPreviousY;

//Platforms (levels)
var levelsFieldHeight;
var stepHeight;
var platformVelocity;
var platformTouched;
var measurePlatformWidth;
var platformHeight;
var platformInitialX;
var platformInitialPlayerOffset;
var spaceBetweenPlatforms;
var levelsQueue;
var currentPlatform;
var playerPauseY;

//Game Levels
var gameLevel;
var lastLevel;
var currentScaleText;
var gameLevelProgressive; //Always increase

//PAUSE
var pauseEvent;
var playerEnterPause;
var jumpFromPause;
var fallBeforePause;
var playerEndY;
var endedPauseAnimation;
var initialPauseStability;

//Intro
var initialScaleNote;
var introVelocity;
var statusText;
var statusTextSmall;
var countdown;
var centeredText;

//Collider
var collider;

//Graphic drawings object manager
var graphics;

//Note reference
var currentNoteReference;

//Pitch detector initialization (here to create only one object even if the game is restarted)
const pitchDetector = new PitchDetector();
pitchDetector.start();

//Game context
var gameContext;

//Buttons
var referenceNoteButton;
var playPauseButton;
var settingsButton;

function initVariables() {
	//Game Level
	gameLevel = startGameLevel;
	gameLevelProgressive = 1;
	lastLevel = false;

	//Game score
	score = 0;

	//Game Intro
	initialScaleNote = 0;
	introVelocity = (resolution[1]/636)*1.5;
	countdown = 4;

	//Game state managing
	gameStatus = "Initialized";
	restartScene = false;
	changeLevelEvent = false; //Manage the period in which there's a change of level
	changeLevelStatusDuration = 1/2;
	scoreToChangeLevel = 0;
	changeLevelTextShown = false;

	//Game grid-rhythm settings
	timeSignature = 4;

	//Jump event managing
	goAhead = true;
	noAnswer = false;
	jumpArea = false;
	jumpAreaWidth = playerWidth+10*gameVelocity; //befere was 20

	//Player position
	playerFixedX = 100;
	playerInitialY = resolution[1] - playerHeight/2 - playerHeight/8;
	playerPreviousY = 0;

	//Platforms (levels)
	levelsFieldHeight = resolution[1]-playerHeight*4; //Calculation of levels Field (Height of the scene in which levels can appear)
	stepHeight = levelsFieldHeight/numberOfLevels;

	platformTouched = false;
	platformVelocity = 0;
	measurePlatformWidth = 800;
	gameInitialX = 200;
	platformHeight = stepHeight-((stepHeight*40)/100);
	platformInitialX = (gameInitialX-playerWidth/2)+(measurePlatformWidth/2);
	platformInitialPlayerOffset = 6;
	spaceBetweenPlatforms = 2;
	levelsQueue = [];

	//Pause
	playerEnterPause = false; //True only when the player enter the pause
	jumpFromPause = false; //True when the player jump from a pause to the next step
	pauseEvent = false; //Keep true from when the player enter jumpArea of the step before pause to when the player exit pause
	fallBeforePause = false; //True if the player fall because a note is played to enter a pause
	playerEndY = 0;
	endedPauseAnimation = false;
	initialPauseStability = 7; //Increase-> decrease stability; decrease-> increase stability but increase the delay of wings

	//ScaleMapping inizialization
	//changeNoteReference("C3")
	changeScaleReference(scales[gameLevel]);

	//Pitch manager
	if(pitchDetector.isEnable())
		pitchDetector.toggleEnable();
}


//GAME SCENES MANAGER
/*
Current Game Scenes pipeline:

splashScene -> settingsScene -> playScene --------------------|
																^			 												|
																|			  											|
															gameoverScene <-----------------

playScene: manage the starting state (with variable gameStatus) and the different levels (with the variable gameLevel)
*/

var splashScene = {
	preload: function() {
		//this.load.image('splash', 'assets/splash.png');
	},
	create: function() {
		//Splash logo
		// splashLogo = this.add.image(resolution[0]/2, resolution[1]/2, 'splash');
		// splashLogo.setDisplaySize(resolution[0], resolution[1]);
		// splashLogo.setDepth(10);
		// splashTween = this.add.tween({ targets: splashLogo, ease: 'Sine.easeInOut', duration: 1000, delay: 800, alpha: { getStart: () => 1, getEnd: () => 0 } });
		// splashTween.setCallback("onStart", function(){
		// 		splashScene.scene.start("settingsScene"); //Not Working
		// }, splashLogo);
	}
}
game.scene.add("splashScene", splashScene);

var askForStartGame;

var settingsScene = {
	preload: function() {
		this.load.spritesheet('player', 'assets/player.png', { frameWidth: 19, frameHeight: 48 });
	},
	create: function() {

		askForStartGame = false;

		playerWidth = 19;
		playerHeight = 48;

		initVariables();

		this.cameras.main.setBackgroundColor('#ffc2bf');
		this.cameras.main.fadeIn(500, 255,255,255);

		watchDemo = this.add.text(resolution[0]/2,resolution[1]-20, "Watch a demo video",  { font: "15px Arial", fill: "#F00"}).setOrigin(0.5);
		watchDemo.setInteractive();
		watchDemo.on('pointerdown', function() {
			window.location.href = "./demo_JumpApp.mp4";
		});



		settingsOffset = 0;

		//Animation to the left
		settingsPlayer = this.physics.add.sprite(resolution[0]/2-400, resolution[1]/2-100, 'player').setScale(resolution[1]/636);
		settingsPlayer.setCollideWorldBounds(false); //So the player can exceed the world boundaries
		settingsPlayer.body.setGravityY(playerGravity);
		settingsPlayer.setBounce(1);

		createPlatformTexture(this, measurePlatformWidth*1/4, platformHeight, 1/4);
		settingsPlatforms = this.physics.add.staticGroup();
		settingsPlatforms.create(resolution[0]/2-400, resolution[1]/2+100, 'platform'+1/4+platformHeight);

		settingsCollider = this.physics.add.collider(settingsPlayer, settingsPlatforms);

		//Animation to the right
		createPlatformTexture(this, measurePlatformWidth*1/4, platformHeight, 1/4);
		settingsPlatforms2 = this.physics.add.staticGroup();
		settingsPlatforms2.create(resolution[0]/2+400, resolution[1]/2+100, 'platform'+1/4+platformHeight);

		settingsPlayer2 = this.physics.add.sprite(resolution[0]/2+400, resolution[1]/2-100, 'player').setScale(resolution[1]/636);
		settingsPlayer2.setCollideWorldBounds(false); //So the player can exceed the world boundaries
		settingsPlayer2.body.setGravityY(playerGravity-500);
		settingsPlayer2.setBounce(1);

		settingsCollider2 = this.physics.add.collider(settingsPlayer2, settingsPlatforms2);

		//Relative scale settings
		//------------------------------------------------------------------------------------------------------
		firstNote = noteReference;
		firstNoteTextDesc = this.add.text(resolution[0]/2+settingsOffset,resolution[1]/10, "______________________________________\nTonal Reference",  { font: "bold 22px Arial", fill: "#F00"}).setOrigin(0.5);
		firstNoteTextDesc.setAlign('center');
		firstNoteText = this.add.text(resolution[0]/2+settingsOffset-100,resolution[1]/3.6, "",  { font: "bold 22px Arial", fill: "#F00"}).setOrigin(0.5);
		firstNoteText.setText(firstNote);
		firstNoteText.setBackgroundColor("rgba(255,160,160,0.5)");
		firstNoteText.setPadding(13, 13, 13, 13);
		firstNoteText.setInteractive();
		firstNoteText.on('pointerdown', function() {
			playNote(firstNote, 1.5);
		});

		prevNote = this.add.text(resolution[0]/2+settingsOffset-50-100,resolution[1]/3.6, "<",  { font: "bold 22px Arial", fill: "#F00"}).setOrigin(0.5);
		prevNote.setPadding(6, 10, 6, 10);
		prevNote.setInteractive();
		prevNote.on('pointerdown', function() {
			nextNote.setFill("#F00");
			if(firstNote != "C2"){
				if(firstNote == "C#2") {
					prevNote.setFill("rgba(245,160,160,0.5)");
				}

				if(firstNote.substring(1,2) == "#")
					octave = firstNote.substring(2,3);
				else
					octave = firstNote.substring(1,2);

				if(firstNote.substring(0,1) == "C" && firstNote.substring(0,2) != "C#")
					octave--;

				if(firstNote.substring(1,2) == "#")
					firstNote = letters[letters.indexOf(firstNote.substring(0,2))-1]+octave;
				else
					if(firstNote.substring(0,1) == letters[0])
						firstNote = letters[letters.length-1]+octave;
					else
						firstNote = letters[letters.indexOf(firstNote.substring(0,1))-1]+octave;


				firstNoteText.setText(firstNote);
				changeNoteReference(firstNote);
				playNote(firstNote, 1.5);

			}
		});

		nextNote = this.add.text(resolution[0]/2+settingsOffset+50-100,resolution[1]/3.6, ">",  { font: "bold 22px Arial", fill: "#F00"}).setOrigin(0.5);
		nextNote.setPadding(6, 10, 6, 10);
		nextNote.setInteractive();
		nextNote.on('pointerdown', function() {
			prevNote.setFill("#F00");
			if(firstNote != "B5"){ //Set max range
				if(firstNote == "A#5"){ //Set "inactive"
					nextNote.setFill("rgba(245,160,160,0.5)");
				}

				if(firstNote.substring(1,2) == "#")
					octave = firstNote.substring(2,3);
				else
					octave = firstNote.substring(1,2);

				if(firstNote.substring(0,1) == "B")
					octave++;

				if(firstNote.substring(1,2) == "#")
					if(firstNote.substring(0,2) == letters[letters.length-1])
						firstNote = letters[0]+octave;
					else
						firstNote = letters[letters.indexOf(firstNote.substring(0,2))+1]+octave;
				else
					firstNote = letters[letters.indexOf(firstNote.substring(0,1))+1]+octave;

				firstNoteText.setText(firstNote);
				changeNoteReference(firstNote);
				playNote(firstNote, 1.5);
			}
		});

		playOctaveButton = this.add.text(resolution[0]/2+settingsOffset+100,resolution[1]/3.6, "Play Octave",  { font: "bold 22px Arial", fill: "#F00"}).setOrigin(0.5);
		playOctaveButton.setBackgroundColor("rgba(240,160,160,0.5)");
		playOctaveButton.setFill("#F00");
		playOctaveButton.setPadding(10, 10, 10, 10);
		playOctaveButton.setInteractive();
		playOctaveButton.on('pointerdown', function() {
			playNote(firstNote, 1.5);
			setTimeout(()=>{
				if(firstNote.substring(1,2) == "#")
					playNote(firstNote.substring(0,2)+(parseInt(firstNote.substring(2,3))+1), 1.5);
				else
					playNote(firstNote.substring(0,1)+(parseInt(firstNote.substring(1,2))+1), 1.5);
			},600);

		});

		//Game Modality
		//------------------------------------------------------------------------------------------------------
		gameModalityTextDesc = this.add.text(resolution[0]/2+settingsOffset,resolution[1]/2.2, "______________________________________\nGame Modality & Modal Scale",  { font: "bold 22px Arial", fill: "#F00"}).setOrigin(0.5);
		gameModalityTextDesc.setAlign('center');

	  startGameLevel = scales.indexOf(modalScaleName);
		modalScaleText = this.add.text(resolution[0]/2+settingsOffset,resolution[1]/1.6, "",  { font: "bold 22px Arial", fill: "#F00"}).setOrigin(0.5);
		modalScaleText.setText(modalScaleName.charAt(0).toUpperCase() + modalScaleName.slice(1));
		modalScaleText.setBackgroundColor("rgba(255,160,160,0.5)");
		modalScaleText.setPadding(13, 13, 13, 13);

		prevScale = this.add.text(resolution[0]/2+settingsOffset,resolution[1]/1.8, ">",  { font: "bold 22px Arial", fill: "#F00"}).setOrigin(0.5);
		prevScale.setAngle(-90);
		prevScale.setPadding(6, 10, 6, 10);
		prevScale.setInteractive();
		prevScale.on('pointerdown', function() {
			if(startGameLevel == 0)
				startGameLevel = scales.indexOf(scales[scales.length-1]);
			else
				startGameLevel--;
			modalScaleName = scales[startGameLevel];
			changeScaleReference(modalScaleName);
			modalScaleText.setText(modalScaleName.charAt(0).toUpperCase() + modalScaleName.slice(1));
		});

		nextScale = this.add.text(resolution[0]/2+settingsOffset,resolution[1]/1.44, ">",  { font: "bold 22px Arial", fill: "#F00"}).setOrigin(0.5);
		nextScale.setAngle(90);
		nextScale.setPadding(6, 10, 6, 10);
		nextScale.setInteractive();
		nextScale.on('pointerdown', function() {
			if(startGameLevel == scales.indexOf(scales[scales.length-1]))
				startGameLevel = 0;
			else
				startGameLevel++;
			modalScaleName = scales[startGameLevel];
			changeScaleReference(modalScaleName);
			modalScaleText.setText(modalScaleName.charAt(0).toUpperCase() + modalScaleName.slice(1));
		});

		gameModalityProgressive = this.add.text(resolution[0]/2+settingsOffset+160,resolution[1]/1.6, "Progressive",  { font: "bold 22px Arial", fill: "#F00"}).setOrigin(0.5);
		if(gameModality == GAME_MODE.STATIC) {
			gameModalityProgressive.setBackgroundColor("rgba(240,160,160,0.5)");
			gameModalityProgressive.setFill("#F00");
		}
		else {
			gameModalityProgressive.setBackgroundColor("rgba(255,0,0,0.5)");
			gameModalityProgressive.setFill("#FFFFFF");
		}
		gameModalityProgressive.setPadding(10, 10, 10, 10);
		gameModalityProgressive.setInteractive();
		gameModalityProgressive.on('pointerdown', function() {
			gameModalityProgressive.setBackgroundColor("rgba(255,0,0,0.5)");
			gameModalityProgressive.setFill("#FFFFFF");
			gameModality = GAME_MODE.PROGRESSIVE;

			gameModalityStatic.setBackgroundColor("rgba(240,160,160,0.5)");
			gameModalityStatic.setFill("#F00");
		});

		gameModalityStatic = this.add.text(resolution[0]/2+settingsOffset-160,resolution[1]/1.6, "Static",  { font: "bold 22px Arial", fill: "#F00"}).setOrigin(0.5);
		if(gameModality == GAME_MODE.PROGRESSIVE) {
			gameModalityStatic.setBackgroundColor("rgba(240,160,160,0.5)");
			gameModalityStatic.setFill("#F00");
		}
		else {
			gameModalityStatic.setBackgroundColor("rgba(255,0,0,0.5)");
			gameModalityStatic.setFill("#FFFFFF");
		}
		gameModalityStatic.setPadding(10+(gameModalityProgressive.width-20-gameModalityStatic.width)/2, 10, 10+(gameModalityProgressive.width-20-gameModalityStatic.width)/2, 10);
		gameModalityStatic.setInteractive();
		gameModalityStatic.on('pointerdown', function() {
			gameModalityStatic.setBackgroundColor("rgba(255,0,0,0.5)");
			gameModalityStatic.setFill("#FFFFFF");
			gameModality = GAME_MODE.STATIC;

			gameModalityProgressive.setBackgroundColor("rgba(240,160,160,0.5)");
			gameModalityProgressive.setFill("#F00");
		});

		//Start Game button
		//------------------------------------------------------------------------------------------------------
		startGame = this.add.text(resolution[0]/2+settingsOffset,resolution[1]/1.2, "Start Game",  { font: "bold 80px Arial", fill: "#F00"}).setOrigin(0.5);
		startGame.setPadding(15, 15, 15, 15);
		startGame.setShadow(2, 2, 'rgba(0,0,0,0.5)', 2);
		startGame.setInteractive();
		startGame.on('pointerdown', function() {
			// game.anims.anims.clear() //Remove player animations before restarting the game
			// game.textures.remove("grid-texture"); //Remove canvas texture before restarting the game
			// game.scene.start("playScene");
			// game.scene.stop("settingsScene");
			askForStartGame = true;
		});

		this.input.keyboard.on('keydown', function(event) {
			if(event.key == " " || event.key == "Enter") {
				game.anims.anims.clear() //Remove player animations before restarting the game
				game.textures.remove("grid-texture"); //Remove canvas texture before restarting the game
				game.scene.start("playScene");
				game.scene.stop("settingsScene");
			}
		});
	},
	update: function() {
		if(askForStartGame == true && settingsPlayer.body.touching.down) {
			settingsPlayer.setVelocityX(-600);
		}
		else if(askForStartGame == true && settingsPlayer2.body.touching.down){
			settingsPlayer2.setVelocityX(600);
		}

		if(settingsPlayer.x <= 0) {
			game.anims.anims.clear() //Remove player animations before restarting the game
			game.textures.remove("grid-texture"); //Remove canvas texture before restarting the game
			game.scene.start("playScene");
			game.scene.stop("settingsScene");
		} else if(settingsPlayer2.x >= resolution[0]){
			game.anims.anims.clear() //Remove player animations before restarting the game
			game.textures.remove("grid-texture"); //Remove canvas texture before restarting the game
			game.scene.start("playScene");
			game.scene.stop("settingsScene");
		}
	}
}
game.scene.add("settingsScene", settingsScene);

function loadSettings() {

}

var playScene = {
	preload: function() {
		//Needed to be set here to set the player dimension correctly
		playerWidth = 19;
		playerHeight = 48;

		//Loading of game resources
		this.load.spritesheet('player', 'assets/player.png', { frameWidth: playerWidth, frameHeight: playerHeight });
		this.load.spritesheet('player-fly', 'assets/player_fly.png', { frameWidth: 28, frameHeight: playerHeight });
		this.load.image('play', 'assets/play.png');
		this.load.image('pause', 'assets/pause.png');
		this.load.image('settings', 'assets/settings.png');
	},
	create: function() {

		initVariables();
		gameContext = this;

		this.cameras.main.fadeIn(500, 255,255,255);

		//WORLD
		//------------------------------------------------------------------------------------------------------
		//Add Background
		createBackground(this); //Draw the background texture
		backgroundImage = this.add.image(resolution[0]/2, resolution[1]/2, 'background'+gameLevel);
		backgroundImage.setDepth(-2);
		backgroundImage.setAlpha(0); //In order to create a fade-in animation for the background
		tween = this.add.tween({ targets: backgroundImage, ease: 'Sine.easeInOut', duration: 1000, delay: 0, alpha: { getStart: () => 0, getEnd: () => 1 } });

		//Set world bounds
		this.physics.world.setBounds(0, 0, resolution[0], resolution[1]);

		//PLAYER
		//------------------------------------------------------------------------------------------------------
		player = this.physics.add.sprite(playerFixedX, playerInitialY, 'player').setScale(resolution[1]/636);
		player.setCollideWorldBounds(false); //So the player can exceed the world boundaries
		player.body.setGravityY(-gravity); //For the player to have an y acceleration; set to (-gravity) to make the player have no y motion at first
		//player.setTint(0x000000); //Set a color mask for the player

		//Player Animations Creation
		this.anims.create({
			key: 'playerRun',
			frames: this.anims.generateFrameNumbers('player', { start: 0, end: 8 }),
			frameRate: 15*Math.sqrt(gameVelocity), //To set the veloticy of "rotation" dependent to the gameVelocity
			repeat: -1 //loop=true
		});

		this.anims.create({
			key: 'playerStop',
			frames: [ { key: 'player', frame: 0 } ],
			frameRate: 2
		});

		this.anims.create({
			key: 'playerFly',
			frames: this.anims.generateFrameNumbers('player-fly', { start: 0, end: 8 }),
			frameRate: 15*Math.sqrt(gameVelocity), //To set the veloticy of "rotation" dependent to the gameVelocity
			repeat: -1 //loop=true
		});

		//PLATFORMS GENERATION
		//------------------------------------------------------------------------------------------------------
		platforms = this.physics.add.staticGroup(); //Platforms empty group creation

		//Generation of the platforms visible when the game starts

		pointer = 0;
		j = 0;
		while(pointer < resolution[0]) {
			newLevel = generateLevel();
			levelValue = newLevel[0];
			levelHeight = newLevel[1];
			levelDuration = newLevel[2];
			createPlatformTexture(this, measurePlatformWidth*levelDuration, platformHeight, levelDuration);
			if(j==0) {
				platformInitialX = (gameInitialX-playerWidth/2)+((measurePlatformWidth*levelDuration)/2)-platformInitialPlayerOffset;
				pointer = platformInitialX;
			}
			else {
				pointer += (measurePlatformWidth*levelDuration)/2;
			}

			lastCreatedPlatform = platforms.create(pointer, levelHeight, 'platform'+levelDuration+platformHeight);
			lastCreatedPlatform.level = levelValue;
			lastCreatedPlatform.duration = levelDuration;
			lastCreatedPlatform.changeLevel = false;
			if(changeLevelEvent) {
				lastCreatedPlatform.changeLevel = true;
				changeLevelEvent = false;
			}

			if(levelValue == 0) {
				lastCreatedPlatform.setVisible(false); //Hide texture
				lastCreatedPlatform.disableBody(); //Disable the body
			}

			levelsQueue.push(levelValue);
			//console.log("levelsQueue: ",levelsQueue);

			pointer += (measurePlatformWidth*levelDuration)/2;

			//Set the first platform as current platform when the game starts
			if(j ==0)
				currentPlatform = lastCreatedPlatform;

			j++;

		}

		//INITIAL SCALE, FIRST HIDDEN PLATFORM GENERATION
		levelValue = 1;
		levelHeight = (player.height*3)+((numberOfLevels-levelValue)*stepHeight)+(stepHeight/2);
		levelDuration = 1/8;

		createPlatformTexture(this, measurePlatformWidth*levelDuration, 1, levelDuration);

		scalePlatform = platforms.create(playerFixedX, levelHeight, 'platform'+levelDuration+1);
		scalePlatform.setVisible(false); //Hide texture


		//GRID GENERATION
		//------------------------------------------------------------------------------------------------------
		createGridTexture(this, measurePlatformWidth, timeSignature); //Draw grid texture
		measureGrids = this.physics.add.staticGroup(); //Grids empty group creation

		gridLength = measurePlatformWidth;
		numberOfInitialMeasures = resolution[0]/measurePlatformWidth;
		for(i=0; i<numberOfInitialMeasures; i++) {
			lastGrid = measureGrids.create((gameInitialX-(playerWidth/2)+(gridLength/2))+(gridLength*i)-platformInitialPlayerOffset, (resolution[1]/2)+playerHeight, 'grid-texture');
			lastGrid.setDepth(-1);
			lastGrid.progressiveNumber = 0; //zero identifies all the grids created when the game is started
		}


		//Creation of collider between the player and the platforms, with a callback function
		collider = this.physics.add.collider(player, platforms, platformsColliderCallback);


		//SCORE
		//------------------------------------------------------------------------------------------------------
		scoreText = this.add.text(16, 16, 'score: '+score, { fontSize: fontSize+'px', fill: fontColor, fontFamily: "Arial" });

		//Change Reference Button
		referenceNoteButton = this.add.text(resolution[0], playerHeight*2.2, 'Play Reference', { fontSize: fontSize+'px', fill: fontColor, fontFamily: "Arial" });
		referenceNoteButton.setBackgroundColor("rgba(240,160,160,0.5)");
		referenceNoteButton.setPadding(8, 8, 8, 8);
		referenceNoteButton.setX(resolution[0]-referenceNoteButton.width-10);
		referenceNoteButton.setY(referenceNoteButton.y-10);
		referenceNoteButton.setInteractive();
		referenceNoteButton.on('pointerdown', () => {
				buttonPlayReference();
		 });

		//Current Mode visualization
		currentScaleText = this.add.text(resolution[0]-((resolution[0]-referenceNoteButton.x)-referenceNoteButton.width), playerHeight*1.8, '', { fontSize: fontSize+2+'px', fill: fontColor, fontFamily: "Arial"}).setOrigin(1);
		currentScaleTextDesc = this.add.text((resolution[0]-((resolution[0]-referenceNoteButton.x)-referenceNoteButton.width)), playerHeight*1.8, 'Current Scale: ', { fontSize: (fontSize-4)+'px', fill: fontColor, fontFamily: "Arial"}).setOrigin(1);
		currentScaleTextDesc.setX(currentScaleText.x-currentScaleText.width);

		if(noteReference.substring(1,2) == '#')
			currentNoteReference = noteReference.substring(0,2);
		else
			currentNoteReference = noteReference.substring(0,1);
		currentScaleText.setText(''+currentNoteReference+' '+gameLevelToScaleArray[gameLevel].charAt(0).toUpperCase() + gameLevelToScaleArray[gameLevel].slice(1));
		currentScaleTextDesc.setX(currentScaleText.x-currentScaleText.width);

	 	//Touch input MANAGER
	 	this.input.on('pointerdown', function(){
    }, this);

		//INTRO MANAGER
		//------------------------------------------------------------------------------------------------------
		statusText = this.add.text(resolution[0]/2, playerHeight*3/2, 'Space/Enter To Play!', {font: "bold 40px Arial", fill: fontColor}).setOrigin(0.5);
		statusText.setShadow(2, 2, 'rgba(0,0,0,0.5)', 2);
		statusText.setAlign('center');
		tween = gameContext.add.tween({ targets: statusText, ease: 'Sine.easeInOut', duration: 300, delay: 0, alpha: { getStart: () => 0, getEnd: () => 1 } });

		statusTextSmall = this.add.text(resolution[0]/2, playerHeight*2, '', {font: "bold 25px Arial", fill: fontColor}).setOrigin(0.5);
		statusTextSmall.setShadow(2, 2, 'rgba(0,0,0,0.5)', 2);
		statusTextSmall.setAlign('center');

		centeredText = this.add.text(resolution[0]/2, resolution[1]/2, '', {font: "bold 190px Arial", fill: fontColor}).setOrigin(0.5);
		centeredText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
		centeredText.setAlign('center');

		// PLAY - SETTINGS BUTTONS
		playPauseButton = this.add.image(resolution[0]-100, (playerHeight*0.6), 'play').setScale(0.8);
		playPauseButton.setInteractive();
		playPauseButton.on('pointerdown', function(){
			manageStatus();
    });

		//Settings button
		settingsButton = this.add.image(resolution[0]-(playerHeight*resolution[1]/636)/2-10, (playerHeight*0.6), 'settings').setScale(0.6);
		settingsButton.setInteractive();
		settingsButton.on('pointerdown', function() {
			game.scene.stop("playScene");
			game.scene.stop("gamoverScene");
			game.scene.stop("pauseScene");
			game.scene.start("settingsScene");
		});

		//SETTING OF GAME STATUS
		//------------------------------------------------------------------------------------------------------
		gameStatus = "Started";
	},

	update: function() {
		if(game.scene.isActive("playScene")){
			//GRID MANAGER
			//------------------------------------------------------------------------------------------------------
			measureGrids.getChildren().forEach(function(p){
				if(p.x < -p.width/2)
					p.destroy(); //Remove grids that are no more visible
			})

			measureGrids.getChildren().forEach(function(p){
				//Move grids (body and texture)
				p.x = p.x - platformVelocity;
				p.body.x = p.body.x - platformVelocity;
			});

			//Creation of new grid measures
			if(lastGrid.x <= resolution[0]-measurePlatformWidth/2){ //When the platform is completely on the screen, generate a new platform
				prevGridNumber = lastGrid.progressiveNumber;

				if(lastGrid.progressiveNumber == 0) { //The first to be created with update function
					lastGrid = measureGrids.create(resolution[0]+(measurePlatformWidth/2)-1, (resolution[1]/2)+playerHeight, 'grid-texture');
					lastGrid.setDepth(-1);
				}
				else {
					lastGrid = measureGrids.create(resolution[0]+(measurePlatformWidth/2), (resolution[1]/2)+playerHeight, 'grid-texture');
					lastGrid.setDepth(-1);
				}
				lastGrid.progressiveNumber = prevGridNumber+1;
			}


			// PLATFORMS MANAGER: MOVEMENT, REMOVAL, CONDITIONS
			//------------------------------------------------------------------------------------------------------
			//Creation of new platforms
			if(lastCreatedPlatform.x <= resolution[0]-lastCreatedPlatform.width/2){ //When the platform is completely on the screen, generate a new platform
				newLevel = generateLevel();
				levelValue = newLevel[0];
				levelHeight = newLevel[1];
				levelDuration = newLevel[2];
				createPlatformTexture(this, measurePlatformWidth*levelDuration, platformHeight, levelDuration);
				lastCreatedPlatform = platforms.create(resolution[0]+(measurePlatformWidth*levelDuration)/2, levelHeight, 'platform'+levelDuration+platformHeight);
				lastCreatedPlatform.level = levelValue;
				lastCreatedPlatform.duration = levelDuration;
				lastCreatedPlatform.changeLevel = false;
				if(changeLevelEvent) {
					lastCreatedPlatform.changeLevel = true;
					changeLevelEvent = false;
				}

				if(levelValue == 0) {
					lastCreatedPlatform.setVisible(false); //Hide texture
					lastCreatedPlatform.disableBody(); //Disable the body
				}

				levelsQueue.push(levelValue);
				//console.log("levelsQueue: ",levelsQueue);
			}

			playerLeftBorder = (gameInitialX-player.width/2);

			platforms.getChildren().forEach(function(p){
				if(p.x < -p.width/2)
					p.destroy(); //Remove platforms that are no more visible
			})

			platforms.getChildren().forEach(function(p){

				//PLATFORM MOVEMENT-REMOVAL MANAGEMENT
				//------------------------------------------------------------------------------------------------------
				//Move platforms (body and texture)
				p.x = p.x - platformVelocity;
				p.body.x = p.body.x - platformVelocity;

				//PLATFORMS CONDITIONAL EVENTS
				//------------------------------------------------------------------------------------------------------
				platformLeftBorder = (p.x-(p.width/2));
				currentPlatformWidth = currentPlatform.width;

				//Set jumpArea when the player enter the jumpArea
				playerEnterJumpArea = (playerLeftBorder > platformLeftBorder+currentPlatformWidth-jumpAreaWidth) && ((playerLeftBorder-gameVelocity) <= (platformLeftBorder+currentPlatformWidth-jumpAreaWidth));
				if(playerEnterJumpArea) {
					//console.log("Entered jump area");
					jumpArea = true;
					noAnswer = true; //Answer again ungiven
					fallBeforePause = false;

					if(levelsQueue[1] == 0) {
						pauseEvent = true;
						playerPauseY = player.y;
						//console.log("playerPauseY", playerPauseY);
					}
				}

				currentPlatformChanged =  (playerLeftBorder > platformLeftBorder) &&  (playerLeftBorder-gameVelocity <= platformLeftBorder); //Condition to summarize when the player enter on another platform

				//Current Platform Changed Event: if no events are triggered before the platform changes, the player was wrong and it has to die, otherwise it jumps to another platform
				if(currentPlatformChanged) {

					//If the player is exiting a pause
					if(levelsQueue[0] == 0) { //The step in which the player enter is levelsQueue[1] because it's before the shift of the removal
						pauseEvent = false;
						player.setGravityY(playerGravity);
					}

					levelsQueue.shift(); //Remove the first element of the list
					//console.log('remove item!: ', levelsQueue);

					//If the player is entering a pause
					if(levelsQueue[0] == 0)  {
						playerEnterPause = true;
						if(pitchDetector.isEnable()){
							 pitchDetector.toggleEnable();
							 //console.log("Pitch detector OFF");
						 }
					}
					else {
						playerEnterPause = false;
					}

					currentPlatform = p;

					if(noAnswer) //Answer ungiven: the player should die
						goAhead = false;

					jumpArea = false;//Not anymore in the jump area

				}
			})


			//PLAYER ANIMATION MANAGER
			//------------------------------------------------------------------------------------------------------
			if(player.body.touching.down && playerFixedX == 200) {
				player.anims.play('playerRun', true);
				player.body.setGravityY(playerGravity);
				gameStatus = "Running"; //The first time change the game status from Started to Running

				//Reset Pause variables when the player touch a platform
				jumpFromPause = false;
				playerEndY = 0;
				endedPauseAnimation = false;

				//Enter only the first time (at the first collide with a step)
				if(score==0) {
					score++;
					scoreText.setText('score: ' + score);
					statusText.setText("Sing!");

					//Hide intro and centered text
					tween = gameContext.add.tween({ targets: statusText, ease: 'Sine.easeInOut', duration: 300, delay: 0, alpha: { getStart: () => 1, getEnd: () => 0 } });
					tween2 = gameContext.add.tween({ targets: statusText, ease: 'Sine.easeInOut', duration: 300, delay: 0, alpha: { getStart: () => 1, getEnd: () => 0 } });
					tween.setCallback(function() {
						statusText.setText();
						centeredText.setText();
					});

					//Check if the first note is played correctly
					if(noAnswer) {
						goAhead = false;
					}
				}
			}
			else {
				if(levelsQueue[0] != 0 || jumpFromPause) {
					player.anims.play('playerStop', true);
				}
				platformTouched = false;
			}

			//Make it possible to pass through the platform if the player comes from below
			if(!player.body.touching.down){
				if(player.y > playerPreviousY+1 && collider.overlapOnly==true) {
					collider.overlapOnly = false;
				}
				playerPreviousY = player.y;
			}

			// PAUSE MANAGER
			//------------------------------------------------------------------------------------------------------

			//Avoid little initial falling of the player
			if(levelsQueue[1] == 0 && player.x>currentPlatform.x+currentPlatform.width/2+initialPauseStability && !fallBeforePause) {
				player.y = playerPauseY;
				player.body.y = playerPauseY;
				player.setGravityY(-gravity);
			}
			//Pause Event Handler
			if(levelsQueue[0] == 0 && !jumpFromPause && pauseEvent) {
				player.body.setGravityY(-gravity); //In order to make the player FLOW
				goAhead = true; //The player can keep going even if there was no answer (pause: you stay silent)

				//This condition is entered only once when the pause starts
				if(playerEnterPause) {
					playerEndY = ((player.height*3)+((numberOfLevels-levelsQueue[1])*stepHeight)+(stepHeight/2))-5; //Save the player y position (need to create the animation)

					//Player translation animation
					pauseStepTween = gameContext.add.tween({ targets: player, ease: 'Sine.easeInOut', duration: (currentPlatform.duration*10000), delay: 0, y: { getStart: () => playerPauseY, getEnd: () =>  playerEndY} });
					//console.log("Start animation");
					pauseStepTween.setCallback("onComplete", function(){
						endedPauseAnimation = true;
						if(!pitchDetector.isEnable()){
							 pitchDetector.toggleEnable();
							 //console.log("End Animation");
						 }
					}, player);

					playerEnterPause = false; //condition should not enter anymore

					//Detect of "change level" type of pause and call of change level and background
					if(currentPlatform.changeLevel && gameModality == GAME_MODE.PROGRESSIVE) {
						changeLevelAndBackground();
						currentScaleTextTween = gameContext.add.tween({ targets: currentScaleText, ease: 'Sine.easeInOut', duration: 300, delay: 0, alpha: { getStart: () => 1, getEnd: () => 0 } });
						currentScaleTextDescTween = gameContext.add.tween({ targets: currentScaleTextDesc, ease: 'Sine.easeInOut', duration: 300, delay: 0, alpha: { getStart: () => 1, getEnd: () => 0 } });
						currentScaleTextTween.setCallback("onComplete", function(){
							if(noteReference.substring(1,2) == '#')
								currentNoteReference = noteReference.substring(0,2);
							else
								currentNoteReference = noteReference.substring(0,1);
							currentScaleText.setText(''+currentNoteReference+' '+gameLevelToScaleArray[gameLevel].charAt(0).toUpperCase() + gameLevelToScaleArray[gameLevel].slice(1));
							currentScaleTextDesc.setX(currentScaleText.x-currentScaleText.width);
						}, currentScaleText);
						gameContext.add.tween({ targets: currentScaleText, ease: 'Sine.easeInOut', duration: 300, delay: 300, alpha: { getStart: () => 0, getEnd: () => 1 } });
						gameContext.add.tween({ targets: currentScaleTextDesc, ease: 'Sine.easeInOut', duration: 300, delay: 300, alpha: { getStart: () => 0, getEnd: () => 1 } });
					}
				}

				if(endedPauseAnimation) {
					player.y = playerEndY;
					player.body.y = playerEndY;
				}

				//Condition needed because the playerWidth with the wings is greater than the normal player
				if(player.x-playerWidth/2-5>currentPlatform.x-currentPlatform.width/2 && player.x+playerWidth/2<currentPlatform.x+currentPlatform.width/2) {
						player.anims.play('playerFly', true);
				}
			}

			//INITIAL SCALE ANIMATION MANAGER
			//------------------------------------------------------------------------------------------------------
			if(gameStatus == "Intro") {
				if(player.body.touching.down && initialScaleNote+1<8){
					initialScaleNote++;
					playLevel(initialScaleNote);
					player.setVelocityY(-1*Math.pow(2*(gravity+playerGravity*(introVelocity/10))*stepHeight*1.5,1/2));
					collider.overlapOnly = true;

					//INITIAL SCALE, HIDDEN PLATFORMS GENERATION
					levelValue = initialScaleNote+1;
					levelHeight = (player.height*3)+((numberOfLevels-levelValue)*stepHeight)+(stepHeight/2);
					levelDuration = 1/8;

					createPlatformTexture(this, measurePlatformWidth*levelDuration, 1, levelDuration);

					scalePlatform = platforms.create(playerFixedX, levelHeight, 'platform'+levelDuration+1);
					scalePlatform.setVisible(false); //Hide texture
				}
				else if(player.body.touching.down && countdown>1) {
					countdown--;
					if(countdown==3) {
						initialScaleNote++;
						playLevel(initialScaleNote);
						statusText.setAlpha(0);
						statusText.setText("Ready?!");
						statusTextTween = gameContext.add.tween({ targets: statusText, ease: 'Sine.easeInOut', duration: 300, delay: 0, alpha: { getStart: () => 0, getEnd: () => 1 } });
					}
					player.setVelocityY(-1*Math.pow(2*(gravity+playerGravity*(introVelocity/10))*stepHeight*2*(636/resolution[1]),1/2));
					centeredText.setAlpha(0);
					centeredText.setText(countdown);
					centeredTextTween = gameContext.add.tween({ targets: centeredText, ease: 'Sine.easeInOut', duration: 300, delay: 0, alpha: { getStart: () => 0, getEnd: () => 1 } });
				}
				else if(player.body.touching.down) { //If you are at the last step, the game should start
					countdown--; //Bring countdown to 0
					centeredText.setText();
					statusText.setText("Sing!");
					noAnswer = true;
					player.setVelocityY(-1*Math.pow(2*(gravity+playerGravity*(introVelocity/10))*stepHeight*2.3*(636/resolution[1]),1/2));

					//Starting Pitch Detector (the condition is not mandatory)
					if(!pitchDetector.isEnable())
						pitchDetector.toggleEnable();

					t = gameContext.add.tween({ targets: player, ease: 'Sine.easeInOut', duration: (800/Math.sqrt(introVelocity*1.5))*Math.sqrt(resolution[1]/636)*1.1, delay: 0, x: { getStart: () => playerFixedX, getEnd: () =>  gameInitialX} });
					t.setCallback("onComplete", function(){
						playerFixedX = gameInitialX;
						player.setGravityY(playerGravity);
					}, player);
				}
			}

			//GAME VELOCITY MANAGER
			//------------------------------------------------------------------------------------------------------
			if(gameStatus == "Running")
				platformVelocity = gameVelocity; //Keeps the platforms velocity updated since when the game is Running

			//GAME OVER HANDLER
			//------------------------------------------------------------------------------------------------------
			if(player.y > resolution[1]+player.height/2) { //When the player is below the screen resolution (no more visible), go to gameoverScene
				game.scene.pause("playScene");
				game.scene.start("gameoverScene");
			}

			//GO TO DEATH MANAGER
			//------------------------------------------------------------------------------------------------------
			if(!goAhead) { //If the player can't go ahead, the colliders with the world are destroyed
				if(gameStatus == "Running"){
					player.body.setGravityY(playerGravity); //Needed to fall when in a pause step
					player.angle += 5; //Death Animation
				}
				this.physics.world.colliders.destroy();
			}
		}
	}
}
game.scene.add("playScene", playScene);

var pauseScene = {
	create: function() {
		//Change Reference Button
		referenceNoteButton.destroy();
		referenceNoteButton = this.add.text(resolution[0], playerHeight*2.2, 'Play Reference', { fontSize: fontSize+'px', fill: fontColor, fontFamily: "Arial" });
		referenceNoteButton.setBackgroundColor("rgba(240,160,160,0.5)");
		referenceNoteButton.setPadding(8, 8, 8, 8);
		referenceNoteButton.setX(resolution[0]-referenceNoteButton.width-10);
		referenceNoteButton.setY(referenceNoteButton.y-10);
		referenceNoteButton.setInteractive();
		referenceNoteButton.on('pointerdown', () => {
			buttonPlayReference();
		 });

		//Set Status Text
		statusTextSmall.setText("");
		statusText.setAlpha(0);
		statusText.setY(playerHeight*3/2);
		statusText.setText('Game Paused\nEnter/Space to resume...');
		tween = this.add.tween({ targets: statusText, ease: 'Sine.easeInOut', duration: 300, delay: 0, alpha: { getStart: () => 0, getEnd: () => 1 } });

		//Play Pause Button
		playPauseButton.destroy();
		playPauseButton = this.add.image(resolution[0]-100, (playerHeight*0.6), 'play').setScale(0.8);
	 	playPauseButton.setInteractive();
	 	playPauseButton.on('pointerdown', function(){
	 	 manageStatus();
	  });

		//Settings button
		settingsButton = this.add.image(resolution[0]-(playerHeight*resolution[1]/636)/2-10, (playerHeight*0.6), 'settings').setScale(0.6);
		settingsButton.setInteractive();
		settingsButton.on('pointerdown', function() {
			game.scene.stop("playScene");
			game.scene.stop("gamoverScene");
			game.scene.stop("pauseScene");
			game.scene.start("settingsScene");
		});
	}
}
game.scene.add("pauseScene", pauseScene);

var gameoverScene = {
	preload: function() {
		this.load.image('restart', 'assets/restart.png');
	},
	create: function() {
		gameoverContext = this;

		gameStatus="Gameover"; //in order to avoid checks made when the gamestatus is running
		player.destroy(); //Destroy the player


		gameoverText = this.add.text(resolution[0]/2, resolution[1]/2, 'Game Over! \nEnter/Space to restart', {font: "bold 70px Arial", fill: fontColor}).setOrigin(0.5);
		gameoverText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
		gameoverText.setAlign('center');

		gameoverText.setAlpha(0);
		statusText.setAlpha(0);

		gameOverTween = gameoverContext.add.tween({ targets: gameoverText, ease: 'Sine.easeInOut', duration: 100, delay: 0, alpha: { getStart: () => 0, getEnd: () => 1 } });

		if(fallBeforePause) {
			statusText.setText('You should have played nothing!'); //Update the status text
		}
		else if(levelsQueue[0]!=0) {
			statusText.setText('You should have played 🔊'); //Update the status text
			playNote(convertLevelToNote(levelsQueue[0]), 1.5) //right note after another note
		}
		else {
			statusText.setText('You should have played 🔊'); //Update the status text
			playNote(convertLevelToNote(levelsQueue[1]), 1.5) //right note after a pause
		}

		statusTextTween = this.add.tween({ targets: statusText, ease: 'Sine.easeInOut', duration: 300, delay: 0, alpha: { getStart: () => 0, getEnd: () => 1 } });
		if(!game.scene.isActive("playScene"))
			statusTextTween = this.add.tween({ targets: statusText, ease: 'Sine.easeInOut', duration: 300, delay: 1000, alpha: { getStart: () => 1, getEnd: () => 0 } });


		if(pitchDetector.isEnable())
			pitchDetector.toggleEnable(); //If the pitch detector is enabled, disable it

		this.input.keyboard.on('keydown', function(e) {
			if(e.key == " " || e.key == "Enter") {
				game.anims.anims.clear() //Remove player animations before restarting the game
				game.textures.remove("grid-texture"); //Remove canvas texture before restarting the game
				game.scene.start("playScene");
				game.scene.stop("gameoverScene");
			}
		});

		//Reference Button
		referenceNoteButton.destroy();
		referenceNoteButton = this.add.text(resolution[0], playerHeight*2.2, 'Play Reference', { fontSize: fontSize+'px', fill: fontColor, fontFamily: "Arial" });
		referenceNoteButton.setBackgroundColor("rgba(240,160,160,0.5)");
		referenceNoteButton.setPadding(8, 8, 8, 8);
		referenceNoteButton.setX(resolution[0]-referenceNoteButton.width-10);
		referenceNoteButton.setY(referenceNoteButton.y-10);
		referenceNoteButton.setInteractive();
		referenceNoteButton.on('pointerdown', () => {
			buttonPlayReference();
		 });

		//Restart button
		playPauseButton.destroy();
		playPauseButton = gameoverContext.add.image(resolution[0]-100, (playerHeight*0.6), 'restart').setScale(0.6);
		playPauseButton.setInteractive();
		playPauseButton.on('pointerdown', function(){
			 game.anims.anims.clear() //Remove player animations before restarting the game
	 		 game.textures.remove("grid-texture"); //Remove canvas texture before restarting the game
	 		 game.scene.start("playScene");
	 		 game.scene.stop("gameoverScene");
		});

		//Settings button
		settingsButton = gameoverContext.add.image(resolution[0]-(playerHeight*resolution[1]/636)/2-10, (playerHeight*0.6), 'settings').setScale(0.6);
		settingsButton.setInteractive();
		settingsButton.on('pointerdown', function() {
			game.scene.stop("playScene");
			game.scene.stop("gameoverScene");
			game.scene.stop("pauseScene");
			game.scene.start("settingsScene");
		});
	}
}
game.scene.add("gameoverScene", gameoverScene);




function createPlatformTexture(context, width, height, levelDuration, color= platformColor) {
	graphics=context.add.graphics();
	graphics.fillStyle(color,1);
	graphics.fillRect(0,0,width-spaceBetweenPlatforms,height); //width-1 to see the division between two platforms at the same level
	graphics.generateTexture('platform'+levelDuration+height, width, height);
	graphics.destroy();
}

function createGridTexture(context, measurePlatformWidth, timeSignature) {

	var texture = 0;
	if(texture == 0)
		texture = context.textures.createCanvas('grid-texture', measurePlatformWidth, resolution[1]-playerHeight*4);
    textureContext = texture.getContext();

	xPointer = 0;
	for(i=0; i<=timeSignature; i++) {
		switch(i) {
			case 0:
				grd = textureContext.createLinearGradient(xPointer, 0, xPointer+5, 0);

				grd.addColorStop(0, "rgba("+gridColor+"0.8)");
				grd.addColorStop(1, "rgba("+gridColor+"0)");

				textureContext.fillStyle = grd;
				textureContext.fillRect(xPointer, 0, xPointer+5, window.innerHeight);
				break;
			case 1:
			case 3:
				grd = textureContext.createLinearGradient(xPointer-1-spaceBetweenPlatforms/2, 0, xPointer+1, 0);

				grd.addColorStop(0, "rgba("+gridColor+"0)");
				grd.addColorStop(0.5, "rgba("+gridColor+"0.8)");
				grd.addColorStop(1, "rgba("+gridColor+"0)");

				textureContext.fillStyle = grd;
				textureContext.fillRect(xPointer-1-spaceBetweenPlatforms/2, 0, xPointer+1, window.innerHeight);
				break;
			case 2:
				grd = textureContext.createLinearGradient(xPointer-2-spaceBetweenPlatforms/2, 0, xPointer+2, 0);

				grd.addColorStop(0, "rgba("+gridColor+"0)");
				grd.addColorStop(0.5, "rgba("+gridColor+"0.8)");
				grd.addColorStop(1, "rgba("+gridColor+"0)");

				textureContext.fillStyle = grd;
				textureContext.fillRect(xPointer-2-spaceBetweenPlatforms/2, 0, xPointer+2, window.innerHeight);
				break;
			case 4:
				grd = textureContext.createLinearGradient(xPointer-5, 0, xPointer, 0);

				grd.addColorStop(0, "rgba("+gridColor+"0)");
				grd.addColorStop(1, "rgba("+gridColor+"0.8)");

				textureContext.fillStyle = grd;
				textureContext.fillRect(xPointer-5, 0, xPointer, window.innerHeight);
				break;
		}
		xPointer+=(measurePlatformWidth/timeSignature);
	}
	texture.refresh();
}


function createBackground(context, color= backgroundGridColor, black = false) {

	if(black) {
		graphics=context.add.graphics();
		yPointer = playerHeight*3; //Starts from the top to draw
		graphics.fillStyle('#000000',1);
		graphics.fillRect(0,yPointer,resolution[0],levelsFieldHeight);
		graphics.strokeRect(0,yPointer,resolution[0],levelsFieldHeight); //Rectangle border
		graphics.generateTexture('background-black',resolution[0],resolution[1]);
		graphics.destroy();
	}
	else {
		graphics=context.add.graphics();

		//From the bottom (position 0) to the top (position 7) of the screen
		yPointer = playerHeight*3; //Starts from the top to draw
		colorsArray = scaleToColorsArray[gameLevelToScaleArray[gameLevel]]
		for (i = 1; i <= colorsArray.length; i++) {
			graphics.fillStyle(colorsArray[scaleToColorsArray[gameLevelToScaleArray[0]].length-i],1);
			graphics.lineStyle(0.1, "0x000000", 1);
			graphics.fillRect(0,yPointer,resolution[0],stepHeight);

			graphics.strokeRect(0,yPointer,resolution[0],stepHeight); //Rectangle border
			yPointer += stepHeight;
		}

		graphics.generateTexture('background'+gameLevel,resolution[0],resolution[1]);

		graphics.destroy();
	}
}

var generateLevel = function() {
	scoreToChangeLevel++;

	durationAndNote = getDurationAndNote();

	if(durationAndNote[0]!=null) {
		levelDuration = durationAndNote[0]; //level Duration i.e.:1, 1/2, 1/4, 1/8, ...
	}
	else {
		console.log("WARNING!!!! YOUR DEVICE WILL EXPLODE!!!!");
		levelDuration = 1;
	}

	if(durationAndNote[1]!=null && scoreToChangeLevel <= pointsToChangeLevel)
		levelValue = durationAndNote[1];
	else if(levelsQueue.length == 0) { //If it's the first level of the game, avoid generation of a pause
			levelValue = Math.floor(Math.random()*(numberOfLevels))+1; //Generate levels without pause
		}
		else {
			//Avoid creation of two successive pauses
			if(levelsQueue[levelsQueue.length-1] == 0){
				levelValue = Math.floor(Math.random()*(numberOfLevels))+1; //Generate levels without pause
			}
			else {
				levelValue = Math.floor(Math.random()*(numberOfLevels+1)); //Generate levels with pause
			}

			if(scoreToChangeLevel == pointsToChangeLevel){ //Avoid creation of a pause before a change of level
				levelValue = Math.floor(Math.random()*(numberOfLevels))+1; //Generate levels without pause
			}
		}

	//Change game level each n points (endless)
	if(scoreToChangeLevel-1 == pointsToChangeLevel && gameModality == GAME_MODE.PROGRESSIVE) {
		changeLevelEvent = true;
		levelValue = 0;
		scoreToChangeLevel = 0;
		levelDuration = changeLevelStatusDuration;
	}

	levelHeight = (player.height*3)+((numberOfLevels-levelValue)*stepHeight)+(stepHeight/2);
	return [levelValue, levelHeight, levelDuration];
}

function platformsColliderCallback () {
	if(!platformTouched && player.body.touching.down && gameStatus=="Running") {
		score++;
		scoreText.setText('score: ' + score);
	}
	platformTouched = true; //Needed to take only the first collision with the platform
}

function changeLevelAndBackground() {
	//console.log("Change Level And Background!");
	gameLevelProgressive++; //Increase progressive level

	//Change Level
	if(gameLevel<gameLevelToScaleArray.length-1 && !lastLevel) {
		gameLevel++;
		if(gameLevel == gameLevelToScaleArray.length-1)
			lastLevel = true;
	}
	else {
		newLevel = Math.round(Math.random()*(gameLevelToScaleArray.length-1)); //After the player reach the last level, random levels will generate
		while(newLevel==gameLevel) {
			newLevel = Math.round(Math.random()*(gameLevelToScaleArray.length-1)); //After the player reach the last level, random levels will generate
		}
		gameLevel = newLevel;
	}

	//Remove Old Background
	tween = gameContext.add.tween({ targets: backgroundImage, ease: 'Sine.easeInOut', duration: 1000, delay: 500, alpha: { getStart: () => 1, getEnd: () => 0 } });
	tween.setCallback("onComplete", function(){
		backgroundImage.destroy();
		backgroundImage = newbackgroundImage;
	}, backgroundImage);

	//Add new background
	createBackground(gameContext);
	changeGameLevel(gameLevel);
	newbackgroundImage = gameContext.add.image(resolution[0]/2, resolution[1]/2, 'background'+gameLevel);
	newbackgroundImage.setAlpha(0);
	newbackgroundImage.setDepth(-2);
	newtween = gameContext.add.tween({ targets: newbackgroundImage, ease: 'Sine.easeInOut', duration: 1000, delay: 0, alpha: { getStart: () => 0, getEnd: () => 1 } });

	//play next scale
	playScale(gameLevelToScaleArray[gameLevel], noteReference, 0.5)

	//Darker Background
	createBackground(gameContext, '#000000', true);
	darkBackgroundImage = gameContext.add.image(resolution[0]/2, resolution[1]/2, 'background-black');
	darkBackgroundImage.setAlpha(0);
	darkBackgroundImage.setDepth(-1);
	changelevelDuration = 2000;
	darkTween = gameContext.add.tween({ targets: darkBackgroundImage, ease: 'Sine.easeInOut', duration: changelevelDuration*4/5, delay: 0, alpha: { getStart: () => 0, getEnd: () => 0.2 } });
	darkTween = gameContext.add.tween({ targets: darkBackgroundImage, ease: 'Sine.easeInOut', duration: changelevelDuration*4/10, delay: changelevelDuration*3.6*changeLevelStatusDuration, alpha: { getStart: () => 0.2, getEnd: () => 0 } });

	statusTextSmall.setAlpha(0);
	statusTextSmall.setText("Mode: "+gameLevelToScaleArray[gameLevel].charAt(0).toUpperCase() + gameLevelToScaleArray[gameLevel].slice(1));
	statusText.setY(playerHeight*1.1);
	gameContext.add.tween({ targets: statusTextSmall, ease: 'Sine.easeInOut', duration: changelevelDuration*4/5, delay: 0, alpha: { getStart: () => 0, getEnd: () => 1 } });
	gameContext.add.tween({ targets: statusTextSmall, ease: 'Sine.easeInOut', duration: changelevelDuration*4/10, delay: changelevelDuration*3.6*changeLevelStatusDuration, alpha: { getStart: () => 1, getEnd: () => 0 } });

	statusText.setAlpha(0);
	statusText.setText("Level "+gameLevelProgressive);
	gameContext.add.tween({ targets: statusText, ease: 'Sine.easeInOut', duration: changelevelDuration*4/5, delay: 0, alpha: { getStart: () => 0, getEnd: () => 1 } });
	statustextLevelTween = gameContext.add.tween({ targets: statusText, ease: 'Sine.easeInOut', duration: changelevelDuration*4/10, delay: changelevelDuration*3.6*changeLevelStatusDuration, alpha: { getStart: () => 1, getEnd: () => 0 } });

	statustextLevelTween.setCallback("onComplete", function(){
		statusText.setY(playerHeight*3/2);
	}, statusText);

	darkTween.setCallback("onUpdate", function(){
		changeLevelTextShown = false;
	}, darkBackgroundImage);

	changeLevelTextShown = true;
}

function manageStatus() {
	switch(gameStatus) {

		case "Started": //The game should start running
			pitchDetector.resumeAudioContext()	//to enable the AudioContext of PitchDetector
			game.scene.resume("playScene"); //Starting scene (update() function starts looping)
			playPauseButton.setTexture('pause');

			if(pitchDetector.isEnable()){
				 pitchDetector.toggleEnable();
			 }

			gameStatus = "Intro";
			player.body.setGravityY(playerGravity*(introVelocity/10));
			player.setVelocityY(-1*Math.pow(2*(gravity+playerGravity*(introVelocity/10))*stepHeight*1.5*636/resolution[1],1/2));
			collider.overlapOnly = true;

			statusText.setText('Listen...');
			tween = gameContext.add.tween({ targets: statusText, ease: 'Sine.easeInOut', duration: 300, delay: 0, alpha: { getStart: () => 0, getEnd: () => 1 } });
			break;

		case "Intro":
			if(game.scene.isActive("playScene")) {
				game.scene.pause("playScene");
				game.scene.start("pauseScene");
				if(pitchDetector.isEnable()){
					 pitchDetector.toggleEnable();
				 }
			}
			else {
				game.scene.resume("playScene");
				game.scene.stop("pauseScene");

				playPauseButton.destroy();
				playPauseButton = gameContext.add.image(resolution[0]-100, (playerHeight*0.6), 'pause').setScale(0.8);
			 	playPauseButton.setInteractive();
			 	playPauseButton.on('pointerdown', function(){
			 	 manageStatus();
			  });

				referenceNoteButton = gameContext.add.text(resolution[0]-150, playerHeight*2.2, 'Play Reference', { fontSize: fontSize+'px', fill: fontColor, fontFamily: "Arial" });
				referenceNoteButton.setBackgroundColor("rgba(240,160,160,0.5)");
				referenceNoteButton.setPadding(8, 8, 8, 8);
				referenceNoteButton.setX(resolution[0]-referenceNoteButton.width-10);
				referenceNoteButton.setY(referenceNoteButton.y-10);
				referenceNoteButton.setInteractive();
				referenceNoteButton.on('pointerdown', () => {
					buttonPlayReference();
				 });

				if(initialScaleNote<8) {
					statusText.setText('Listen...');
					tween = gameContext.add.tween({ targets: statusText, ease: 'Sine.easeInOut', duration: 300, delay: 0, alpha: { getStart: () => 0, getEnd: () => 1 } });
				}
				else if(countdown>0){
					statusText.setText("Ready?!");
					tween = gameContext.add.tween({ targets: statusText, ease: 'Sine.easeInOut', duration: 300, delay: 0, alpha: { getStart: () => 0, getEnd: () => 1 } });
				}
				else {
					statusText.setText("Sing!");
					tween = gameContext.add.tween({ targets: statusText, ease: 'Sine.easeInOut', duration: 300, delay: 0, alpha: { getStart: () => 0, getEnd: () => 1 } });
					if(!pitchDetector.isEnable()){
						 pitchDetector.toggleEnable();
					 }
				}
			}
			break;

		case "Running": //The game should toggle the pause status
			if(game.scene.isActive("playScene")) {
				game.scene.pause("playScene");
				game.scene.start("pauseScene");
				if(pitchDetector.isEnable()){
					 pitchDetector.toggleEnable();
				 }
			}
			else {
				game.scene.resume("playScene");
				game.scene.stop("pauseScene");
				statusText.setText();
				if(changeLevelTextShown) {
					statusTextSmall.setAlpha(0);
					statusTextSmall.setText("Mode: "+gameLevelToScaleArray[gameLevel].charAt(0).toUpperCase() + gameLevelToScaleArray[gameLevel].slice(1));
					statusText.setY(playerHeight*1.1);
					gameContext.add.tween({ targets: statusTextSmall, ease: 'Sine.easeInOut', duration: 300, delay: 0, alpha: { getStart: () => 0, getEnd: () => 1 } });

					statusText.setAlpha(0);
					statusText.setText("Level "+gameLevelProgressive);
					gameContext.add.tween({ targets: statusText, ease: 'Sine.easeInOut', duration: 300, delay: 0, alpha: { getStart: () => 0, getEnd: () => 1 } });
				}

				playPauseButton.destroy();
				playPauseButton = gameContext.add.image(resolution[0]-100, (playerHeight*0.6), 'pause').setScale(0.8);
			 	playPauseButton.setInteractive();
			 	playPauseButton.on('pointerdown', function(){
			 	 manageStatus();
			  });

				//Reload play reference button
				referenceNoteButton = gameContext.add.text(resolution[0]-150, playerHeight*2.2, 'Play Reference', { fontSize: fontSize+'px', fill: fontColor, fontFamily: "Arial" });
				referenceNoteButton.setBackgroundColor("rgba(240,160,160,0.5)");
				referenceNoteButton.setPadding(8, 8, 8, 8);
				referenceNoteButton.setX(resolution[0]-referenceNoteButton.width-10);
				referenceNoteButton.setY(referenceNoteButton.y-10);
				referenceNoteButton.setInteractive();
				referenceNoteButton.on('pointerdown', () => {
					buttonPlayReference();
				 });

				if(!pitchDetector.isEnable()){
					if(levelsQueue[0]==0 && endedPauseAnimation){
						pitchDetector.toggleEnable();
					}
					else if(levelsQueue[0]!=0) {
						pitchDetector.toggleEnable();
					}
				}

				//if next scale was playing, I finish it
				if(scaleOnPlay == true)
					playScale(gameLevelToScaleArray[gameLevel], noteReference, 0.5)

			}
			break;

		default:
			break;
	}
}

var enableKeyDebug = false
var buttonD = false
var buttonB = false

document.onkeydown = function(event) {
	if(!event.repeat){
		if(event.key == "Enter" || event.key == " "){
			manageStatus();
		}
		else if(buttonD && buttonB && ((gameStatus=="Running" && ( player.body.touching.down || (levelsQueue[0] == 0) ) && jumpArea) || (score == 0 && initialScaleNote == 8))) {
					console.log("KEYS")
					//Play a note directly into the pitchDetector module for the pitch detecting step (Debug code)
					noteKeys = "12345678" //Keys To use
					noteFreqKeys = [];
					for(i=0; i<currentScale.length; i++) {
						noteFreqKeys[i] = noteFreq[currentScale[i]];
					}
					//console.log("keys")
					if(parseInt(event.key)>=1 && parseInt(event.key)<=8) {
						//console.log("Note played: ", currentScale[noteKeys.indexOf(event.key)])
						pitchDetector.tuner.play(noteFreqKeys[noteKeys.indexOf(event.key)]);

						//setTimeout(pitchDetector.tuner.stop, 1000)
						//setTimeout(pitchDetector.tuner.oscillator.stop(), 1000)

					}
				}
		

	}
	
}

// function to debug the game with the number keys [1 - 8]
document.onkeypress = function(event) {
	if(!event.repeat){
		if(event.key == "d")
			buttonD = !buttonD
		if(event.key == "b")
			buttonB = !buttonB
	}

}

//stop the play of the oscillator from the keyboard
document.onkeyup = function(event) {
	//console.log("up")
		if((gameStatus=="Running" && ( player.body.touching.down || (levelsQueue[0] == 0) ) && jumpArea)||(score == 0 && initialScaleNote == 8)){
			if(parseInt(event.key)>=1 && parseInt(event.key)<=8){
				//console.log(parseInt(event.key))
				if(pitchDetector.tuner.oscillator != null){
					pitchDetector.tuner.oscillator.stop()
					pitchDetector.tuner.oscillator = null
				}
			}
		}
}

function jumpAtLevel(level) {
	//console.log("called jumpAtLevel", level)
	if(score == 0 && initialScaleNote == 8 && level == levelsQueue[0]) {
		noAnswer = false;
	}
	else if(gameStatus=="Running" && ( player.body.touching.down || (levelsQueue[0] == 0) ) && jumpArea && level!=0) {
		if(levelsQueue[0] == 0) {
			jumpRatio = 1.5;

			if(level == levelsQueue[1]) //If the answer is correct
				jumpFromPause = true; //Need to remove the "fly" texture of the player when it jumps out of the pause
		} else
			jumpRatio = String(levelsQueue[1]-levelsQueue[0]+1);

		//If the note detected is correct:
		if(level == levelsQueue[1] && parseInt(jumpRatio) > 0 && noAnswer==true) { //Go up
			//console.log("jump Up!", level);
			player.body.setGravityY(playerGravity);
			player.setVelocityY(-1*Math.pow(2*(gravity+playerGravity)*stepHeight*jumpRatio,1/2));
			collider.overlapOnly = true;

			goAhead = true; //The answer is correct
			noAnswer = false; //An answer has been given
		} else if (level == levelsQueue[1] && noAnswer==true) { //Go down
					//console.log("jump Down!", level);
					player.body.setGravityY(playerGravity);
					player.setVelocityY(-1*Math.pow(2*(gravity+playerGravity)*stepHeight*1,1/2));
					goAhead = true;
					noAnswer = false;
				}
				//Else go ahead remain false and the player fall down

		//In order to fall down if you play something before entering the pause
		if(level!=levelsQueue[0] && levelsQueue[1] == 0 && (level == 1 || level == 2 || level == 3 || level == 4 || level == 5 || level == 6 || level == 7 || level == 8 )) {
			noAnswer = false;
			goAhead = false;
			pauseEvent = false; //Avoid starting of the pause animation
			fallBeforePause = true; //Needed to show the right message for this event
			//console.log("Next is pause, you play something!");
		}

	}
	else if(level == -1 && player.body.touching.down && gameStatus=="Running") {
					//goAhead = false; //The player fall down if a wrong note is singed (even out of the jump area)
					player.body.setGravityY(playerGravity);
				}
}

game.scene.start("settingsScene");
