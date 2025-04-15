(function() {
    'use strict';
    
    const canvas = document.getElementById('canvas');
    if (!canvas.getContext) {
        console.warn('Canvas not supported');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const requestAnimFrame = window.requestAnimationFrame || 
                           window.mozRequestAnimationFrame || 
                           window.webkitRequestAnimationFrame || 
                           window.msRequestAnimationFrame;
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const dots = [];
    const numberOfDots = 30;
    const maxDistance = 150;
    const dotRadius = 2.5;
    const lineOpacity = 0.15;

    class Dot {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, dotRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#4fc3f7';
            ctx.fill();
        }
    }

    for (let i = 0; i < numberOfDots; i++) {
        dots.push(new Dot());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        dots.forEach(dot => {
            dot.update();
            dot.draw();
        });

        dots.forEach((dot1, i) => {
            dots.slice(i + 1).forEach(dot2 => {
                const dx = dot1.x - dot2.x;
                const dy = dot1.y - dot2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    ctx.beginPath();
                    ctx.moveTo(dot1.x, dot1.y);
                    ctx.lineTo(dot2.x, dot2.y);
                    ctx.strokeStyle = `rgba(79, 195, 247, ${1 - distance/maxDistance * lineOpacity})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
        });

        requestAnimFrame(animate);
    }

    animate();
})();