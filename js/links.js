import $ from "jquery";

export default function initScrollLinks() {
  $('#nav').on('click', '.nav-link', function(event) {
    event.preventDefault();
    var hash = this.hash;

    $('html, body').animate({
     scrollTop: $(hash).offset().top
    }, 600, function() {
      window.location.hash = hash;
    });
  });
}
