// classical patterns
var patterns = [] // this disctionary represents one period of the pattern
patterns[0] = [+1]  //ascending scale notes
patterns[1] = [+2, -1]  //ascending diatonic thirds
patterns[2] = [-2, +1]  //descending diatonic thirds
patterns[3] = [+2, +2, -3]  //ascending triads
patterns[4] = [-2, -2, +3]  //descending triads
patterns[5] = [+1, +1, -1]  //ascending diatonic first three notes
patterns[6] = [-1, -1, +1]  //descending diatonic first three notes
patterns[7] = [+2, +2, +1, -2, -2, +1]  //ascending triad arpeggio sequence

var patternQueue = [] // it cointatins a sequence of note

/*
* function called from graphics module
* return a pair values represented the duration and a note
* duration = a musical fraction in Float type
* note = an advice note to play, if this variable is null, the note can be randomic
*/
function getDurationAndNote(){
  duration = -1
  noteLevel = null

  if(patternQueue.length != 0){   // ho un pattern da finire
    duration = 0.125  // it correspond to 1/8
    noteLevel = patternQueue.shift() // get the fisrt element of the queue
  }
  else{ // scelgo randomicamente una durata
    
    /*  assegnare una probabilità:
        ho i valori e i pesi 
        chiamo il Math.random che mi da valori da 0 a 1
        se quello che ottengo è fra x e y (rispetto alle probabilità che ho deciso) assegno il valore corrispondente
    */

    probability = Math.random() // returns a floating-point, pseudo-random number in the range 0–1 (inclusive of 0, but not 1)
    
    // get keys from the dictionary: the durations of notes
    keys = []
    for(var x in statisticalDuration){
      keys.push(x)
    }

    // choice of the random duration
    start = 0
    end = 0
    for(i=0; i<keys.length; i++){
      end += statisticalDuration[keys[i]]
      if(start <= probability && probability < end){
        duration = keys[i]
      }
      start += statisticalDuration[keys[i]]
    }

    // if the choice is a pattern restituisco una nota fino alla sua fine
    if(duration == "pattern"){
      //duration = "0.125"
      duration = 0.125  // it correspond to 1/8
      patternQueue = newPattern()
      noteLevel = patternQueue.shift() // get the fisrt element of the queue
    }
    //if(duration == "1")
      //console.log("lungoooo")
  }

  return [parseFloat(duration), noteLevel]
}


// this function returns a pattern of level notes in a queue
// the patterns starts from a random level of the scale and it has a random length (min 1 periods). But all the pattern is within the octave
function newPattern(){
  queue = []
  patChoice = patterns[Math.floor(Math.random() * patterns.length)]    // returns a random pattern from the defined list of patterns
  firstLevel = Math.floor(Math.random() * currentScale.length) + 1  // returns a random note from the current scale (actually from 1 to 8)
  directionOfPatter = patChoice.reduce(add,0) // sum of all the element of the patter
  // if directionOfPatter is > 0 then the pattern is ascending
  // if directionOfPatter is < 0 then the pattern is descending

  // choose the rigth first note to execute at least one period of the pattern
  maxInterval = Math.max.apply(null, patChoice.map(Math.abs)); // get the max interval in abs
  //console.log("maxInterval: "+ maxInterval)
  if (directionOfPatter > 0)  // ascending direction
    if(currentScale.length - firstLevel < maxInterval){ // nonabbastanza note per fare un periodo di pattern
      // cambio il punto iniziale per avere almento un periodo
      firstLevel = currentScale.length - maxInterval
    }
  else {
    if(firstLevel < maxInterval){ // non abbastanza note per fare un periodo di pattern
      // cambio il punto iniziale per avere almento un periodo
      firstLevel = maxInterval
    }
  }
//console.log("pattern: "+ patChoice)
  //console.log("firstLevel: "+ firstLevel)
  // inserisco i livelli del pattern
  level = firstLevel
  index = 0
  while(level <= currentScale.length && level >= 1){
    //console.log(index)
    queue.push(level)
    level += patChoice[index]
    index++
    if(index == patChoice.length)
      index = 0
  }

  
  return queue
}

// sum of two values
function add(a, b) {
    return a + b;
}

// grammar of duration of note and their relative probability (narmalised to 1)
statisticalDuration = []
statisticalDuration[1/4] = 0.33
statisticalDuration[1/8] = 0.23
statisticalDuration[1/16] = 0.01

statisticalDuration[3/8] = 0.12
statisticalDuration[2/4] = 0.08
statisticalDuration[3/4] = 0.02
statisticalDuration[4/4] = 0.01

statisticalDuration["pattern"] = 0.2
