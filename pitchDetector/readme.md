<h1>PitchDetector Module</h1>

This module detect the pitch from the microphone device.

<b>Usage:</b><br>
In the html file insert these reference
    <blockquote><script src="pitchDetector/aubio.js"></script><br>
		<script src="pitchDetector/tuner.js"></script><br>
		<script src="pitchDetector/notes.js"></script><br>
		<script src="pitchDetector/pitchModule.js"></script><br>
    </blockquote>
    
Inizialize the module:
    <blockquote>const pitchDetector = new PitchDetector()<br>
    pitchDetector.start()<br>
    </blockquote>
    
Enable or disable the pitchDetector
    <blockquote>pitchDetector.toggleEnable()<br>
    </blockquote>
    
Check if the pitch detection is enable:
    <blockquote>pitchDetector.isEnable()    ->    return a boolean value<br>
    </blockquote>
    

    
