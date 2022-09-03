/*
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

$(document).ready(function() {
  loadCorrectImage();
  $(window).resize(loadCorrectImage);
});

function loadCorrectImage() {
  if (!isMobile()) {
    loadImage(mainImg);
  } else {
    loadImage(mobileImg);
  }
}

function isMobile() {
  return window.matchMedia('(max-width: 767px)').matches;
}

function loadImage(img) {
  var c = new Image();

  c.onload = function(){
    $('#background').css('background-image', 'url(media/' + img + '.jpg)');
  }

  c.src = 'media/' + img + '.jpg';
}

$('#background').click(function() {
  window.location = $('#scroll').find('a').attr('href');
  return false;
});
