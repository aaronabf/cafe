/*
    "Freedom is nothing but a chance to be better."
        - Albert Camus

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

const mainImg   = 'cafe-main';
const mobileImg = 'cafe-mobile';

$(document).ready( function() {
  console.log("1");
  loadCorrectImage();
  console.log("2");
  $(window).resize(loadCorrectImage);
  console.log("3");
});

function loadCorrectImage() {
  if (!isMobile()) {
    console.log("4");
    loadImage(mainImg);
  } else {
    console.log("5");
    loadImage(mobileImg);
  }
}

function isMobile() {
  return window.matchMedia('(max-width: 767px)').matches;
}

function loadImage(img) {
  var c = new Image();

console.log("6");
  c.onload = function(){
    $('body').css('background-image', 'url(media/' + img + '.jpg)');
  }

console.log("7");
  c.src = 'media/' + img + '.jpg';
  console.log("8");
}
