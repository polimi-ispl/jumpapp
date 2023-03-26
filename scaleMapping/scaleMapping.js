// the following code magage global informazion about music:
// calculation of the note frequencies, correlation between scale and level and reproduce sound of note or scale


// calulate tones from C2 to A5
var noteFreq = []  //array with the notation note as index and the relative frequency as value
numTones = 49
var tones = []
for(i=0; i<numTones; i++){
  freq = 55*Math.pow(2,1/12)**i
  tones[i] = Number(Math.round(freq+'e2')+'e-2'); // round at second decimals
}

octave = 1
letters = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]

for(i=0; i<tones.length; i++){
  if(i%12 == 3)
    octave++
  noteLetter = letters[i%12] + octave
  noteFreq[noteLetter] = tones[i]
}

// --------------------------------------------------------------------------

// intervals colors
fundamental = "0xff6b63"; //red
majorThird = "0xffc2bf";  //pink
perfectFifth = "0xff9993";  //light-red
augFourth = "0xebff96"; //yellow
majorInt = "0xffffff";  //majorIntC
minorInt = "0x999cff";  //blue

//ternary mapping
/*
var levelScaleColorsMatrix = [["ionian",[1,0,1,0,1,1,0,1,0,1,0,1,1],[fundamental, majorInt, majorThird, majorInt, perfectFifth, majorInt, majorInt, fundamental]],
    ["lydian",[1,0,1,0,1,0,1,1,0,1,0,1,1],[fundamental, majorInt, majorThird, augFourth, perfectFifth, majorInt, majorInt, fundamental]],
    ["mixolydian",[1,0,1,0,1,1,0,1,0,1,1,0,1],[fundamental, majorInt, majorThird, majorInt, perfectFifth, majorInt, minorInt, fundamental]],
    ["dorian",[1,0,1,1,0,1,0,1,0,1,1,0,1],[fundamental, majorInt, minorInt, majorInt, perfectFifth, majorInt, minorInt, fundamental]],
    ["eolian",[1,0,1,1,0,1,0,1,1,0,1,0,1],[fundamental, majorInt, minorInt, majorInt, perfectFifth, minorInt, minorInt, fundamental]],
    ["phrigian",[1,1,0,1,0,1,0,1,1,0,1,0,1],[fundamental, minorInt, minorInt, majorInt, perfectFifth, minorInt, minorInt, fundamental]],
    ["locryan",[1,1,0,1,0,1,1,0,1,0,1,0,1],[fundamental, minorInt, minorInt, majorInt, minorInt, minorInt, minorInt, fundamental]]]
    */

var scaleToStepsArray=[]
scaleToStepsArray["ionian"] = [1,0,1,0,1,1,0,1,0,1,0,1,1]
scaleToStepsArray["lydian"] = [1,0,1,0,1,0,1,1,0,1,0,1,1]
scaleToStepsArray["mixolydian"] = [1,0,1,0,1,1,0,1,0,1,1,0,1]
scaleToStepsArray["dorian"] = [1,0,1,1,0,1,0,1,0,1,1,0,1]
scaleToStepsArray["aeolian"] = [1,0,1,1,0,1,0,1,1,0,1,0,1]
scaleToStepsArray["phrygian"] = [1,1,0,1,0,1,0,1,1,0,1,0,1]
scaleToStepsArray["locrian"] = [1,1,0,1,0,1,1,0,1,0,1,0,1]

