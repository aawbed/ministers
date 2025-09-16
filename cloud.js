const canvas = document.getElementById("cloudCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let clouds = [];

// Cloud class
class Cloud {
  constructor(x, y, size, speed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.vaporized = false;
    this.particles = [];
  }

  draw() {
    if (!this.vaporized) {
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.size * 1.5, this.size, 0, 0, Math.PI * 2);
      ctx.ellipse(this.x + this.size, this.y, this.size, this.size * 0.8, 0, 0, Math.PI * 2);
      ctx.ellipse(this.x - this.size, this.y, this.size, this.size * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      this.particles.forEach((p) => p.update());
    }
  }

  update() {
    if (!this.vaporized) {
      this.x += this.speed;
      if (this.x > canvas.width + this.size * 2) this.x = -this.size * 2;
    }
    this.draw();
  }

  vaporize() {
    this.vaporized = true;
    for (let i = 0; i < 20; i++) {
      this.particles.push(new Particle(this.x, this.y));
    }
    // Respawn new cloud later
    setTimeout(() => {
      let size = Math.random() * 30 + 20;
      let speed = Math.random() * 0.5 + 0.2;
      this.x = -size * 2;
      this.y = Math.random() * (canvas.height / 2);
      this.size = size;
      this.speed = speed;
      this.vaporized = false;
      this.particles = [];
    }, 3000);
  }
}

// Particle (vapor effect)
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.alpha = 1;
    this.size = Math.random() * 10 + 5;
    this.speedX = (Math.random() - 0.5) * 2;
    this.speedY = (Math.random() - 0.5) * 2;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.alpha -= 0.01;
    if (this.alpha <= 0) this.alpha = 0;
    ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Spawn clouds
function initClouds() {
  clouds = [];
  for (let i = 0; i < 6; i++) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * (canvas.height / 2);
    let size = Math.random() * 30 + 20;
    let speed = Math.random() * 0.5 + 0.2;
    clouds.push(new Cloud(x, y, size, speed));
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  clouds.forEach((cloud) => cloud.update());
  requestAnimationFrame(animate);
}

// Interactivity
canvas.addEventListener("click", (e) => {
  clouds.forEach((cloud) => {
    const dx = e.clientX - cloud.x;
    const dy = e.clientY - cloud.y;
    if (Math.sqrt(dx * dx + dy * dy) < cloud.size * 2 && !cloud.vaporized) {
      cloud.vaporize();
    }
  });
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initClouds();
});

initClouds();
animate();
