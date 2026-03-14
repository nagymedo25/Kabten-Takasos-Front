import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

// ─── Matrix Rain (Programming) ────────────────────────────────────
const drawMatrix = (canvas, ctx, color) => {
  const isMobile = window.innerWidth < 768;
  const cols = Math.floor(canvas.width / (isMobile ? 24 : 18));
  const drops = Array(cols).fill(1);
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01{};()=>?!#@ABCDEFabcdef';

  return () => {
    // Fill background with a very dark, slightly transparent color to create trails
    ctx.fillStyle = 'rgba(1, 10, 8, 0.15)'; // Much darker green-black and clears faster
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = color;
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * 18;
      const y = drops[i] * 18;

      // Brighter head character, but not blinding
      ctx.fillStyle = 'rgba(0, 200, 150, 0.85)';
      ctx.fillText(char, x, y);

      // Normal trailing chars (dimmer)
      ctx.fillStyle = color.replace('1)', '0.3)');
      if (drops[i] > 2) ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - 18);

      if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  };
};

// ─── Network Nodes (Networks) ─────────────────────────────────────
const drawNodes = (canvas, ctx, color) => {
  const isMobile = window.innerWidth < 768;
  const nodeCount = isMobile ? 20 : 55; // Huge optimization for mobile!
  const nodes = Array.from({ length: nodeCount }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (isMobile ? 0.3 : 0.5) * (Math.random() - 0.5),
    vy: (isMobile ? 0.3 : 0.5) * (Math.random() - 0.5),
    r: Math.random() * 3 + 1.5,
    pulse: Math.random() * Math.PI * 2,
  }));

  return () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          const alpha = (1 - dist / 140) * 0.25;
          ctx.strokeStyle = color.replace('1)', `${alpha})`);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      n.pulse += 0.04;
      const glowSize = Math.max(0, n.r + Math.sin(n.pulse) * 2);

      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowSize * 3);
      grad.addColorStop(0, color.replace('1)', '0.8)'));
      grad.addColorStop(1, color.replace('1)', '0)'));
      ctx.beginPath();
      ctx.arc(n.x, n.y, glowSize * 3, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = color.replace('1)', '0.9)');
      ctx.fill();

      // Move
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    });
  };
};

// ─── Signal Waves (Communications) ───────────────────────────────
const drawWaves = (canvas, ctx, color) => {
  let t = 0;
  const isMobile = window.innerWidth < 768;

  const centers = isMobile ? [
    { x: canvas.width * 0.5, y: canvas.height * 0.5, speed: 0.8 },
  ] : [
    { x: canvas.width * 0.25, y: canvas.height * 0.5, speed: 0.8 },
    { x: canvas.width * 0.75, y: canvas.height * 0.5, speed: 1.1 },
    { x: canvas.width * 0.5,  y: canvas.height * 0.3, speed: 0.6 },
  ];

  return () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t += 0.012;

    centers.forEach(center => {
      // Less rings on mobile
      const ringCount = isMobile ? 3 : 5;
      for (let ring = 0; ring < ringCount; ring++) {
        const radius = ((t * center.speed * 120 + ring * 60) % 400);
        const alpha = Math.max(0, 0.28 - radius / 500);
        if (alpha <= 0) continue;

        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = color.replace('1)', `${alpha})`);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Center dot
      const dotGrad = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, 10);
      dotGrad.addColorStop(0, color.replace('1)', '0.8)'));
      dotGrad.addColorStop(1, color.replace('1)', '0)'));
      ctx.beginPath();
      ctx.arc(center.x, center.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = dotGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(center.x, center.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = color.replace('1)', '1)');
      ctx.fill();
    });
  };
};

// ─── Main Component ───────────────────────────────────────────────
const ThemeBackground = () => {
  const { theme } = useTheme();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!theme || theme.type === 'default' || isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const color = `rgba(${hexToRgb(theme.particleColor)}, 1)`;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let drawFrame;
    if (theme.type === 'matrix')  drawFrame = drawMatrix(canvas, ctx, color);
    if (theme.type === 'nodes')   drawFrame = drawNodes(canvas, ctx, color);
    if (theme.type === 'waves')   drawFrame = drawWaves(canvas, ctx, color);

    const loop = () => {
      drawFrame?.();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [theme?.type, theme?.particleColor, isMobile]);

  if (!theme || theme.type === 'default' || isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: theme.type === 'matrix' ? 0.55 : 0.5,
      }}
    />
  );
};

// Helper: hex → "r, g, b" string
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '99, 102, 241';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

export default ThemeBackground;
