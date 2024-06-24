let currentSet = 1;

let touchThreshold = 30; // Adjust this threshold as needed
let startX, startY;

let cylinderYCoordinates;
let clearButton;
let canvasTopBoundary = 70;

// start index for array starting index - playback
let angleX = 0;
let angleY = 0;
let angleZ = 0;
let cylinderCoordinates = [];
let colors = [];
let notes = [];

// mouse dragging
let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;

// rotational value is between 0 and 1
let rotationalValue = 0;

let addButton;
let removeButton;

let note_duration = 200; // Duration of each note in ms


let totalHorizontalPoints = 32;
let totalVerticalPoints = 3;

// Total duration of all notes
let totalDuration = note_duration * totalHorizontalPoints;

// audio playback setup
let audioBuffers = [];
let timeouts = [];
let isPlaying = false;
let audioContext;
let bufferLoader;
let startTime;
let playButton;
let durationSlider;
let timeoutIds = [];

// BufferLoader class to handle loading audio files
function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = [];
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  let request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  let loader = this;

  request.onload = function() {
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          console.error('Error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length) {
          loader.onload(loader.bufferList);
        }
      },
      function(error) {
        console.error('decodeAudioData error for ' + url, error);
      }
    );
  };

  request.onerror = function() {
    console.error('BufferLoader: XHR error for ' + url);
  };

  request.send();
};

BufferLoader.prototype.load = function() {
  for (let i = 0; i < this.urlList.length; ++i) {
    this.loadBuffer(this.urlList[i], i);
  }
};

// Line color variables
let defaultLineColor = [0, 0, 0, 40]; // Light grey with some transparency
let activeLineColor = [255, 255, 255]; // White color for active line
let lineColors = Array(totalVerticalPoints).fill(defaultLineColor);
// Define line parameters

let lineSpacing = 37;

function preload() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  loadAudioSet(currentSet);
}

function loadAudioSet(setNumber) {
  let filePaths = [];
  if (setNumber === 1) {
    filePaths = [
      'comb/0.mp3',
      'comb/1.mp3',
      'comb/2.mp3',
      'comb/3.mp3',
      'comb/4.mp3',
      'comb/5.mp3',
      'comb/6.mp3',
      'comb/7.mp3',
      'comb/8.mp3',
      'comb/9.mp3',
      'comb/10.mp3',
      'comb/11.mp3',
      'comb/12.mp3',
      'comb/13.mp3',
      'comb/14.mp3',
      'comb/15.mp3',
      'comb/16.mp3',
      'comb/17.mp3',
      'comb/18.mp3',
      'comb/19.mp3',
      'comb/20.mp3',
      'comb/21.mp3',
      'comb/22.mp3',
      'comb/23.mp3',
      'comb/24.mp3',
      'comb/25.mp3',
      'comb/26.mp3',
      'comb/27.mp3',
      'comb/28.mp3',
      'comb/29.mp3',
      'comb/30.mp3',
      'comb/31.mp3',
      'comb/32.mp3',
      'comb/33.mp3',
      'comb/34.mp3',
      'comb/35.mp3',
      'comb/36.mp3'
    ];
  } else if (setNumber === 2) {
    filePaths = [
      'piano/0.mp3',
      'piano/1.mp3',
      'piano/2.mp3',
      'piano/3.mp3',
      'piano/4.mp3',
      'piano/5.mp3',
      'piano/6.mp3',
      'piano/7.mp3',
      'piano/8.mp3',
      'piano/9.mp3',
      'piano/10.mp3',
      'piano/11.mp3',
      'piano/12.mp3',
      'piano/13.mp3',
      'piano/14.mp3',
      'piano/15.mp3',
      'piano/16.mp3',
      'piano/17.mp3',
      'piano/18.mp3',
      'piano/19.mp3',
      'piano/20.mp3',
      'piano/21.mp3',
      'piano/22.mp3',
      'piano/23.mp3',
      'piano/24.mp3',
      'piano/25.mp3',
      'piano/26.mp3',
      'piano/27.mp3',
      'piano/28.mp3',
      'piano/29.mp3',
      'piano/30.mp3',
      'piano/31.mp3',
      'piano/32.mp3',
      'piano/33.mp3',
      'piano/34.mp3',
      'piano/35.mp3',
      'piano/36.mp3'
    ];
  }

  bufferLoader = new BufferLoader(
    audioContext,
    filePaths,
    finishedLoading
  );
  bufferLoader.load();
}

