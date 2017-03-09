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

/****************************************************************************
 *****                             Configs                              *****
 ****************************************************************************/

// Define the various modes the program can run
const MODE = {
  NONE:         0,
  MOVEMENT:     1,
  RIPPLE:       2,
  HEAVYRIPPLE:  3
};

// Set mode we are running in
const mode = MODE.RIPPLE;

// General Constants
const spacing       = 28;   // lower => more and smaller squares
const minAlphaVal   = 0.2;  // this
const maxAlphaVal   = 0.3;  //  ^ and this bound brightness of squares
const piOver2Approx = 1.35; // closer to pi/2 => sharper angels

// Constants for movement mode
const xDistWeight = 5;      // lower => horizontal movement less important
const yDistWeight = 2;      // lower => vertical movement less important
const chaosFactor = 2.5;    // lower => more chaos sooner on

// Constants for ripple mode
const rippleSpeed        = 5;  // how fast the it ripples in the time
const rippleTime         = 50; // how long the ripple lasts for
const rippleIntervalTime = 50; // do not change this without reviewing code

// Constants for heavy ripple mode
const maxDistance         = 50;   // maximum ripple "distance"
const timerRippleInc      = 1.02; // how fast the chaos shrinks over time
const clickRippleDec      = 4;    // how fast the chaos grows with a click
const heavyIntervalTime   = 20;   // do not change this without reviewing code

// If we have text, what the text is and its formatting
const TEXT_PARAMS = {
  hasText: false,
  font:   "18px Open Sans",
  color:  "#000",
  line1:  "Click to make a",
  line2:  "ripple, scroll to",
  line3:  "explore"
};

// If we have text, where we place the text
const TEXT_LOC = {
  xStart: 5,
  xEnd:   10,
  xExtra: 10,
  yStart: 5,
  yEnd:   8,
  yExtra: 20
};

// Keys that could scroll that we capture the events of, and scrolling params
const scrollKeys = { 32: 1, 37: 1, 38: 1, 39: 1, 40: 1 };
const scrollSpeed = 750;
const scrollTimeout = 750;

/****************************************************************************
 *****                         Global Variables                         *****
 ****************************************************************************/

var canvas;
var ctx;
var scrolling;
var pageLoadScroll;

var canvasWidth;
var canvasHeight;
var centerX;
var centerY;
var points;

/****************************************************************************
 *****                         Init Functions                           *****
 ****************************************************************************/

function init() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  scrolling = false;
  pageLoadScroll = true;

  // Initial "resize" (instantiates global variables and fixes canvas size)
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
}

function initMovementMode() {
  var chaosOn = false;
  var chaos = 1;

  canvas.addEventListener("mousemove", function(event) {
    if (chaosOn) {
      var distance = Math.sqrt(Math.pow((event.x-centerX)/xDistWeight, 2) +
                               Math.pow((event.y-centerY)/yDistWeight, 2));
      chaos = boundLower(distance*chaosFactor/spacing, 1);
      draw(chaos);
    }
  });

  canvas.addEventListener("mousedown", function(event) {
    chaosOn = !chaosOn;
  });
}

function initRippleMode() {
  var rippleTimeLeft = 0;
  var chaos = 1;

  canvas.addEventListener("mousedown", function(event) {
    rippleTimeLeft = rippleTime;
    draw(chaos);
  });

  window.setInterval(function() {
    if (rippleTimeLeft) {
      rippleTimeLeft--;
      chaos = rippleSpeed - (rippleTimeLeft*rippleSpeed)/rippleTime + 1;
      draw(chaos);
    }
  }, rippleIntervalTime);
}

function initHeavyRippleMode() {
  var chaos = 1;

  var distance = maxDistance;

  canvas.addEventListener("mousedown", function(event) {
    distance = boundLower(distance/clickRippleDec, 1);
    chaos = boundLower(distance*chaosFactor/spacing, 1);
    draw(chaos);
  });

  window.setInterval(function() {
    var newDistance = boundUpper(distance*timerRippleInc, maxDistance);

    if (newDistance !== distance) {
      distance = newDistance;
      chaos = boundLower(distance*chaosFactor/spacing, 1);
      draw(chaos);
    }
  }, heavyIntervalTime);
}

