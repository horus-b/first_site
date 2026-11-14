(() => {
  const video = document.getElementById('wallpaper-video');
  const canvas = document.getElementById('snow-canvas');

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  const saveData = Boolean(connection && connection.saveData);
  const smallScreen = window.matchMedia('(max-width: 640px)').matches;

  // На телефонах и при экономии трафика используем картинку,
  // не загружая видео.
  if (video && !reduceMotion && !saveData && !smallScreen) {
    video.src = '/static/video/sakura.mp4';
    video.load();

    video.addEventListener('playing', () => {
      video.classList.add('is-playing');
    });

    video.play().catch(() => {
      // Если видео недоступно или autoplay запрещён,
      // остаётся статичная картинка.
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    });
  }

  if (!canvas || reduceMotion) return;

  const context = canvas.getContext('2d');
  if (!context) return;

  let width = 0;
  let height = 0;
  let flakes = [];
  let previousFrame = 0;

  function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const count = Math.min(65, Math.floor(width / 16));

    flakes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.6,
      speed: Math.random() * 0.8 + 0.35,
      drift: (Math.random() - 0.5) * 0.45,
      opacity: Math.random() * 0.45 + 0.2
    }));
  }

  function drawSnow(timestamp) {
    requestAnimationFrame(drawSnow);

    // Ограничиваем отрисовку примерно до 30 кадров в секунду.
    if (timestamp - previousFrame < 33 || document.hidden) return;
    previousFrame = timestamp;

    context.clearRect(0, 0, width, height);

    for (const flake of flakes) {
      context.beginPath();
      context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 248, 255, ${flake.opacity})`;
      context.fill();

      flake.y += flake.speed;
      flake.x += flake.drift;

      if (flake.y > height + flake.radius) {
        flake.y = -flake.radius;
        flake.x = Math.random() * width;
      }

      if (flake.x < -5) flake.x = width + 5;
      if (flake.x > width + 5) flake.x = -5;
    }
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  requestAnimationFrame(drawSnow);
})();