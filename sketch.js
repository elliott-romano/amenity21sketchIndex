document.querySelectorAll('.grid-item').forEach(item => {
  let canvasInstance;

  item.addEventListener('mouseenter', function() {
      if (!canvasInstance) {
          canvasInstance = new p5(sketch, this);
      }
  });

  item.addEventListener('mouseleave', function() {
      if (canvasInstance) {
          canvasInstance.remove();
          canvasInstance = null;
      }
  });
});

let sketch = function(p) {
  let off; // Offscreen canvas
  let particles = [];
  let svg1;
  let explode = true;

  p.preload = function() {
    // Load the font and image
    svg1 = p.loadImage('volume.png'); // Update the path to your image
  };

  function createExplosion() {
    if (explode) {
      let explosionForce = 5; // Adjust the intensity of the explosion
      particles.forEach(pt => {
        let angle = p.atan2(pt.y - p.height / 2, pt.x - p.width / 2);
        pt.vx = explosionForce * p.cos(angle);
        pt.vy = explosionForce * p.sin(angle);
      });
      explode = false; // Turn off the explosion after it occurs
    }
  }

  p.setup = function() {
    let parentDiv = p.canvas.parentElement;
    let w = parentDiv.offsetWidth;
    let h = parentDiv.offsetHeight;

    p.createCanvas(w, h); // Create a canvas to fit the parent div
    p.background(0); // Set the background color
    off = p.createGraphics(w, h); // Create an offscreen graphics object


    // Create particles
    for (var i = 0; i < 5000; i++) {
      var newp = { x: p.random(p.width), y: p.random(p.height), vx: p.random(-2, 2), vy: p.random(-2, 2) };
      particles.push(newp);
    }

    off.pixelDensity(1); // Set pixel density for the offscreen graphics

    positionElements(); // Call the function to position elements

    createExplosion(); // Trigger the explosion effect
  };

  function positionElements() {
    off.clear(); // Clear the offscreen graphics
    off.pixelDensity(1);
    off.background(255); // Set the background color for offscreen graphics

    // Calculate new image dimensions
    let imgWidth = p.windowWidth * .75; // Adjust the width as needed
    let imgHeight = svg1.height * (imgWidth / svg1.width); // Calculate height while maintaining aspect ratio

    // Center the image
    let imageX = (p.windowWidth - imgWidth) / 2;
    let imageY = (p.windowHeight - imgHeight) / 2;
    off.image(svg1, imageX, imageY, imgWidth, imgHeight); // Draw the image on offscreen graphics
  }

  p.draw = function() {
    p.background(255, 255, 255); // Set the background color

    p.fill(0, 191, 255); // Set the fill color for particles

    off.loadPixels(); // Load the pixel data of the offscreen graphics

    // Iterate through each particle
    particles.forEach(pt => {
      let offset = (Math.round(pt.y) * off.width + Math.round(pt.x)) * 4;
      let typecheck = off.pixels[offset];

      // Calculate distance to the mouse
      let d = p.dist(p.mouseX, p.mouseY, pt.x, pt.y);
      let maxDistance = 100; // Maximum distance for the mouse to influence particles
      let mouseInfluence = p.map(d, 0, maxDistance, 0.1, 0); // Influence decreases with distance

      if (d < maxDistance) {
        let angleToMouse = p.atan2(p.mouseY - pt.y, p.mouseX - pt.x);
        pt.vx += p.cos(angleToMouse) * mouseInfluence;
        pt.vy += p.sin(angleToMouse) * mouseInfluence;
      }

      if (typecheck > 120) {
        pt.x += pt.vx;
        pt.y += pt.vy;
      } else {
        pt.x += pt.vx * 0.1;
        pt.y += pt.vy * 0.1;
      }

      p.ellipse(pt.x, pt.y, 2, 2); // Draw the particle

      // Wrap around edges
      if (pt.x > p.width) pt.x = 0;
      if (pt.y > p.height) pt.y = 0;
      if (pt.x < 0) pt.x = p.width;
      if (pt.y < 0) pt.y = p.height;
    });
  };

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    off = p.createGraphics(p.windowWidth, p.windowHeight);
    positionElements(); // Reposition elements on resize
  };
};

new p5(sketch, window.document.getElementById('grid-container'));
