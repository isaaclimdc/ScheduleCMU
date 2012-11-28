function startSpinner() {
    /* Spin.js */
    var opts = {
      lines: 15, // The number of lines to draw
      length: 9, // The length of each line
      width: 2, // The line thickness
      radius: 26, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      color: '#000', // #rgb or #rrggbb
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: 'auto', // Top position relative to parent in px
      left: 'auto' // Left position relative to parent in px
    };

    var target = document.getElementsByTagName("body")[0];
    window.spinner = new Spinner(opts).spin(target);
}

function stopSpinner() {
    window.spinner.stop();
}