var scaleToColorsArray = []
scaleToColorsArray["ionian"] = [fundamental, majorInt, majorThird, majorInt, perfectFifth, majorInt, majorInt, fundamental]
scaleToColorsArray["lydian"] = [fundamental, majorInt, majorThird, augFourth, perfectFifth, majorInt, majorInt, fundamental]
scaleToColorsArray["mixolydian"] = [fundamental, majorInt, majorThird, majorInt, perfectFifth, majorInt, minorInt, fundamental]
scaleToColorsArray["dorian"] = [fundamental, majorInt, minorInt, majorInt, perfectFifth, majorInt, minorInt, fundamental]
scaleToColorsArray["aeolian"] = [fundamental, majorInt, minorInt, majorInt, perfectFifth, minorInt, minorInt, fundamental]
scaleToColorsArray["phrygian"] = [fundamental, minorInt, minorInt, majorInt, perfectFifth, minorInt, minorInt, fundamental]
scaleToColorsArray["locrian"] = [fundamental, minorInt, minorInt, majorInt, minorInt, minorInt, minorInt, fundamental]

var gameLevelToScaleArray = []
gameLevelToScaleArray[0] = "ionian"
gameLevelToScaleArray[1] = "lydian"
gameLevelToScaleArray[2] = "mixolydian"
gameLevelToScaleArray[3] = "dorian"
gameLevelToScaleArray[4] = "aeolian"
gameLevelToScaleArray[5] = "phrygian"
gameLevelToScaleArray[6] = "locrian"

var scales = gameLevelToScaleArray // to have the scales name of the modes

var GAME_MODE = {
  STATIC: 1,
  PROGRESSIVE: 2
};

//-------------------------------------------------------------------------------------------
/*
* Useful methods to reproduce sounds (notes, scales, ...)
* It use an external library "AudioSynth"
* Reference: http://keithwhor.github.io/audiosynth/
*/

Synth instanceof AudioSynth; // true
Synth.setVolume(0.8)
var pianoInstrument = Synth.createInstrument('piano');

// note is a musical note (ex C#5)
// durationSingleNote is in seconds
function playNote(note, duration){
  // example:
  // piano.play('C', 4, 2); -> plays C4 for 2s using the 'piano' sound profile
  if(scaleOnPlay)
    note = playNoteQueue[0]
  name = note.substring(0,note.length-1)
  octave = note.substring(note.length-1, note.length)
  d = Math.abs(duration)

  //if(game.scene.isActive("playScene") || gameStatus=="Gameover"){
  if(!game.scene.isActive("pauseScene")){
    pianoInstrument.play(name, octave, d)

    if(scaleOnPlay){ //check if i was playing a scale and to manage the pause
      playNoteQueue.shift()
      if(playNoteQueue.length == 0)
        scaleOnPlay = false
      else
        setTimeout(playNote, d/2*1000, null, d)
    }
  }
}


// play a level of the gameGrid: based on the currentScale and the current noteReference
function playLevel(level){
  if(level > 0 && level < 9)
  note = currentScale[level-1]
  playNote(note, 1) // play note with 1 sec of duration
}

// scale is the name scale to play (ex dorian)
// fundamental is the starting note to play the specific scale (ex C#5)
// durationSingleNote is in seconds
// -> this method manage if during the play of one scale the player put on pause the game. then restard from the previous note
var indexNote = 0
var scaleOnPlay = false
var playNoteQueue = []

function playScale(scale, fundamental, durationSingleNote){
  scaleOnPlay = true

  if(playNoteQueue.length == 0) {
    stepScale = getScale(scaleToStepsArray[scale], fundamental) //return in form of ["C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4"]
    for(i = 0; i<stepScale.length; i++){
      playNoteQueue[i] = stepScale[i]
    }
  }
  // playNoteQueue are the note to play
  d = Math.abs(durationSingleNote)

  playNote(playNoteQueue[0], d*2)

  /*for(j = 0; j<playNoteQueue.length && game.scene.isActive("playScene"); j++){
    setTimeout(playNote, d*j*1000, null, d*2) // call playNote(note, d) after d/2 second (scanning the scale)
  }*/

}


//**********************************************************************************************************************************
// the following code manage the incoming event of a new note detected from the pitch module and 
// check if there is a correlation between the current scale in the game

var noteReference = "C3"
var scaleStepsReference = scaleToStepsArray["ionian"]
var currentScale = getScale(scaleStepsReference, noteReference)