function finishedLoading(bufferList) {
  for (let i = 0; i < bufferList.length; i++) {
    audioBuffers[i] = bufferList[i];
  }
}

let radius;
let cylinderHeight;

// define some scale mappings
// 1. majorPentatonic
// 2. minorPentatonic
// 3. etc etc


let majorPentatonic = {
  0: 0,
  1: 2,
  2: 4,
  3: 7,
  4: 9,
  5: 12,
  6: 14,
  7: 16,
  8: 19,
  9: 21,
  10: 24,
  11: 26,
  12: 28,
  13: 31,
  14: 33,
  15: 36
}

let minorPentatonic = {
  0: 0,
  1: 3,
  2: 5,
  3: 7,
  4: 10,
  5: 12,
  6: 15,
  7: 17,
  8: 19,
  9: 22,
  10: 24,
  11: 27,
  12: 29,
  13: 31,
  14: 34,
  15: 36
}

let ionian = {
  0: 0,
  1: 2,
  2: 4,
  3: 5,
  4: 7,
  5: 9,
  6: 11,
  7: 12,
  8: 14,
  9: 16,
  10: 17,
  11: 19,
  12: 21,
  13: 23,
  14: 24,
  15: 26
}

// initial scale mapping (ie the default)
let scaleMappings = majorPentatonic;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(60);

  // Calculate and store the initial cylinder coordinates
  radius = windowWidth * 0.2; // 50% of the screen width
  cylinderHeight = windowHeight * 0.4; // 60% of the screen height
  
  // create play button
  createPlayButton();
  
  // Create Add and Remove buttons
  addButton = createButton('+');
  addButton.mousePressed(addNote);
  
  removeButton = createButton('-');
  removeButton.mousePressed(removeNote);
  
  positionplus_minus_Buttons();
  
  // Create the slider for duration
  durationSlider = createSlider(200, 1000, 800); // Min 200 ms, Max 1s, Initial 200 ms
  positionDurationSlider();
  
  note_duration = durationSlider.value();
  totalDuration = note_duration * totalHorizontalPoints; // Initialize total duration based on initial note duration
  
  // Clear button
  clearButton = createButton('✖');
  clearButton.mousePressed(clearNotes);
  positionclearButton();
  
  // Scale dropdown
  scalesDropdown = createSelect();
  
  // Add options
  scalesDropdown.option('Select a Scale:', ''); // This will be the heading

  scalesDropdown.option('--- Pentatonic ---', 'disabled');
  scalesDropdown.option('Major');
  scalesDropdown.option('Minor');

  scalesDropdown.option('--- Modal ---', 'disabled');
  scalesDropdown.option('Ionian');
  scalesDropdown.option('Dorian');
  scalesDropdown.option('Mixolydian');
  scalesDropdown.option('Aeolian');
  
  scalesDropdown.option('--- Other ---', 'disabled');
  scalesDropdown.option('Chromatic');
  scalesDropdown.option('Harmonic Minor');
  scalesDropdown.option('Whole Tone');
  scalesDropdown.option('Octatonic');

  // Set a callback function for when an option is selected
  scalesDropdown.changed(changeScale);

  // Instrument dropdown
  instrumentDropdown = createSelect();
  
  // Add options to the dropdown
  instrumentDropdown.option('Select an Instrument:', '');
  instrumentDropdown.option('Comb');
  instrumentDropdown.option('Piano');
  instrumentDropdown.option('etc');
  instrumentDropdown.option('etc');

  // Set a callback function for when an option is selected
  instrumentDropdown.changed(changeInstrument);  
  
  positionDropdownMenus();
  
  // initialise points

  for (let i = 0; i < totalVerticalPoints; i++) {
    let y = map(i, 0, totalVerticalPoints, cylinderHeight / 2, -cylinderHeight / 2);
    let rowCoordinates = [];
    let rowColors = [];
    let rowNotes = [];

    for (let j = 0; j < totalHorizontalPoints; j++) {
      let angle = map(j, 0, totalHorizontalPoints, 0, TWO_PI);

      let x = radius * cos(angle);
      let z = radius * sin(angle);

      rowCoordinates.push({ x, y, z });
      rowColors.push(color(0, 0, 0, 35)); // Initialize with light grey
      rowNotes.push(false); // Initialize as not filled
    }

    cylinderCoordinates.push(rowCoordinates);
    colors.push(rowColors);
    notes.push(rowNotes);
  }
}

