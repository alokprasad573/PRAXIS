import { useEffect, useRef } from "react";
import img1 from "../assets/images/IMG-1.png";
import img2 from "../assets/images/IMG-2.png";
import img3 from "../assets/images/IMG-3.png";
import img4 from "../assets/images/IMG-4.png";
import img5 from "../assets/images/IMG-5.png";
import img7 from "../assets/images/IMG-7.png";
import img8 from "../assets/images/IMG-8.png";

const FloatingImagesCanvas = ({ className = "", id = "agentic-canvas" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let cards = [];
    let animationFrameId;
    let time = 0;
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };

    // Image assets definition
    const IMAGE_SOURCES = [
      { src: img1, title: "Command Center Dashboard" },
      { src: img2, title: "Multi-Agent Workflow Detail" },
      { src: img3, title: "RAG Semantic Memory Matrix" },
      { src: img4, title: "OKF Deterministic Policy Engine" },
      { src: img5, title: "Live Execution Telemetry Trace" },
      { src: img7, title: "Autonomous Unit Test Fix Loop" },
      { src: img8, title: "Continuous Codebase Health" }
    ];

    // Preload all images
    const loadedImages = [];
    IMAGE_SOURCES.forEach((item, index) => {
      const img = new Image();
      img.src = item.src;
      img.onload = () => {
        loadedImages[index] = { img, title: item.title };
      };
    });

    function buildCardsLayout() {
      cards = [
        {
          // Card 1: Top-Left Floating Prompt Capsule / UI Card
          imgIndex: 0,
          relX: 0.13,
          relY: 0.33,
          baseWidth: Math.min(width * 0.25, 350),
          aspectRatio: 16 / 10,
          skewX: -0.14,
          skewY: 0.07,
          scale: 0.95,
          rotZ: -0.06,
          depth: 1.1,
          floatSpeed: 0.014,
          floatAmp: 10,
          phase: 0,
          opacity: 0.7,
          borderColor: "rgba(249, 115, 22, 0.28)"
        },
        {
          // Card 2: Bottom-Left Tilted Architecture Card
          imgIndex: 1,
          relX: 0.17,
          relY: 0.78,
          baseWidth: Math.min(width * 0.29, 410),
          aspectRatio: 16 / 10,
          skewX: -0.18,
          skewY: 0.05,
          scale: 1.0,
          rotZ: -0.04,
          depth: 1.3,
          floatSpeed: 0.011,
          floatAmp: 12,
          phase: Math.PI * 0.6,
          opacity: 0.78,
          borderColor: "rgba(251, 191, 36, 0.25)"
        },
        {
          // Card 3: Top-Right Floating Agent Card
          imgIndex: 2,
          relX: 0.87,
          relY: 0.35,
          baseWidth: Math.min(width * 0.25, 350),
          aspectRatio: 16 / 10,
          skewX: 0.14,
          skewY: -0.07,
          scale: 0.95,
          rotZ: 0.06,
          depth: 1.1,
          floatSpeed: 0.013,
          floatAmp: 11,
          phase: Math.PI * 0.3,
          opacity: 0.7,
          borderColor: "rgba(249, 115, 22, 0.28)"
        },
        {
          // Card 4: Bottom-Right Tilted Network Card
          imgIndex: 3,
          relX: 0.83,
          relY: 0.8,
          baseWidth: Math.min(width * 0.3, 430),
          aspectRatio: 16 / 10,
          skewX: 0.17,
          skewY: -0.05,
          scale: 1.0,
          rotZ: 0.04,
          depth: 1.35,
          floatSpeed: 0.01,
          floatAmp: 13,
          phase: Math.PI * 0.9,
          opacity: 0.78,
          borderColor: "rgba(251, 191, 36, 0.25)"
        },
        {
          // Card 5: Upper Center Background Depth Layer
          imgIndex: 4,
          relX: 0.5,
          relY: 0.14,
          baseWidth: Math.min(width * 0.22, 300),
          aspectRatio: 16 / 10,
          skewX: -0.04,
          skewY: 0.02,
          scale: 0.8,
          rotZ: -0.02,
          depth: 0.6,
          floatSpeed: 0.008,
          floatAmp: 8,
          phase: Math.PI * 1.4,
          opacity: 0.4,
          borderColor: "rgba(255, 255, 255, 0.12)"
        }
      ];
    }

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      buildCardsLayout();
    }

    function onMouseMove(e) {
      mouse.targetX = (e.clientX / width - 0.5) * 2;
      mouse.targetY = (e.clientY / height - 0.5) * 2;
      mouse.active = true;
    }

    function onMouseLeave() {
      mouse.targetX = 0;
      mouse.targetY = 0;
      mouse.active = false;
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", resize);

    resize();

    // Helper to safely draw rounded rect
    function drawCardPath(w, h, r = 10) {
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(-w * 0.5, -h * 0.5, w, h, r);
      } else {
        ctx.rect(-w * 0.5, -h * 0.5, w, h);
      }
    }

    // 3D RENDER LOOP
    function render() {
      ctx.clearRect(0, 0, width, height);

      // 1. Deep Obsidian Base (Synchronized with --bg-dark #070709)
      ctx.fillStyle = "#070709";
      ctx.fillRect(0, 0, width, height);

      time += 0.016;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // 2. Subtle Central Ambient Warmth (Ultra-Soft, No Harsh Corner Lights)
      const centerGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.3,
        10,
        width * 0.5,
        height * 0.3,
        Math.min(width, height) * 0.65
      );
      centerGrad.addColorStop(0, "rgba(249, 115, 22, 0.08)");
      centerGrad.addColorStop(0.5, "rgba(234, 88, 12, 0.02)");
      centerGrad.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(
        width * 0.5,
        height * 0.3,
        Math.min(width, height) * 0.65,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = centerGrad;
      ctx.fill();

      // 3. Draw 3D Floating Perspective Cards
      cards.forEach((card) => {
        const item = loadedImages[card.imgIndex];
        if (!item || !item.img || !item.img.complete) return;

        card.phase += card.floatSpeed;

        // Dynamic Harmonic Levitation
        const floatOffsetY = Math.sin(card.phase) * card.floatAmp;
        const floatOffsetX = Math.cos(card.phase * 0.7) * (card.floatAmp * 0.3);

        // Parallax depth offset based on mouse
        const parallaxX = mouse.x * 35 * card.depth;
        const parallaxY = mouse.y * 25 * card.depth;

        const posX = card.relX * width + floatOffsetX + parallaxX;
        const posY = card.relY * height + floatOffsetY + parallaxY;

        const cardWidth = card.baseWidth * card.scale;
        const cardHeight = (card.baseWidth / card.aspectRatio) * card.scale;

        ctx.save();
        ctx.translate(posX, posY);

        // 3D Perspective Matrix (Shear, Rotation & Parallax Tilt)
        const dynamicSkewX = card.skewX + mouse.x * 0.03 * card.depth;
        const dynamicSkewY = card.skewY + mouse.y * 0.02 * card.depth;
        const dynamicRotZ = card.rotZ + mouse.x * 0.015;

        ctx.transform(1, dynamicSkewY, dynamicSkewX, 1, 0, 0);
        ctx.rotate(dynamicRotZ);

        // --- A. Draw Clean Drop Shadow ---
        ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
        ctx.shadowBlur = 24;
        ctx.shadowOffsetX = -dynamicSkewX * 25;
        ctx.shadowOffsetY = 18;

        // --- B. Draw Card Base & Clip Image ---
        drawCardPath(cardWidth, cardHeight, 10);
        ctx.fillStyle = "rgba(10, 11, 15, 0.95)";
        ctx.fill();

        ctx.save();
        drawCardPath(cardWidth, cardHeight, 10);
        ctx.clip();

        // Reset shadow inside clip
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.globalAlpha = card.opacity;
        ctx.drawImage(
          item.img,
          -cardWidth * 0.5,
          -cardHeight * 0.5,
          cardWidth,
          cardHeight
        );
        ctx.globalAlpha = 1.0;

        // Subtle Glass Specular Reflection Overlay
        const glassGrad = ctx.createLinearGradient(
          -cardWidth * 0.5,
          -cardHeight * 0.5,
          cardWidth * 0.5,
          cardHeight * 0.5
        );
        glassGrad.addColorStop(0, "rgba(255, 255, 255, 0.08)");
        glassGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.02)");
        glassGrad.addColorStop(0.7, "rgba(0, 0, 0, 0.15)");
        glassGrad.addColorStop(1, "rgba(0, 0, 0, 0.45)");

        ctx.fillStyle = glassGrad;
        ctx.fillRect(
          -cardWidth * 0.5,
          -cardHeight * 0.5,
          cardWidth,
          cardHeight
        );

        ctx.restore();

        // --- C. Draw Thin Subtle Border Stroke (0.75px) ---
        drawCardPath(cardWidth, cardHeight, 10);
        ctx.strokeStyle = card.borderColor;
        ctx.lineWidth = 0.75;
        ctx.stroke();

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={`w-full h-full fixed inset-0 pointer-events-none ${className}`}
    />
  );
};

export { FloatingImagesCanvas, FloatingImagesCanvas as ThreeDFloatingImagesCanvas };
export default FloatingImagesCanvas;