// convert a musical note (ex "A#3") to a level between 1 - 8 (the diatonic interval)
// if return 0 means the musical note is not in the current scale
function convertNoteToLevel(note){
  switch(note){
  case currentScale[0]: level = 1; break;
  case currentScale[1]: level = 2; break;
  case currentScale[2]: level = 3; break;
  case currentScale[3]: level = 4; break;
  case currentScale[4]: level = 5; break;
  case currentScale[5]: level = 6; break;
  case currentScale[6]: level = 7; break;
  case currentScale[7]: level = 8; break;
  default: level = 0; break;
  }
  return level
}

// convert a level between 1 - 8 (the diatonic interval, ex 3) to a musical note 
// if return 0 means the level is not in the current scale
function convertLevelToNote(level){
  switch(level){
  case 1: note = currentScale[0]; break;
  case 2: note = currentScale[1]; break;
  case 3: note = currentScale[2]; break;
  case 4: note = currentScale[3]; break;
  case 5: note = currentScale[4]; break;
  case 6: note = currentScale[5]; break;
  case 7: note = currentScale[6]; break;
  case 8: note = currentScale[7]; break;
  default: note = 0; break;
  }
  return note
}

/*
* this function is called from the pitchDetector Module when a new note is detected
* musicalNote = a note with its octave: ex C#3
*/function newNote(musicalNote){
  	level = 0
    level = convertNoteToLevel(musicalNote)

    /*
    if(level!=0)
      console.log(musicalNote)
      console.log(level)
    */
    
  	//CALL graphicsModule
  	jumpAtLevel(level)
}

//calucate the current scale based on the note and scale reference in setting
function getScale(scaleStep, fundamental){
    scale =[]
    index=0
    extractLetterReference = fundamental.substring(0, fundamental.length-1)
    extractOctaveReference = parseInt(fundamental.substring(fundamental.length-1))

    // calculate the scale
    j=letters.indexOf(extractLetterReference)
    for(i=0; i<scaleStep.length; i++){
      if(scaleStep[i]==1){
        scale[index] = letters[j]
        index++
      }
      j++
      if(j%12==0)
        j=0
    }


    // update the correct octave
    changeOctave = false
    scale[0] += extractOctaveReference
    for(i=1; i<scale.length; i++){
      if(scale[i-1] != "C"+extractOctaveReference && (scale[i] == "C" || scale[i] == "C#") && !changeOctave){
        extractOctaveReference++
        changeOctave = true
      }
      scale[i] += extractOctaveReference
    }

    return scale;

}

/* function called from Graphics module
* numLevelGame is in the range [0 - 6]
*/
function changeGameLevel(numLevelGame){
  if(numLevelGame < gameLevelToScaleArray.length)
    scaleStepsReference = scaleToStepsArray[gameLevelToScaleArray[numLevelGame]]
  else
    consolo.log("Error in parameter !")
  //levelScaleColorsMatrix[numLevelGame][1]
  currentScale = getScale(scaleStepsReference, noteReference)
}


/* function called from the Sync module
* note: is a musical note (ex A#4)
* scale: is the musical scale (ex dorian)
* gameMode: standard or progressive
*/
function setReference(note, scale){
  // set the note reference if it is correct
  if(noteFreq[note] != undefined)
    changeNoteReference(note)
  else
    console.log("Note parameter Error")

  // set the scale reference if it is correct
  if(scale.indexOf(scale) != -1)
    changeScaleReference(scale)
  else
    console.log("Scale parameter Error")
}


function changeNoteReference(note){
	noteReference = note;
  currentScale = getScale(scaleStepsReference, noteReference)
}

function changeScaleReference(scale){
  scaleStepsReference = scaleToStepsArray[scale];
  currentScale = getScale(scaleStepsReference, noteReference)
}

function buttonPlayReference(){
  name = noteReference.substring(0,noteReference.length-1)
  octave = noteReference.substring(noteReference.length-1, noteReference.length)
  pianoInstrument.play(name, octave, 2)

}