function draw() {
  background(250);

  if (isPlaying) {
    let elapsedTime = millis() - startTime;
    rotationalValue = (elapsedTime % totalDuration) / totalDuration;
    angleY = rotationalValue * TWO_PI;
  }  
  
  calculateCylinderY();

  // Draw the fixed horizontal lines
  drawfixedHorizontalLines(cylinderYCoordinates);
  
  if (keyIsDown(RIGHT_ARROW)) {
    angleY -= 0.015;
    rotationalValue = angleY / TWO_PI % 1;
  }
  if (keyIsDown(LEFT_ARROW)) {
    angleY += 0.015;
    rotationalValue = angleY / TWO_PI % 1;
  }

  for (let i = 0; i < cylinderCoordinates.length; i++) {
    for (let j = 0; j < cylinderCoordinates[i].length; j++) {
      let coords = cylinderCoordinates[i][j];
      let { x, y, z } = coords;
      let projectionMath = SphericalProjection(x, y, z, angleX, angleY, angleZ);
      let scaleFactor = 400 / (projectionMath.z + 300);
      let projectedX = projectionMath.x * scaleFactor;
      let projectedY = projectionMath.y * scaleFactor;

      let alpha = map(scaleFactor, 0.9, 2, 0, 255);
      // was 0.9, 2, 0, 255

      if (notes[i][j]) {
        fill(0, alpha);
      } else {
        noFill();
      }

      stroke(0, alpha);
      strokeWeight(0.7);

      ellipse(projectedX, projectedY, 8, 8);
    }
  }
}


function SphericalProjection(x, y, z, angleX, angleY, angleZ) {
  // Precompute sine and cosine of angles
  const cosX = Math.cos(angleX);
  const sinX = Math.sin(angleX);
  const cosY = Math.cos(angleY);
  const sinY = Math.sin(angleY);
  const cosZ = Math.cos(angleZ);
  const sinZ = Math.sin(angleZ);

  // Rotate around Z-axis
  let tempX = x * cosZ - y * sinZ;
  let tempY = x * sinZ + y * cosZ;
  x = tempX;
  y = tempY;

  // Rotate around Y-axis
  tempX = x * cosY + z * sinY;
  let tempZ = -x * sinY + z * cosY;
  x = tempX;
  z = tempZ;

  // Rotate around X-axis
  tempY = y * cosX - z * sinX;
  tempZ = y * sinX + z * cosX;

  return { x: tempX, y: tempY, z: tempZ };
}


function mousePressed() {
  isDragging = false; // Initially not dragging
  previousMouseX = mouseX;
  previousMouseY = mouseY;
}

function mouseDragged() {
  // Check if mouse is within the defined area
  if (mouseY > canvasTopBoundary) {
    isDragging = true; // Mouse is being dragged

    let deltaX = mouseX - previousMouseX;
    let deltaY = mouseY - previousMouseY;

    angleY -= deltaX * 0.008; // Adjust sensitivity as needed
    rotationalValue = angleY / TWO_PI % 1;

    previousMouseX = mouseX;
    previousMouseY = mouseY;
  }
}

function mouseReleased() {
  // Check if mouse is within the defined area
  if (mouseY > canvasTopBoundary) {
    if (!isDragging) {
      handleNoteClick(); // Handle note creation if not dragging
    }
  }
}
function handleNoteClick() {
  translate(width / 2, height / 2);
  let nearestPoint = null;
  let nearestDistance = Infinity; // Track the nearest distance

  for (let i = 0; i < cylinderCoordinates.length; i++) {
    for (let j = 0; j < cylinderCoordinates[i].length; j++) {
      let coords = cylinderCoordinates[i][j];
      let { x, y, z } = coords;
      let projectionMath = SphericalProjection(x, y, z, angleX, angleY, angleZ);
      let scaleFactor = 400 / (projectionMath.z + 300);
      let projectedX = projectionMath.x * scaleFactor;
      let projectedY = projectionMath.y * scaleFactor;

      // Check the distance between mouse and projected point
      let d = dist(mouseX - width / 2, mouseY - height / 2, projectedX, projectedY);

      // Consider the point if it's closer than previous points and within a 10-pixel radius
      if (d < nearestDistance && d < 10) {
        let alphaThreshold = 100; // Adjust for better alpha detection
        let alphaValue = map(scaleFactor, 0.9, 2, 0, 255);
        if (alphaValue >= alphaThreshold) {
          nearestPoint = { x: projectedX, y: projectedY, i, j };
          nearestDistance = d; // Update the nearest distance
        }
      }
    }
  }

  // Toggle the note at the nearest point if one was found
  if (nearestPoint !== null) {
    let { i, j } = nearestPoint;
    if (notes[i][j]) {
      colors[i][j] = color(0, 0, 0, 35);
      notes[i][j] = false;
    } else {
      colors[i][j] = color(0, 0, 0);
      notes[i][j] = true;
    }
    // print(notes); debug
  }
}

