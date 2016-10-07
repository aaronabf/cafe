/*
        Why are you here? Go away.

             *     ,MMM8&&&.            *
                  MMMM88&&&&&    .
                 MMMM88&&&&&&&
     *           MMM88&&&&&&&&
                 MMM88&&&&&&&&
                 'MMM88&&&&&&'
                   'MMM8&&&'      *
          |\___/|
          )     (             .              '
         =\     /=
           )===(       *
          /     \
          |     |
         /       \
         \       /
  _/\_/\_/\__  _/_/\_/\_/\_/\_/\_/\_/\_/\_/\_
  |  |  |  |( (  |  |  |  |  |  |  |  |  |  |
  |  |  |  | ) ) |  |  |  |  |  |  |  |  |  |
  |  |  |  |(_(  |  |  |  |  |  |  |  |  |  |
  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
*/


// Define the various modes the program can run
const MODE = {
  NONE:         0,
  MOVEMENT:     1,
  RIPPLE:       2,
  HEAVYRIPPLE:  3
};

// Set the mode
const mode = MODE.RIPPLE;

// General Constants
const spacing         = 28;   // lower => more shapes
const minAlphaVal     = 0.2;
const maxAlphaVal     = 0.5;
const piOver2         = Math.PI/2;

// Constants for movement mode
const xDistanceWeight = 5;
const chaosFactor     = 2.5;

// Constants for ripple mode
const maxRippleTime       = 5;
const rippleTime          = 50;
const timerIntervalRipple = 50;

// Constants for heavy ripple mode
const maxDistance         = 50;
const timerRippleInc      = 1.02;
const clickRippleDec      = 4;
const timerIntervalHeavy  = 20;

// Global Variables
var canvas;
var ctx;

var canvasWidth;
var canvasHeight;
var centerX;
var centerY;
var points;

var chaosOn;
var rippleRelax;
var rippleTimeLeft;

// Main functions

function init() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  // Initial "resize" (instantiates variables)
  resizeCanvas();

  // Adds resize event handling
  window.onresize = resizeCanvas;

  // Setup depending on which mode is set
  if (mode === MODE.MOVEMENT) {
    initMovementMode();
  } else if (mode === MODE.RIPPLE) {
    initRippleMode();
  } else if (mode === MODE.HEAVYRIPPLE) {
    initHeavyRippleMode();
  }

  $("#content").removeClass("preload");
}

function initMovementMode() {
  var chaos = 1;

  chaosOn = false;

  canvas.addEventListener('mousemove', function(event) {
    if (chaosOn) {
      var distanceFromCenter = Math.sqrt(Math.pow((event.x-centerX)/xDistanceWeight, 2) +
                                         Math.pow((event.y-centerY), 2));

      chaos = boundLower(distanceFromCenter*chaosFactor/spacing, 1);
      draw(chaos);
    }
  });

  canvas.addEventListener('mousedown', function(event) {
    chaosOn = !chaosOn;
  });
}

function initRippleMode() {
  var chaos = 1;

  rippleTimeLeft = 0;

  window.setInterval(function() {
    if (rippleTimeLeft) {
      rippleTimeLeft--;

      chaos = maxRippleTime - (1/maxRippleTime) + 1
             - (rippleTimeLeft*maxRippleTime)/rippleTime;
      draw(chaos);
    }
  }, timerIntervalRipple);

  canvas.addEventListener('mousedown', function(event) {
    rippleTimeLeft = rippleTime;
    draw(chaos);
  });
}

function initHeavyRippleMode() {
  var chaos = 1;

  var distance = maxDistance;

  window.setInterval(function() {
    var newDistance = boundUpper(distance*timerRippleInc, maxDistance);

    if (newDistance !== distance) {
      distance = newDistance;

      chaos = boundLower(distance*chaosFactor/spacing, 1);
      draw(chaos);
    }
  }, timerIntervalHeavy);

  canvas.addEventListener('mousedown', function(event) {
    distance = boundLower(distance/clickRippleDec, 1);

    chaos = boundLower(distance*chaosFactor/spacing, 1);
    draw(chaos);
  });
}

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  canvasWidth   = canvas.width;
  canvasHeight  = canvas.height;
  centerX       = canvasWidth/2;
  centerY       = canvasHeight/2;

  // Generate a point cloud. For now we just generate random colors.
  // Note: We must recreate this array each time the window is resized.
  points = [];
  var extraPadding = 3*spacing; // pads out the top and left sides
  for (var i = 0; i < canvasWidth + extraPadding; i += spacing) {
    var x = i / spacing;
    points[x] = [];

    for (var j = 0; j < canvasHeight + extraPadding; j += spacing) {
      var y = j / spacing;
      points[x][y] = {
        c: getRandomColor(minAlphaVal, maxAlphaVal)
      };
    }
  }

  draw(1);
}

function draw(chaos) {
  // Clear the canvas
  ctx.globalCompositeOperation = 'destination-over';
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Generate a point cloud with a circular bound on each point
  for (var i = 0; i < points.length - 1; i++) {
    for (var j = 0; j < points[i].length - 1; j++) {
      var r1 = getRandInRange(-piOver2, piOver2);
      var r2 = getRandInRange(-piOver2, piOver2);
      points[i][j].x = (i*spacing) + (spacing/chaos) * Math.cos(r1) - spacing;
      points[i][j].y = (j*spacing) + (spacing/chaos) * Math.cos(r2) - spacing;
    }
  }

  ctx.textBaseline = 'middle';
  ctx.font = '18px Open Sans';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'left'
  ctx.fillText('Click to ripple,', 5*spacing + 10, 5*spacing + 20);
  ctx.fillText('scroll to explore', 5*spacing + 10, 6*spacing + 20);
  ctx.fillText('a new world', 5*spacing + 10, 7*spacing + 20);

  // Draw and fill the quadrilaterals
  for (var i = 0; i < points.length - 1; i++) {
    for (var j = 0; j < points[i].length - 1; j++) {
      ctx.fillStyle = points[i][j].c;
      if (i >= 5 && i <= 10 && j >= 5 && j <= 8) { ctx.fillStyle = '#FFF'; }
      ctx.beginPath();

      ctx.moveTo(points[i][j].x,points[i][j].y);
      ctx.lineTo(points[i+1][j].x,points[i+1][j].y);
      ctx.lineTo(points[i+1][j+1].x,points[i+1][j+1].y);
      ctx.lineTo(points[i][j+1].x,points[i][j+1].y);
      ctx.lineTo(points[i][j].x,points[i][j].y);

      ctx.closePath();
      ctx.fill();
    }
  }
}

// Small Helper Functions

function boundLower(val, min) {
  return (val < min) ? min : val;
}

function boundUpper(val, max) {
  return (val > max) ? max : val;
}

function getRandInRange(min, max) {
  return (Math.random() * (max - min) + min);
}

function getRandomColor(alphaMin, alphaMax) {
  return 'rgba('+ Math.floor(getRandInRange(0,255))  +','
                + Math.floor(getRandInRange(0,255))  +','
                + Math.floor(getRandInRange(0,255))  +','
                + getRandInRange(alphaMin,alphaMax) + ')';
}