/****************************************************************************
 *****                      Helper Event Functions                      *****
 ****************************************************************************/

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  canvasWidth   = canvas.width;
  canvasHeight  = canvas.height;
  centerX       = canvasWidth/2;
  centerY       = canvasHeight/2;

  // Generate a point cloud. For now we just generate random colors
  // Note: We must recreate this array each time the window is resized
  points = [];
  var extraPadding = 3*spacing; // pads out the bottom and right sides
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
  ctx.globalCompositeOperation = "destination-over";
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Generate a point cloud with a circular bound on each point
  for (var i = 0; i < points.length - 1; i++) {
    for (var j = 0; j < points[i].length - 1; j++) {
      var r1 = getRandInRange(-piOver2Approx, piOver2Approx);
      var r2 = getRandInRange(-piOver2Approx, piOver2Approx);
      points[i][j].x = (i*spacing) + (spacing/chaos) * Math.cos(r1) - spacing;
      points[i][j].y = (j*spacing) + (spacing/chaos) * Math.cos(r2) - spacing;
    }
  }

  // Place text if there is any text
  if (TEXT_PARAMS.hasText) {
    ctx.textBaseline = "middle";
    ctx.font = TEXT_PARAMS.font;
    ctx.fillStyle = TEXT_PARAMS.color;
    ctx.textAlign = "left";

    ctx.fillText(TEXT_PARAMS.line1,
                 TEXT_LOC.xStart*spacing + TEXT_LOC.xExtra,
                 TEXT_LOC.yStart*spacing + TEXT_LOC.yExtra);
    ctx.fillText(TEXT_PARAMS.line2,
                 TEXT_LOC.xStart*spacing + TEXT_LOC.xExtra,
                 (TEXT_LOC.yStart+1)*spacing + TEXT_LOC.yExtra);
    ctx.fillText(TEXT_PARAMS.line3,
                 TEXT_LOC.xStart*spacing + TEXT_LOC.xExtra,
                 (TEXT_LOC.yStart+2)*spacing + TEXT_LOC.yExtra);
  }

  // Draw and fill the quadrilaterals
  for (var i = 0; i < points.length - 1; i++) {
    for (var j = 0; j < points[i].length - 1; j++) {
      // If text is enabled then fill text squares white; fill all other
      // squares with specified color aside from the first column
      if ((TEXT_PARAMS.hasText &&
           i >= TEXT_LOC.xStart && i <= TEXT_LOC.xEnd &&
           j >= TEXT_LOC.yStart && j <= TEXT_LOC.yEnd) ||
          (i === 0)) {
        ctx.fillStyle = "#FFF";
      } else {
        ctx.fillStyle = points[i][j].c;
      }

      ctx.beginPath();

      ctx.moveTo(points[i][j].x, points[i][j].y);
      ctx.lineTo(points[i+1][j].x, points[i+1][j].y);
      ctx.lineTo(points[i+1][j+1].x, points[i+1][j+1].y);
      ctx.lineTo(points[i][j+1].x, points[i][j+1].y);
      ctx.lineTo(points[i][j].x, points[i][j].y);

      ctx.closePath();
      ctx.fill();
    }
  }
}

/****************************************************************************
 *****                      Small Helper Functions                      *****
 ****************************************************************************/

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
  return "rgba("+ Math.floor(getRandInRange(0,255)) + ","
                + Math.floor(getRandInRange(0,255)) + ","
                + Math.floor(getRandInRange(0,255)) + ","
                + getRandInRange(alphaMin,alphaMax) + ")";
}

/****************************************************************************
 *****                         Scrolling Logic                          *****
 ****************************************************************************/

/*
                  The scrolling logic below is no longer
                  needed for the current homepage design


function scrollTo(height) {
  scrolling = true;
  $("html, body").animate({scrollTop: height}, scrollSpeed, function() {
    setTimeout(function() { scrolling = false; }, scrollTimeout);
  });
}

function handleScrolling(e) {
  e = e || window.event;
  if (e.handleScrolling) {
    e.handleScrolling();
  }
  e.returnValue = false;

  if (pageLoadScroll) {
    setTimeout(function() { pageLoadScroll = false; }, scrollTimeout/2);
    return;
  }

  if (!scrolling) {
    if ($(window).scrollTop() <= window.innerHeight - 1) {
      scrollTo(window.innerHeight);
    } else {
      scrollTo(0);
    }
  }
}

function handleScrollingForScrollKeys(e) {
  if (scrollKeys[e.keyCode]) {
      handleScrolling(e);
      return false;
  }
}

window.onwheel        = handleScrolling;
window.onmousewheel   = handleScrolling;
window.ontouchmove    = handleScrolling;
document.onmousewheel = handleScrolling
document.onkeydown    = handleScrollingForScrollKeys;
*/