function playSound(buffer) {
  let source = audioContext.createBufferSource();
  source.buffer = buffer;
  let gainNode = audioContext.createGain();
  gainNode.gain.value = 0.25; // volume multiplier
  source.connect(gainNode);
  gainNode.connect(audioContext.destination);
  source.start(0);
}

function createPlayButton() {
  playButton = createButton('▶');
  playButton.mousePressed(togglePlayback);
  positionplayButton();
}

function playAllNotes() {
  if (timeoutIds.length > 0) {
    return; // Exit if the loop is already running
  }

  isPlaying = true; // Set the flag to indicate playback is in progress

  let startIndex = 18; // Start playback from array index 19

  let loopFunction = () => {
    for (let j = 0; j < notes[0].length; j++) { // Loop through each vertical position
      let adjustedIndex = (j + startIndex) % notes[0].length; // Adjust index to start from startIndex and loop around
      let timeoutId = setTimeout(() => {
        // Check if playback is still desired
        if (!isPlaying) {
          clearTimeouts(); // Stop the loop if playback is not desired
          return;
        }
        for (let i = 0; i < notes.length; i++) { // Loop through each note layer
          if (notes[i][adjustedIndex]) {
            let bufferIndex = scaleMappings[i];
            playSound(audioBuffers[bufferIndex]);
            changeLineColor(i); // Change the color of the corresponding line
          }
        }
      }, j * note_duration); // Adjust the delay for sequential order

      timeoutIds.push(timeoutId);
    }

    if (isPlaying) {
      let timeoutId = setTimeout(loopFunction, notes[0].length * note_duration); // Loop after one iteration
      timeoutIds.push(timeoutId);
    }
  };

  loopFunction(); // Start the loop
}

async function togglePlayback() {
  if (!isPlaying) {
    
    unmapped_noteDuration = durationSlider.value();
    note_duration = map(unmapped_noteDuration, 200, 1000, 600, 50);
    
    
    totalDuration = note_duration * totalHorizontalPoints; // Recalculate total duration based on new note duration
    
    if (angleY!=0){
      await smoothResetRotation(); // Wait for the reset rotation to complete
    }

    isPlaying = true;
    startTime = millis(); // Set the start time
    playAllNotes();
    playButton.html('◼');
    durationSlider.attribute('disabled', ''); // Disable the slider
  } else {
    // Stop playback
    isPlaying = false;
    clearTimeouts();
    playButton.html('▶');
    durationSlider.removeAttribute('disabled'); // Enable the slider
    smoothResetRotation(); // Run the reset rotation at the end
  }
}

function clearTimeouts() {
  timeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
  timeoutIds = []; // Reset the array
}

function smoothResetRotation() {
  return new Promise((resolve) => {
    let startX = angleX;
    let startY = angleY;
    let startZ = angleZ;
    let startValue = rotationalValue;

    let startTime = millis();
    let targetY = Math.round(startY / TWO_PI) * TWO_PI; // Calculate the nearest multiple of TWO_PI

    function animate() {
      let currentTime = millis();
      let elapsedTime = currentTime - startTime;
      let progress = elapsedTime / 500; // reset rotation duration

      if (progress < 1) {
        angleX = lerp(startX, 0, progress);
        angleY = lerp(startY, targetY, progress);
        angleZ = lerp(startZ, 0, progress);
        rotationalValue = lerp(startValue, 0, progress);
        requestAnimationFrame(animate);
      } else {
        angleX = 0;
        angleY = targetY;
        angleZ = 0;
        rotationalValue = 0;
        resolve(); // Resolve the promise when animation completes
      }
    }

    requestAnimationFrame(animate);
  });
}


