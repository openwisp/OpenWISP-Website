$( document ).ready(function() {
    'use strict';
    
    var canvas = document.querySelector("canvas");
    if (!canvas) { return; }

    function setCanvasSize(canvas) {
      var div = $('#animation'),
          calculatedHeigh = $(window).height() - $('#top-bar').height(),
          minHeight = parseInt(div.css('min-height'));
      calculatedHeigh = calculatedHeigh > minHeight ? calculatedHeigh : minHeight;
      canvas.width = $(window).width();
      canvas.height = calculatedHeigh;
      $('canvas').width(canvas.width)
                 .height(canvas.height);
      $('#animation').width(canvas.width)
                     .height(canvas.height);
      return canvas;
    }

    setCanvasSize(canvas);

    var anim = $('#animation');
    anim.css({
        'background' : 'black'
    });
    var ctx = canvas.getContext("2d");

    var wisplogo = new Image();
    wisplogo.src = 'images/openwisp-anim.png';


    var mouse = {
        x : undefined,
        y : undefined
    };

    window.addEventListener('mousemove',
    function(event){
        mouse.x = event.x;
        mouse.y = event.y;
    });

    function Circle(x, y, dx, dy, radius){
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.radius = radius;

        this.draw = function(){
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
        };

        this.update = function(){
            if(this.x + this.radius > innerWidth || this.x - this.radius < 0){
                this.dx = -this.dx;
            }
            if(this.y + this.radius > innerHeight || this.y - this.radius < 0){
                this.dy = -this.dy;
            }
            this.x += this.dx;
            this.y += this.dy;

            //interactivity
            if((Math.abs(mouse.x - this.x)) < 50){
                ctx.drawImage(wisplogo, innerWidth / 2.15, innerHeight / 20, 10.6 * (innerHeight / 80), 12 * (innerHeight / 80));
            }

            this.draw();

        };

    }

    
        
    var radius = 1;
    var circleArray = [];

    for(var i =0; i < 70; i++){
        var x = Math.random() * (innerWidth - radius * 2) + radius;
        var y = Math.random() * (innerHeight - radius * 2) + radius;
        var dx = (Math.random() - 0.5) * 2;
        var dy = (Math.random() - 0.5) * 2;
        circleArray.push(new Circle(x, y, dx, dy, radius));
    }
    function animate(){
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);

        for(var i = 0; i < circleArray.length; i++){
            circleArray[i].update();
        }

    }


    animate();
    var divs = $('h2[id^="promo-"]').hide(),
    j = 0;

    (function cycle() { 

        divs.eq(j).fadeIn(400)
              .delay(1000)
              .fadeOut(400, cycle);

        j = ++j % divs.length;
})();


$(window).resize(function() {
    setCanvasSize(canvas);
  });

});
