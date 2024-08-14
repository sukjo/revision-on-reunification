$(function () {
  let dragging = false;

  let cc = $("#column-container");
  cc.mousedown(function () {
    dragging = true;
  });
  cc.mouseup(function () {
    dragging = false;
  });
  cc.mousemove(function (e) {
    if (dragging) {
      let mouseX = e.pageX;
      let mouseY = e.pageY;

      let rad = Math.atan2(mouseX - 10, mouseY - 10);
      let deg = rad * (180 / Math.PI) * -1 + 90;

      cc.css("-moz-transform", "rotate(" + deg + "deg)");
      cc.css("-moz-transform-origin", "0% 40%");
      cc.css("-webkit-transform", "rotate(" + deg + "deg)");
      cc.css("-webkit-transform-origin", "0% 40%");
      cc.css("-o-transform", "rotate(" + deg + "deg)");
      cc.css("-o-transform-origin", "0% 40%");
      cc.css("-ms-transform", "rotate(" + deg + "deg)");
      cc.css("-ms-transform-origin", "0% 40%");
    }
  });

  let dummy = 180;

  //   $("#reunification-highway").css({
  //     "-webkit-transform": "scale(" + dummy + ")",
  //     "-moz-transform": "scale(" + dummy + ")",
  //     "-ms-transform": "scale(" + dummy + ")",
  //     "-o-transform": "scale(" + dummy + ")",
  //     transform: "scale(" + dummy + ")",
  //   });
});