function changeLineColor(lineIndex) {
  lineColors[lineIndex] = activeLineColor; // Change the line color to active color
  setTimeout(() => {
    lineColors[lineIndex] = defaultLineColor; // Revert the line color to default after a short delay
  }, note_duration / 2); // Revert after half the duration of the note
}


// Function to clear all points
function clearNotes() {
  colors = [];
  notes = [];
  
  for (let i = 0; i < totalVerticalPoints; i++) {
    let rowColors = [];
    let rowNotes = [];

    for (let j = 0; j < totalHorizontalPoints; j++) {
      rowColors.push(color(0, 0, 0, 35)); // Initialize with light grey
      rowNotes.push(false); // Initialize as not filled
    }

    colors.push(rowColors);
    notes.push(rowNotes);
  }
}

function addNote() {
  if (totalVerticalPoints < 15) { // Row limit currently set to 15
    totalVerticalPoints++;
    updateArraysForVerticalPoints();
  }
}

function removeNote() {
  if (totalVerticalPoints > 3) { // Prevent having less than 3 rows
    totalVerticalPoints--;
    updateArraysForVerticalPoints();
  }
}

function updateArraysForVerticalPoints() {
  // Create temporary arrays to hold updated data
  let newCylinderCoordinates = [];
  let newColors = [];
  let newNotes = [];
  let newLineColors = Array(totalVerticalPoints).fill(defaultLineColor);

  radius = windowWidth * 0.2; // 50% of the screen width
  cylinderHeight = windowHeight * 0.4; // 60% of the screen height
  

  for (let i = 0; i < totalVerticalPoints; i++) {
    let y = map(i, 0, totalVerticalPoints, cylinderHeight / 2, -cylinderHeight / 2);
    let rowCoordinates = [];
    let rowColors = [];
    let rowNotes = [];

    for (let j = 0; j < totalHorizontalPoints; j++) {
      let angle = map(j, 0, totalHorizontalPoints, 0, TWO_PI);
      let x = radius * cos(angle);
      let z = radius * sin(angle);

      rowCoordinates.push({ x, y, z });

      if (i < cylinderCoordinates.length && j < cylinderCoordinates[i].length) {
        rowColors.push(colors[i][j]); // Copy existing color
        rowNotes.push(notes[i][j]); // Copy existing note
      } else {
        rowColors.push(color(0, 0, 0, 35)); // Initialize with light grey
        rowNotes.push(false); // Initialize as not filled
      }
    }

    newCylinderCoordinates.push(rowCoordinates);
    newColors.push(rowColors);
    newNotes.push(rowNotes);
  }

  // Update the global arrays with the new data
  cylinderCoordinates = newCylinderCoordinates;
  colors = newColors;
  notes = newNotes;
  lineColors = newLineColors;
}

function changeScale() {
  // Handle the change in scale selection here
  let selectedScale = scalesDropdown.value();
  if (selectedScale !== 'disabled') {
    // Process selected scale
    if (selectedScale === 'Major') {// pentatonic
      scaleMappings = majorPentatonic;
    } 
    if (selectedScale === 'Minor') {// pentatonic
      scaleMappings = minorPentatonic;
    }     
    if (selectedScale === 'Ionian') {
      scaleMappings = ionian;
    }
    console.log('Selected scale:', selectedScale);
  }
}

function changeInstrument() {
  // Initialise new sample set here
  let selectedInstrument = instrumentDropdown.value();
  if (selectedInstrument !== 'disabled') {
    // Process selected scale
    
    if (selectedInstrument === 'Comb') {
      setNumber = 1;
    }    
    
    if (selectedInstrument === 'Piano') {
      setNumber = 2;
    }
    
    console.log('Selected instrument:', selectedInstrument);
    console.log('Loading audio set:', setNumber);
    loadAudioSet(setNumber);
  }
}

function positionclearButton() {
  clearButton.position(20, 50);
}

function positionplayButton() {
  playButton.position(20, 20);
}

function positionplus_minus_Buttons() {
  addButton.position(20, 80);
  removeButton.position(50, 80);
}

function positionDurationSlider() {
  durationSlider.position(60, 21);
}

function positionDropdownMenus() {
  scalesDropdown.position(windowWidth/2, windowHeight);
  
  instrumentDropdown.position(10, windowHeight);
}

