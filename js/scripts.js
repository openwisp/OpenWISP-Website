(function() {
  'use strict';

  var setFooter = function () {
    // stick footer to bottom
    var f = $('#footer'),
        contentHeight = $('#top-bar').outerHeight() +
                        $('#main').outerHeight() +
                        $('#footer').outerHeight();
    if (contentHeight < $(window).height()) {
      f.css({'position': 'absolute',
             'bottom': 0,
             'width': '100%'});
    } else {
      f.attr('style', '');
    }
  };

  $(document).ready(function() {
    $('.ui.embed').embed();
    $('.menu-open').click(function() {
      $('.ui.sidebar').sidebar('toggle');
    });
    $('.ui.sidebar').sidebar('setting', {
      scrollLock: 'true'
    });
    setFooter();
  });

  $(window).resize(setFooter);

  $(document).ready(function() {
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

    var ctx = canvas.getContext("2d"),
        TAU = 2 * Math.PI;

    function loop() {
      update(canvas);
      draw(canvas);
      requestAnimationFrame(loop);
    }

    function Ball (canvas, startX, startY, startVelX, startVelY) {
      this.x = startX || Math.random() * canvas.width;
      this.y = startY || Math.random() * canvas.height;
      this.vel = {
        x: startVelX || Math.random() * 2 - 1,
        y: startVelY || Math.random() * 2 - 1
      };
      this.update = function(canvas) {
        if (this.x > canvas.width + 50 || this.x < -50) {
          this.vel.x = -this.vel.x;
        }
        if (this.y > canvas.height + 50 || this.y < -50) {
          this.vel.y = -this.vel.y;
        }
        this.x += this.vel.x;
        this.y += this.vel.y;
      };
      this.draw = function(ctx, can) {
        ctx.beginPath();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#448fda';
        ctx.arc((0.5 + this.x) | 0, (0.5 + this.y) | 0, 3, 0, TAU, false);
        ctx.fill();
      };
    }

    function createBalls() {
      var balls = [];
      for (var i = 0; i < canvas.width * canvas.height / (65*65); i++) {
        balls.push(new Ball(canvas, Math.random() * canvas.width, Math.random() * canvas.height));
      }
      return balls;
    }

    window._balls = createBalls();

    var time = Date.now();
    function update(canvas) {
      var diff = Date.now() - time;
      for (var frame = 0; frame * 26.6667 < diff; frame++) {
        for (var index = 0; index < _balls.length; index++) {
          _balls[index].update(canvas);
        }
      }
      time = Date.now();
    }
    var mouseX = -1e9, mouseY = -1e9;
    document.addEventListener('mousemove', function(event) {
      mouseX = event.clientX;
      mouseY = event.clientY;
    });

    function draw(canvas) {
      ctx.globalAlpha=1;
      ctx.fillStyle = '#001c33';
      ctx.fillRect(0,0, canvas.width, canvas.height);
      for (var index = 0; index < _balls.length; index++) {
        var ball = _balls[index];
        ball.draw(ctx, canvas);
        ctx.beginPath();
        for (var index2 = _balls.length - 1; index2 > index; index2 += -1) {
          var ball2 = _balls[index2];
          var dist = Math.hypot(ball.x - ball2.x, ball.y - ball2.y);
            if (dist < 100) {
              ctx.strokeStyle = "#448fda";
              ctx.globalAlpha = 1 - (dist > 100 ? 0.8 : dist / 150);
              ctx.lineWidth = "2px";
              ctx.moveTo((0.1 + ball.x) | 0, (0.1 + ball.y) | 0);
              ctx.lineTo((0.1 + ball2.x) | 0, (0.1 + ball2.y) | 0);
            }
        }
        ctx.stroke();
      }
    }

    // Start
    loop();

    $(window).resize(function() {
      setCanvasSize(canvas);
      window._balls = createBalls();
      draw(canvas);
      update(canvas);
    });
  });
}());

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-29417559-1']);
_gaq.push(['_setDomainName', 'openwisp.org']);
_gaq.push(['_setAllowLinker', true]);
_gaq.push(['_trackPageview']);
(function() {
  if (window.location.host === 'localhost') { return; }
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
(function(h,o,t,j,a,r){
  if (window.location.host === 'localhost') { return; }
  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments);};
  h._hjSettings={hjid:531905,hjsv:5};
  a=o.getElementsByTagName('head')[0];
  r=o.createElement('script');r.async=1;
  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
  a.appendChild(r);
})(window,document,'//static.hotjar.com/c/hotjar-','.js?sv=');