function calculateCylinderY() {
  // Calculate y-coordinates of cylinder rows
  cylinderYCoordinates = [];
  for (let i = 0; i < cylinderCoordinates.length; i++) {
    if (cylinderCoordinates[i].length > 0) {
      // Assuming the y-coordinates for the rows are consistent across the rows
      cylinderYCoordinates.push(cylinderCoordinates[i][0].y);
    }
  }
  
  // Sort the y-coordinates to ensure they are in order
  cylinderYCoordinates.sort((a, b) => b - a);  
}

function drawfixedHorizontalLines(cylinderYCoordinates) {
  for (let i = 0; i < cylinderYCoordinates.length; i++) {
    stroke(lineColors[i]);
    strokeWeight(1 * pixelDensity()); // Adjust stroke weight for pixel density
    let y = cylinderYCoordinates[i] * 1.4;
    let rectStartX = -windowWidth / 2.5; // Rectangle start X position
    let rectEndX = -windowWidth / 3.5;   // Rectangle end X position
    let rectWidth = (rectEndX - rectStartX); // Rectangle width
    
    noStroke(); // No stroke for rectangles
    fill(lineColors[i]); // Fill color same as stroke color
    
    // Calculate rectangle dimensions and draw
    rect(rectStartX, y - 0.5, rectWidth, 5); // Adjust y position for center alignment

    // Optionally, you can debug or output values to ensure they match expectations
    // console.log(`Drawing rectangle from (${rectStartX}, ${y - 0.5}) with width ${rectWidth}`);
  }
}


// audiocontext resume weirdness - for some mobiles
function touchStarted() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }  
  if (touches.length > 0) {
    isDragging = false; // Initially not dragging
    startX = touches[0].x;
    startY = touches[0].y;
    previousTouchX = startX;
    previousTouchY = startY;
  }
}

function touchMoved() {
  if (touches.length > 0 && touches[0].y > canvasTopBoundary) {
    isDragging = true; // Touch is being dragged

    let currentTouchX = touches[0].x;
    let currentTouchY = touches[0].y;

    let deltaX = currentTouchX - previousTouchX;
    let deltaY = currentTouchY - previousTouchY;

    angleY -= deltaX * 0.008; // Adjust sensitivity as needed
    rotationalValue = angleY / TWO_PI % 1;

    previousTouchX = currentTouchX;
    previousTouchY = currentTouchY;
  }
}

function touchEnded() {
  // Only process if there was an initial touch
  if (typeof startX !== 'undefined' && typeof startY !== 'undefined') {
    // Calculate distance moved during touch
    let dx = previousTouchX - startX;
    let dy = previousTouchY - startY;
    let touchMovedDistance = Math.sqrt(dx * dx + dy * dy);

    if (!isDragging && touchMovedDistance < touchThreshold) {
      handleNoteClick(); // Handle note creation if not dragging and touch distance is within threshold
    }
  }

  // Reset startX and startY for the next touch
  startX = undefined;
  startY = undefined;
}

function handleNoteClick() {
  translate(width / 2, height / 2);
  let nearestPoint = null;
  let nearestDistance = Infinity; // Track the nearest distance

  for (let i = 0; i < cylinderCoordinates.length; i++) {
    for (let j = 0; j < cylinderCoordinates[i].length; j++) {
      let coords = cylinderCoordinates[i][j];
      let { x, y, z } = coords;
      let projectionMath = SphericalProjection(x, y, z, angleX, angleY, angleZ);
      let scaleFactor = 400 / (projectionMath.z + 300);
      let projectedX = projectionMath.x * scaleFactor;
      let projectedY = projectionMath.y * scaleFactor;

      // Check the distance between mouse and projected point
      let d = dist(mouseX - width / 2, mouseY - height / 2, projectedX, projectedY);

      // Consider the point if it's closer than previous points and within a 10-pixel radius
      if (d < nearestDistance && d < 10) {
        let alphaThreshold = 100; // Adjust for better alpha detection
        let alphaValue = map(scaleFactor, 0.9, 2, 0, 255);
        if (alphaValue >= alphaThreshold) {
          nearestPoint = { x: projectedX, y: projectedY, i, j };
          nearestDistance = d; // Update the nearest distance
        }
      }
    }
  }

  // Toggle the note at the nearest point if one was found
  if (nearestPoint !== null) {
    let { i, j } = nearestPoint;
    if (notes[i][j]) {
      colors[i][j] = color(0, 0, 0, 35);
      notes[i][j] = false;
    } else {
      colors[i][j] = color(0, 0, 0);
      notes[i][j] = true;
    }
    // print(notes); debug
  }
}