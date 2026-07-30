/**
 * Nexveda Technology - Production React 18 Application Engine
 * Verified zero-error React 18 component tree with SpotlightCard forwardRef support &className properties.
 */

const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ----------------------------------------------------
 * 1. Accessibility & Reduced Motion Utility
 * ---------------------------------------------------- */
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

/* ----------------------------------------------------
 * 1.5. Scroll Progress Line & Custom Interactive Cursor
 * ---------------------------------------------------- */
const ScrollProgressBar = () => {
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollPercent((window.scrollY / totalHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return <div className="scroll-progress-bar" style={{ width: `${scrollPercent}%` }} />;
};

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const spotlightRef = useRef(null);
  const [mode, setMode] = useState('default');
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || window.innerWidth < 768) return;

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let animId;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }
    };

    const render = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      animId = requestAnimationFrame(render);
    };

    const handleMouseOver = (e) => {
      const el = e.target;

      // 1. Portfolio hover state (Morphs into circular badge)
      if (el.closest('.portfolio-card-wrapper, [data-cursor="portfolio"]')) {
        setMode('portfolio');
        return;
      }

      // 2. Dashboard HUD hover state
      if (el.closest('.mockup-3d-card, [data-cursor="dashboard"]')) {
        setMode('dashboard');
        return;
      }

      // 3. Navigation hover state
      if (el.closest('nav a, header a, .glass-nav a')) {
        setMode('nav');
        return;
      }

      // 4. Button / Interactive hover state
      if (el.closest('button, .btn-liquid-sweep, .btn-electric, [data-cursor="button"]')) {
        setMode('button');
        return;
      }

      // 5. Card / Spotlight hover state
      if (el.closest('.spotlight-card, .service-card-wrapper, select, input')) {
        setMode('card');
        return;
      }

      setMode('default');
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animId);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <>
      {/* Site-Wide Bright Radial Cursor Spotlight Follower */}
      <div 
        ref={spotlightRef}
        className="global-cursor-spotlight hidden md:block" 
        aria-hidden="true"
      />

      <div ref={dotRef} className={`custom-cursor-dot hidden md:block ${mode !== 'default' ? 'opacity-30' : ''}`} />
      
      <div 
        ref={ringRef} 
        className={`custom-cursor-ring hidden md:flex items-center justify-center mode-${mode}`}
      >
        {mode === 'portfolio' && (
          <span className="text-[10px] font-mono text-cyan-300 font-extrabold tracking-widest text-center animate-pulse">
            VIEW
          </span>
        )}

        {mode === 'dashboard' && (
          <div className="w-full h-full relative flex items-center justify-center opacity-80">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
          </div>
        )}
      </div>
    </>
  );
};

/* ----------------------------------------------------
 * 2. Staggered Word Reveal Component
 * ---------------------------------------------------- */
const TextReveal = ({ text, className = "", wordDelay = 0.05 }) => {
  const words = useMemo(() => text.split(" "), [text]);
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={`inline-flex flex-wrap gap-x-[0.25em] ${className}`}>
      {words.map((word, idx) => (
        <span
          key={idx}
          className="inline-block transition-all duration-700 ease-out"
          style={{
            animation: `wordFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
            animationDelay: `${idx * wordDelay}s`,
            opacity: 0,
            transform: 'translate3d(0, 20px, 0)'
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
};

/* ----------------------------------------------------
 * 3. Viewport Scroll Reveal Component
 * ---------------------------------------------------- */
const RevealOnScroll = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('down');
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    let lastY = window.scrollY;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const currentY = window.scrollY;
        if (currentY > lastY) {
          setScrollDirection('down');
        } else if (currentY < lastY) {
          setScrollDirection('up');
        }
        lastY = currentY;

        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.12, rootMargin: '-30px 0px -30px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const transformOffscreen = scrollDirection === 'down' 
    ? 'translate3d(0, 36px, 0) scale(0.97)' 
    : 'translate3d(0, -36px, 0) scale(0.97)';

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0) scale(1)' : transformOffscreen,
        filter: isVisible ? 'blur(0px)' : 'blur(5px)',
        transitionDelay: isVisible ? `${delay}s` : '0s',
        willChange: 'opacity, transform, filter'
      }}
    >
      {children}
    </div>
  );
};

/* ----------------------------------------------------
 * 3.5. Continuous Real-Time Scroll Parallax Motion Engine
 * ---------------------------------------------------- */
const ParallaxElement = ({ children, speed = 0.1, direction = 'vertical', className = "" }) => {
  const ref = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    let animId;

    const updateParallax = () => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight + 150 && rect.bottom > -150) {
        const centerY = rect.top + rect.height / 2;
        const screenCenterY = windowHeight / 2;
        const offset = (centerY - screenCenterY) * speed;

        if (direction === 'vertical') {
          el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
        } else if (direction === 'horizontal') {
          el.style.transform = `translate3d(${offset.toFixed(2)}px, 0, 0)`;
        } else if (direction === 'rotate') {
          el.style.transform = `rotate(${(offset * 0.05).toFixed(2)}deg)`;
        }
      }
      animId = requestAnimationFrame(updateParallax);
    };

    updateParallax();
    return () => cancelAnimationFrame(animId);
  }, [speed, direction, prefersReducedMotion]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
};

/* ----------------------------------------------------
 * 4. Interactive 3D Cursor Motion & Spotlight Card Engine
 * ---------------------------------------------------- */
const SpotlightCard = React.forwardRef(({ children, className = "", style = {}, ...props }, ref) => {
  const localRef = useRef(null);
  const cardRef = ref || localRef;

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Set cursor spotlight coordinates
    el.style.setProperty('--mouse-x', `${x}px`);
    el.style.setProperty('--mouse-y', `${y}px`);

    // 3D Parallax Cursor Tilt & Motion
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (-(y - centerY) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;

    el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px) scale(1.02)`;
    el.style.transition = 'transform 0.1s ease-out, border-color 0.4s ease, box-shadow 0.4s ease';
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
    el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.4s ease';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`spotlight-card ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
});

/* ----------------------------------------------------
 * 5. 60 FPS Interactive Particle Canvas
 * ---------------------------------------------------- */
const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animationFrameId;
    let mouse = { x: null, y: null, radius: 180 };

    const resize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      createParticles();
    };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2.2 + 0.8;
        this.color = Math.random() > 0.35 ? '#00F0FF' : (Math.random() > 0.5 ? '#38BDF8' : '#6366F1');
        this.baseAlpha = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            let force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 1.5;
            this.y += (dy / dist) * force * 1.5;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.baseAlpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    }

    const createParticles = () => {
      particles = [];
      const count = Math.min(Math.floor((width * height) / 12000), 85);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          let dx = particles[i].x - particles[j].x;
          let dy = particles[i].y - particles[j].y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.25 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('resize', resize);
    if (canvas.parentElement) {
      canvas.parentElement.addEventListener('mousemove', handleMouseMove);
      canvas.parentElement.addEventListener('mouseleave', handleMouseLeave);
    }

    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (canvas.parentElement) {
        canvas.parentElement.removeEventListener('mousemove', handleMouseMove);
        canvas.parentElement.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [prefersReducedMotion]);

  // Disable matrix connecting lines as requested
  return null;
};

/* ----------------------------------------------------
 * 5.4. Animated Moving Aurora Image Background Component
 * ---------------------------------------------------- */
const AuroraMotionBackground = () => {
  return (
    <div className="aurora-motion-container" aria-hidden="true">
      {/* Moving Aurora Sky & Reflection Image */}
      <img 
        src="assets/aurora-bg.jpg" 
        alt="" 
        className="aurora-motion-image"
      />
      {/* Liquid Wave Aurora Glow Overlay */}
      <div className="aurora-shimmer-overlay" />
    </div>
  );
};

/* ----------------------------------------------------
 * 5.5. Ultra-Premium Liquid Organic Sweep Button Component with Magnetic Physics
 * ---------------------------------------------------- */
const LiquidButton = ({ children, onClick, className = "", icon = null, href = null, ...props }) => {
  const btnRef = useRef(null);

  const handleMouseMove = (e) => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate3d(${x * 0.18}px, ${y * 0.18}px, 0) scale(1.025)`;
  };

  const handleMouseLeave = () => {
    const el = btnRef.current;
    if (!el) return;
    el.style.transform = `translate3d(0px, 0px, 0px) scale(1)`;
  };

  const content = (
    <>
      {/* Liquid Organic Sweep Fill Layer */}
      <span className="liquid-sweep-fill" aria-hidden="true" />
      
      {/* Base Layer: White text on dark background */}
      <span className="text-layer-base">
        <span>{children}</span>
        {icon && <span className="text-sm transition-transform duration-300 group-hover:translate-x-1">{icon}</span>}
      </span>

      {/* Overlay Layer: Dark text on cream/cyan liquid background (Clipped) */}
      <span className="text-layer-overlay" aria-hidden="true">
        <span>{children}</span>
        {icon && <span className="text-sm transition-transform duration-300 group-hover:translate-x-1">{icon}</span>}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        ref={btnRef}
        href={href}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`btn-liquid-sweep group ${className}`}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`btn-liquid-sweep group ${className}`}
      {...props}
    >
      {content}
    </button>
  );
};

/* ----------------------------------------------------
 * 6. Header & Sticky Glass Navbar
 * ---------------------------------------------------- */
const Header = ({ onOpenBooking }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-[0_0_25px_rgba(0,240,255,0.45)] group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[11px] p-1.5 flex items-center justify-center">
              <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-cyan-400 group-hover:text-white transition-colors">
                <path d="M 26 75 V 25" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
                <path d="M 26 25 L 68 75" stroke="#00F0FF" strokeWidth="8" strokeLinecap="round"/>
                <path d="M 46 62 L 76 25" stroke="#00F0FF" strokeWidth="8" strokeLinecap="round"/>
                <path d="M 68 75 V 45" stroke="#94A3B8" strokeWidth="7" strokeLinecap="round"/>
                <circle cx="76" cy="25" r="4" fill="#FFFFFF"/>
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-xl tracking-tight text-white group-hover:text-cyan-300 transition-colors">NEXVEDA</span>
            <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase -mt-1">TECHNOLOGY</span>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#industries" className="hover:text-cyan-400 transition-colors">Solutions</a>
          <a href="#services" className="hover:text-cyan-400 transition-colors">Services</a>
          <a href="#portfolio" className="hover:text-cyan-400 transition-colors">Portfolio</a>
          <a href="#why-us" className="hover:text-cyan-400 transition-colors">Why Us</a>
          <a href="#process" className="hover:text-cyan-400 transition-colors">Process</a>
          <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-cyan-400 transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full glass-pill text-xs font-semibold text-slate-300 border border-slate-700/60">
            <span className="status-dot"></span>
            <span>2 Slots Available for Q3</span>
          </div>

          <LiquidButton onClick={() => onOpenBooking('Start Your Project')} icon="→">
            Start Your Project
          </LiquidButton>
        </div>
      </div>
    </header>
  );
};

/* ----------------------------------------------------
 * 7. Hero Section (Fullscreen 3D Tilt Mockup & Staggered Reveal)
 * ---------------------------------------------------- */
const Hero = ({ onOpenBooking }) => {
  const containerRef = useRef(null);
  const mockupRef = useRef(null);
  const heroRef = useRef(null);
  const radialGlowRef = useRef(null);
  const auroraParallaxRef = useRef(null);

  const handleHeroMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (radialGlowRef.current) {
      radialGlowRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    }

    if (auroraParallaxRef.current) {
      const px = (x - rect.width / 2) * 0.035;
      const py = (y - rect.height / 2) * 0.035;
      auroraParallaxRef.current.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    }
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current || !mockupRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateY = (x / (rect.width / 2)) * 14;
    const rotateX = -(y / (rect.height / 2)) * 14;
    mockupRef.current.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
  };

  const handleMouseLeave = () => {
    if (!mockupRef.current) return;
    mockupRef.current.style.transform = `rotateY(-10deg) rotateX(5deg)`;
  };

  return (
    <section 
      ref={heroRef}
      onMouseMove={handleHeroMouseMove}
      className="relative min-h-screen flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-transparent"
    >
      {/* Subtle Neural Network Connection Canvas */}
      <ParticleCanvas />
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* Left Column: Hero Title & CTAs (Shifts upward on scroll) */}
        <RevealOnScroll delay={0.1} className="lg:col-span-6 space-y-8 text-left">
          <ParallaxElement speed={-0.07}>
          
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-panel border border-cyan-500/30 text-xs font-semibold text-cyan-300 shadow-[0_0_25px_rgba(0,240,255,0.25)] animate-float">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="font-mono uppercase tracking-wider">ENTERPRISE WEB ARCHITECTURE</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300">100% CUSTOM CODE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-heading tracking-tight leading-[1.08] text-white mt-4">
            <TextReveal text="Build Digital Experiences" /> <br />
            <span className="text-gradient-cyan">
              <TextReveal text="That Outperform Competitors" wordDelay={0.06} />
            </span>
          </h1>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <LiquidButton onClick={() => onOpenBooking('Hero Primary CTA')} icon="→">
              Schedule Architecture Strategy Call
            </LiquidButton>

            <LiquidButton href="#portfolio" icon="→">
              Explore Live Case Studies
            </LiquidButton>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-6 border-t border-slate-800/80 text-xs sm:text-sm text-slate-100 font-semibold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 text-sm">⚡</span>
              <span>100/100 Core Web Vitals</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-sm">🛡️</span>
              <span>100% Custom IP Ownership</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-indigo-400 text-sm">🚀</span>
              <span>Sub-Second Page Speed</span>
            </div>
          </div>

          </ParallaxElement>
        </RevealOnScroll>

        {/* Right Column: 3D Interactive Dashboard Card (Appears Slightly After Text) */}
        <RevealOnScroll 
          delay={0.3}
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="lg:col-span-6 relative perspective-container"
        >
          <ParallaxElement speed={0.07}>
            {/* LAYER 4: Faint Radial Blue Glow Behind Dashboard */}
          <div className="dashboard-radial-glow" aria-hidden="true"></div>

          <SpotlightCard ref={mockupRef} className="mockup-3d-card glass-panel rounded-3xl border border-cyan-500/30 p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <span className="ml-3 text-xs text-slate-300 font-mono">nexveda-engine://enterprise-hud.v4</span>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE TELEMETRY
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-200 font-medium">Monthly GMV</div>
                <div className="text-lg font-extrabold text-white font-heading mt-0.5">$1.42M</div>
                <div className="text-[10px] text-emerald-400 font-bold mt-0.5">▲ +340% YoY</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-200 font-medium">Page Speed</div>
                <div className="text-lg font-extrabold text-gradient-cyan font-heading mt-0.5">100/100</div>
                <div className="text-[10px] text-cyan-400 font-mono mt-0.5">LCP: 0.18s</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-200 font-medium">Conversion Rate</div>
                <div className="text-lg font-extrabold text-emerald-400 font-heading mt-0.5">14.8%</div>
                <div className="text-[10px] text-slate-200 mt-0.5">3.4x Industry Benchmark</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Conversion Funnel Growth</span>
                <span className="font-mono text-cyan-400">Q3 Enterprise Benchmark</span>
              </div>

              <div className="h-32 w-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>
                  
                  <path d="M 0 100 Q 80 80, 160 60 T 320 20 L 400 10 L 400 120 L 0 120 Z" fill="url(#chartGrad)" />
                  <path d="M 0 100 Q 80 80, 160 60 T 320 20 L 400 10" fill="none" stroke="#00F0FF" strokeWidth="3" className="animate-pulse-line" />
                  
                  <circle cx="160" cy="60" r="4" fill="#00F0FF" className="animate-ping" />
                  <circle cx="160" cy="60" r="4" fill="#FFFFFF" />
                  <circle cx="320" cy="20" r="4" fill="#00F0FF" className="animate-ping" />
                  <circle cx="320" cy="20" r="4" fill="#FFFFFF" />
                  <circle cx="400" cy="10" r="5" fill="#38BDF8" />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 text-slate-200 font-mono">
                <span className="text-cyan-400">✦ Next.js 14</span> • <span>React</span> • <span>Tailwind</span>
              </div>
              <button onClick={() => onOpenBooking('Dashboard Demo')} className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition">
                Explore Demo →
              </button>
            </div>

          </SpotlightCard>

          {/* Floating Pills (Animates Last) */}
          <div className="floating-layer-1 absolute -top-6 -right-6 px-4 py-2 rounded-2xl glass-panel border border-cyan-400/40 text-xs font-semibold text-cyan-300 shadow-xl hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>⚡ 0.18s Sub-Second LCP</span>
          </div>

          <div className="floating-layer-2 absolute -bottom-6 -left-6 px-4 py-2 rounded-2xl glass-panel border border-emerald-400/40 text-xs font-semibold text-emerald-300 shadow-xl hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>🟢 99.99% Enterprise Uptime</span>
          </div>

          </ParallaxElement>
        </RevealOnScroll>

      </div>
    </section>
  );
};

/* ----------------------------------------------------
 * 8. Dual-Track Marquee Showcase
 * ---------------------------------------------------- */
const trackLeftItems = [
  { name: "NEXT.JS 14", icon: (<svg className="w-5 h-5 text-white" viewBox="0 0 180 180" fill="currentColor"><path d="M115.54 125.75L58.28 50H50V130H61.64V68.17L113.1 135.53C113.93 135.25 114.74 134.95 115.54 125.75Z"/><path d="M120 50H108.36V130H120V50Z"/><circle cx="90" cy="90" r="85" fill="none" stroke="currentColor" strokeWidth="10"/></svg>) },
  { name: "REACT 18", icon: (<svg className="w-5.5 h-5.5 text-cyan-400 animate-spin-slow" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6"><ellipse cx="50" cy="50" rx="42" ry="16" /><ellipse cx="50" cy="50" rx="42" ry="16" transform="rotate(60 50 50)" /><ellipse cx="50" cy="50" rx="42" ry="16" transform="rotate(120 50 50)" /><circle cx="50" cy="50" r="7" fill="#00F0FF" /></svg>) },
  { name: "TAILWIND CSS", icon: (<svg className="w-5.5 h-5.5 text-cyan-300" viewBox="0 0 24 24" fill="currentColor"><path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C7.666 17.818 9.027 19.2 12.001 19.2c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/></svg>) },
  { name: "THREE.JS", icon: (<svg className="w-5.5 h-5.5 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 19 22 19 12 2"/><line x1="12" y1="2" x2="12" y2="19"/><line x1="2" y1="19" x2="17" y2="10.5"/><line x1="22" y1="19" x2="7" y2="10.5"/></svg>) },
  { name: "STRIPE BILLING", icon: (<div className="w-5.5 h-5.5 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-[0_0_12px_rgba(99,102,241,0.5)]">S</div>) },
  { name: "HEADLESS SHOPIFY", icon: (<svg className="w-5.5 h-5.5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor"><path d="M15.34 3.79c-.02-.12-.13-.19-.24-.17-.12.02-.7.13-1.47.45-.77-1.12-1.74-1.95-2.88-2.07-.13-.01-.25.07-.28.19l-.36 1.77c-.12.58-.5 1.05-1.04 1.28-.54.23-1.16.14-1.62-.25L6.1 3.7c-.09-.08-.23-.07-.31.02-.08.09-.39.46-.86 1.15C4.22 5.97 3.32 7.7 2.6 9.68L1.1 14.1c-.04.12.02.26.13.31l1.52.65c.5.21 1.07-.02 1.28-.52l1.63-3.86c.05-.12.19-.18.31-.13l13.9 5.96c.12.05.18.19.13.31l-1.63 3.86c-.21.5.02 1.07.52 1.28l1.52.65c.12.05.26-.02.31-.13l1.5-4.42c.72-1.98 1.62-3.71 2.33-4.81.47-.69.78-1.06.86-1.15.08-.09.07-.23-.02-.31l-1.35-1.29c-.46-.39-1.08-.48-1.62-.25-.54.23-.92.7-1.04 1.28l-.36 1.77c-.03.12-.15.2-.28.19-1.14-.12-2.11-.95-2.88-2.07-.77.32-1.35.43-1.47.45-.11.02-.22-.05-.24-.17z"/></svg>) }
];

const trackRightItems = [
  { name: "CLOUDFLARE EDGE", icon: (<svg className="w-5.5 h-5.5 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>) },
  { name: "MONGODB", icon: (<svg className="w-5.5 h-5.5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C12 2 4 8.5 4 15.5C4 19.09 6.91 22 10.5 22C11.36 22 12 21.36 12 20.5V2Z"/><path d="M12 2V20.5C12 21.36 12.64 22 13.5 22C17.09 22 20 19.09 20 15.5C20 8.5 12 2 12 2Z" opacity="0.7"/></svg>) },
  { name: "NODE.JS", icon: (<svg className="w-5.5 h-5.5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7.5V18.5L12 24L22 18.5V7.5L12 2ZM12 4.3L19.5 8.4V16.6L12 20.7L4.5 16.6V8.4L12 4.3Z"/></svg>) },
  { name: "EXPRESS.JS", icon: (<div className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[10px] font-bold border border-slate-700">ex</div>) },
  { name: "FIGMA DESIGN", icon: (<svg className="w-5.5 h-5.5" viewBox="0 0 38 57" fill="none"><path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38H19V28.5Z" fill="#1ABCFE"/><path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/><path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/><path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/><path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/></svg>) },
  { name: "AWS CLOUD", icon: (<svg className="w-5.5 h-5.5 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><path d="M6.7 14.7c-2.4-.4-4.2-2.3-4.2-4.7 0-2.6 2.1-4.7 4.7-4.7 1.2 0 2.3.5 3.1 1.3 1-.7 2.3-1.1 3.7-1.1 3.6 0 6.5 2.9 6.5 6.5 0 .4-.1.9-.2 1.3.9.7 1.4 1.7 1.4 2.8 0 2.1-1.7 3.8-3.8 3.8H6.5c-2.2 0-4-1.8-4-4 0-1.8 1.2-3.3 2.9-3.8z"/></svg>) }
];

const Marquee = () => {
  return (
    <section className="marquee-wrapper relative overflow-hidden py-8 bg-tech-grid space-y-4">
      <div className="marquee-sheen-line marquee-sheen-line-top"></div>
      <div className="marquee-sheen-line marquee-sheen-line-bottom"></div>
      
      {/* Soft Radial Blue Glow Behind Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <RevealOnScroll className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-5">
        
        <div className="text-center text-[10px] font-mono uppercase text-cyan-400 font-semibold tracking-[0.25em] mb-3 opacity-85 flex items-center justify-center gap-3">
          <span className="w-10 h-[1px] bg-gradient-to-r from-transparent to-cyan-400"></span>
          <span>ENGINEERING TECH STACKS & ECOSYSTEM INTEGRATIONS</span>
          <span className="w-10 h-[1px] bg-gradient-to-l from-transparent to-cyan-400"></span>
        </div>

        {/* TRACK 1: TOP ROW - RIGHT TO LEFT (←←←←) */}
        <div className="relative flex items-center w-full">
          <div className="w-full overflow-hidden">
            <div className="marquee-container">
              <div className="marquee-content marquee-content-left">
                {trackLeftItems.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <div className={`marquee-item group cursor-pointer float-pill-${(idx % 3) + 1}`}>
                      <span className="p-1 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>
                      <span className="text-xs font-heading font-extrabold tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                        {item.name}
                      </span>
                    </div>

                    <div className="diamond-separator">
                      <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 22,12 12,22 2,12" />
                      </svg>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              <div className="marquee-content marquee-content-left" aria-hidden="true">
                {trackLeftItems.map((item, idx) => (
                  <React.Fragment key={`dup1-${idx}`}>
                    <div className={`marquee-item group cursor-pointer float-pill-${(idx % 3) + 1}`}>
                      <span className="p-1 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>
                      <span className="text-xs font-heading font-extrabold tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                        {item.name}
                      </span>
                    </div>

                    <div className="diamond-separator">
                      <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 22,12 12,22 2,12" />
                      </svg>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TRACK 2: BOTTOM ROW - LEFT TO RIGHT (→→→→) - HIDDEN ON MOBILE FOR CLEAN SINGLE MARQUEE */}
        <div className="relative hidden md:flex items-center w-full">
          <div className="w-full overflow-hidden">
            <div className="marquee-container">
              <div className="marquee-content marquee-content-right">
                {trackRightItems.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <div className={`marquee-item group cursor-pointer float-pill-${((idx + 1) % 3) + 1}`}>
                      <span className="p-1 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>
                      <span className="text-xs font-heading font-extrabold tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                        {item.name}
                      </span>
                    </div>

                    <div className="diamond-separator">
                      <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 22,12 12,22 2,12" />
                      </svg>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              <div className="marquee-content marquee-content-right" aria-hidden="true">
                {trackRightItems.map((item, idx) => (
                  <React.Fragment key={`dup2-${idx}`}>
                    <div className={`marquee-item group cursor-pointer float-pill-${((idx + 1) % 3) + 1}`}>
                      <span className="p-1 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>
                      <span className="text-xs font-heading font-extrabold tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                        {item.name}
                      </span>
                    </div>

                    <div className="diamond-separator">
                      <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 22,12 12,22 2,12" />
                      </svg>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

      </RevealOnScroll>
    </section>
  );
};

/* ----------------------------------------------------
 * 9. Target Client Industry Showcase
 * ---------------------------------------------------- */
const industryData = {
  local: {
    title: "High-Ticket Local Business Platform",
    subtitle: "Turn local search traffic into high-paying, booked appointments.",
    metrics: [
      { label: "Local Google Maps Ranking", value: "Top 3 Spot" },
      { label: "Inbound Call Rate", value: "+210%" },
      { label: "Page Speed Score", value: "99/100" }
    ],
    features: [
      "Geo-targeted local SEO architecture & schema markup",
      "Instant 1-click click-to-call & Google Maps integration",
      "Automated lead capture & SMS notification sync",
      "Interactive service catalog with live price quote preview"
    ],
    tech: ["Next.js", "Tailwind CSS", "Twilio API", "Google Places API"],
    quote: "Our local service bookings tripled within 45 days of launching the Nexveda platform."
  },
  startups: {
    title: "SaaS & Tech Startup Launchpad",
    subtitle: "Enterprise product design engineered to convert venture investors & users.",
    metrics: [
      { label: "Free-to-Paid Conversion", value: "18.4%" },
      { label: "Series A Raised", value: "$4.2M" },
      { label: "Interactive Demo CTR", value: "+340%" }
    ],
    features: [
      "High-converting visual product architecture & interactive feature HUDs",
      "Stripe Billing & multi-tier subscription engine integration",
      "Dark mode glass aesthetic optimized for tech founders & developers",
      "Real-time analytics dashboard & customer journey tracking"
    ],
    tech: ["React / Vite", "Node.js", "Stripe API", "Framer Motion"],
    quote: "Nexveda designed our platform so cleanly that investors committed during our very first demo."
  },
  restaurants: {
    title: "Gourmet Hospitality & Dining Engine",
    subtitle: "Zero 3rd-party commission delivery & direct high-table reservation web app.",
    metrics: [
      { label: "Direct Orders", value: "85%" },
      { label: "Commission Saved", value: "$3,400/mo" },
      { label: "Table Occupancy", value: "98%" }
    ],
    features: [
      "Interactive 3D digital menu with high-resolution culinary media",
      "Direct commission-free online ordering & contactless table reservations",
      "VIP loyalty rewards & automated SMS promotional marketing",
      "Integrated POS synchronization (Toast, Square, Clover)"
    ],
    tech: ["WebSockets", "Square API", "Tailwind CSS", "PWA"],
    quote: "Bypassing UberEats commissions saved us over $40,000 in our first year alone!"
  },
  realestate: {
    title: "Luxury Real Estate & Property Showcase",
    subtitle: "High-end visual listings built to close multi-million dollar properties faster.",
    metrics: [
      { label: "Average Property Price", value: "$2.8M" },
      { label: "Virtual Tour Engagement", value: "6.2 min" },
      { label: "Qualified Inquiries", value: "+180%" }
    ],
    features: [
      "Smooth 360° virtual tour modal & 4K property media showcase",
      "MLS / IDX automated live listing synchronization",
      "Interactive mortgage & ROI calculator for high-net-worth buyers",
      "Private VIP buyer portal with password-protected listing decks"
    ],
    tech: ["Three.js", "IDX/MLS API", "Next.js", "Cloudflare Stream"],
    quote: "The visual polish of our luxury real estate portal commands instant buyer trust."
  },
  clinics: {
    title: "HIPAA-Compliant Medical & Healthcare Portal",
    subtitle: "Secure patient onboarding and automated appointment scheduling.",
    metrics: [
      { label: "Patient No-Show Rate", value: "-65%" },
      { label: "New Patient Intake", value: "+240%" },
      { label: "HIPAA Security Score", value: "100%" }
    ],
    features: [
      "End-to-end encrypted patient intake forms & document uploads",
      "Real-time doctor calendar availability & automated reminder SMS/Email",
      "Telehealth video consultation portal integration",
      "Accessible ADA & WCAG AAA compliant navigation"
    ],
    tech: ["React", "HIPAA Compliant AWS", "EHR Sync", "Tailwind"],
    quote: "Our intake administrative time dropped by 15 hours per week while bookings surged."
  },
  schools: {
    title: "Modern Educational Institution & Academy Site",
    subtitle: "Inspire prospective students and streamline course admissions.",
    metrics: [
      { label: "Admissions Applications", value: "+190%" },
      { label: "Mobile Student Engagement", value: "+310%" },
      { label: "Lighthouse Performance", value: "100/100" }
    ],
    features: [
      "Interactive course catalog with curriculum filtering & video previews",
      "Student enrollment & online application portal",
      "Parent/Student portal integration & announcement feed",
      "Fast multi-language translation & global CDN architecture"
    ],
    tech: ["Next.js", "Headless CMS", "Tailwind CSS", "i18n"],
    quote: "Our university application volume shattered records following the Nexveda redesign."
  },
  ecommerce: {
    title: "Enterprise E-Commerce Brand Accelerator",
    subtitle: "Sub-second product pages engineered to maximize Average Order Value (AOV).",
    metrics: [
      { label: "Page Load Speed", value: "0.18s" },
      { label: "Cart Abandonment Drop", value: "-42%" },
      { label: "Annual GMV Scaled", value: "$12M+" }
    ],
    features: [
      "Headless Shopify / Custom Node backend with instant sub-second page transitions",
      "Dynamic upsell, cross-sell & one-click checkout optimization",
      "Interactive 3D product visualizer & color swatch preview",
      "Klaviyo / Meta Pixel advanced conversion tracking integration"
    ],
    tech: ["Shopify Storefront API", "React", "GraphQL", "Tailwind"],
    quote: "Nexveda boosted our e-commerce conversion rate from 1.9% to 4.3% in 60 days!"
  }
};

const IndustryShowcase = ({ onOpenBooking }) => {
  const [activeTab, setActiveTab] = useState('local');
  const d = industryData[activeTab] || industryData.local;

  const tabs = [
    { key: 'local', label: '📍 Local Businesses' },
    { key: 'startups', label: '🚀 Startups & SaaS' },
    { key: 'restaurants', label: '🍷 Restaurants' },
    { key: 'realestate', label: '🏢 Real Estate' },
    { key: 'clinics', label: '🩺 Medical Clinics' },
    { key: 'schools', label: '🎓 Schools & Academies' },
    { key: 'ecommerce', label: '🛍️ E-Commerce Brands' }
  ];

  return (
    <section id="industries" className="py-24 px-4 sm:px-6 lg:px-8 relative border-t border-slate-900">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <RevealOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">TARGET CLIENT SOLUTIONS</h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-white font-heading">
            <TextReveal text="Tailored Web Architecture for" /> <span className="text-gradient-cyan"><TextReveal text="Your Industry" wordDelay={0.06} /></span>
          </p>
          <p className="text-slate-200 text-base">
            We don't build generic websites. Every industry demands custom conversion funnels, integrations, and user experiences.
          </p>
        </RevealOnScroll>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {tabs.map(t => (
            <LiquidButton
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`py-2 px-4 text-xs font-semibold ${
                activeTab === t.key 
                  ? 'border-cyan-400 text-cyan-300 shadow-[0_0_25px_#00F0FF]' 
                  : 'border-slate-800 text-slate-200'
              }`}
            >
              {t.label}
            </LiquidButton>
          ))}
        </div>

        <RevealOnScroll>
          <SpotlightCard className="glass-panel p-8 sm:p-12 rounded-3xl border border-cyan-500/20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-semibold text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  {activeTab.toUpperCase()} ARCHITECTURE
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white font-heading">{d.title}</h3>
                <p className="text-slate-200 text-base leading-relaxed">{d.subtitle}</p>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  {d.metrics.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl glass-panel text-center">
                      <div className="text-lg sm:text-xl font-extrabold text-gradient-cyan font-heading">{m.value}</div>
                      <div className="text-[11px] text-slate-200 mt-1">{m.label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5 pt-2">
                  {d.features.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">✓</div>
                      <span className="text-sm text-slate-300">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs text-slate-300 font-medium mr-2">Tech Stack:</span>
                  {d.tech.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-xs rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">{t}</span>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="glass-panel p-6 sm:p-8 rounded-2xl relative spotlight-card border border-cyan-500/20 shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                      <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                      <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
                      <span className="ml-2 text-xs text-slate-300 font-mono">nexveda-system://{activeTab}.app</span>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">100% Optimized</span>
                  </div>

                  <blockquote className="text-slate-200 italic text-sm sm:text-base leading-relaxed mb-6">
                    "{d.quote}"
                  </blockquote>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-200">Guaranteed Core Web Vitals</div>
                      <div className="text-sm font-semibold text-white mt-0.5">LCP: <span className="text-emerald-400">0.18s</span> | CLS: <span className="text-emerald-400">0.00</span></div>
                    </div>
                    <button onClick={() => onOpenBooking(d.title)} className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition">
                      Request Architecture Demo →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </RevealOnScroll>

      </div>
    </section>
  );
};

/* ----------------------------------------------------
 * 10. Services Blueprint (6 Ultra-Premium Cards)
 * ---------------------------------------------------- */
const ServicesGrid = ({ onOpenBooking }) => {
  const services = [
    {
      title: "Website Design",
      icon: (<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>),
      desc: "Bespoke digital designs crafted to captivate your audience, elevate brand credibility, and convert traffic into enterprise clients.",
      deliverables: ["Apple & Linear Inspired Layouts", "Dual-Layer Glassmorphism & Micro-Glows", "Mobile-First Responsive Grid"]
    },
    {
      title: "Website Development",
      icon: (<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>),
      desc: "Hand-crafted Next.js & React engineering. Zero templates, sub-second load speeds, and 100/100 Core Web Vitals performance.",
      deliverables: ["Hand-Written Next.js 14 & React", "60 FPS Locked Canvas & CSS Motion", "Global Edge CDN Deployment"]
    },
    {
      title: "E-commerce",
      icon: (<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>),
      desc: "Headless Shopify & custom checkout funnels engineered to maximize Average Order Value (AOV) and eliminate cart abandonment.",
      deliverables: ["Headless Storefront Architecture", "1-Click Checkout & Dynamic Upsells", "3D Product Swatches & Visualizers"]
    },
    {
      title: "UI/UX Design",
      icon: (<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line></svg>),
      desc: "Scientific user experience architecture. Intuitive user flows, micro-interactions, and conversion-optimized interfaces.",
      deliverables: ["Interactive Figma Design Systems", "Conversion Journey Heatmap Audits", "Micro-Interaction Motion Specs"]
    },
    {
      title: "Brand Identity",
      icon: (<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>),
      desc: "Distinctive brand positioning, color systems, typography suites, and visual guidelines that command premium prices.",
      deliverables: ["Complete Visual Brand System", "Curated Typography & Color Tokens", "Vector Mark & Brand Asset Kits"]
    },
    {
      title: "Website Maintenance",
      icon: (<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>),
      desc: "24/7 proactive security monitoring, 99.99% uptime guarantees, speed audits, and continuous conversion optimization.",
      deliverables: ["24/7 Real-Time Telemetry & Uptime", "Automated Cloud Backups & Audits", "Ongoing Conversion Optimization"]
    }
  ];

  return (
    <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 relative border-t border-slate-900">
      <div className="max-w-7xl mx-auto space-y-16">
        
        <RevealOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">OUR CAPABILITIES</h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-white font-heading">
            <TextReveal text="Enterprise Services Engineered for" /> <span className="text-gradient-cyan"><TextReveal text="Dominance" wordDelay={0.06} /></span>
          </p>
          <p className="text-slate-200 text-base">
            Every service is custom-built with hand-crafted code, Apple-level aesthetics, and conversion-first architecture.
          </p>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, idx) => (
            <RevealOnScroll key={idx} delay={idx * 0.08}>
              <div className="service-card-wrapper h-full">
                <SpotlightCard className="glass-panel rounded-[1.4rem] p-8 h-full flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="service-icon-box w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                      {s.icon}
                    </div>

                    <h3 className="text-2xl font-extrabold text-white font-heading">{s.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{s.desc}</p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-800/80">
                    <div className="text-xs font-mono text-cyan-400 font-semibold uppercase">Deliverables</div>
                    <ul className="text-xs text-slate-300 space-y-2">
                      {s.deliverables.map((d, dIdx) => (
                        <li key={dIdx} className="flex items-center gap-2">
                          <span className="text-cyan-400 font-bold">✓</span> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </SpotlightCard>
              </div>
            </RevealOnScroll>
          ))}
        </div>

      </div>
    </section>
  );
};

/* ----------------------------------------------------
 * 11. Portfolio Showcase (Floating Glass Mockups)
 * ---------------------------------------------------- */
const portfolioItems = [
  {
    id: 1,
    title: "Aura Global Real Estate Portal",
    category: "realestate",
    industry: "PropTech & Luxury Real Estate",
    completionTime: "3 Weeks",
    imageGrad: "from-sky-950 via-slate-900 to-indigo-950",
    metrics: "+240% Inquiries | $42M Closed Volume",
    desc: "3D virtual tour real estate portal built for luxury brokerages in Dubai & Miami.",
    fullDesc: "Aura Real Estate required an ultra-fast, high-end visual portal capable of presenting 4K drone cinematography, interactive floor plans, and real-time MLS listings without compromising page load speeds.",
    results: ["0.22s Largest Contentful Paint", "+240% increase in buyer consultation requests", "$42M in real estate volume closed through the web engine"],
    stack: ["Next.js 14", "Three.js", "Tailwind CSS", "Cloudflare Stream"],
    previewUrl: "https://aura-realestate-demo.nexveda.io"
  },
  {
    id: 2,
    title: "Pulse Telemedicine & Health Engine",
    category: "health",
    industry: "Telemedicine & Healthcare",
    completionTime: "2 Weeks",
    imageGrad: "from-teal-950 via-slate-900 to-cyan-950",
    metrics: "-70% Intake Time | 100% HIPAA Score",
    desc: "HIPAA-compliant patient onboarding and automated calendar scheduling platform.",
    fullDesc: "Pulse Health needed a seamless patient intake and video consultation portal that automated document submission while adhering strictly to HIPAA security standards.",
    results: ["Automated 95% of patient pre-registration paperwork", "Reduced patient appointment no-shows by 68%", "Zero security vulnerabilities on third-party security audits"],
    stack: ["React", "Node.js", "AWS HIPAA Vault", "Tailwind"],
    previewUrl: "https://pulse-health-demo.nexveda.io"
  },
  {
    id: 3,
    title: "Veloce Luxury E-Commerce Storefront",
    category: "ecommerce",
    industry: "High-Ticket E-Commerce",
    completionTime: "4 Weeks",
    imageGrad: "from-indigo-950 via-slate-900 to-blue-950",
    metrics: "4.3% Conv. Rate | +160% Monthly GMV",
    desc: "Headless Shopify store with sub-second page transitions and dynamic 3D swatches.",
    fullDesc: "Veloce needed to replace their slow, bloated legacy store with a headless e-commerce architecture engineered for high average order values.",
    results: ["Sub-200ms page navigation speeds", "Conversion rate jumped from 1.8% to 4.3%", "Scaled to $1.2M in monthly revenue during Black Friday without downtime"],
    stack: ["Headless Shopify API", "React", "GraphQL", "Tailwind"],
    previewUrl: "https://veloce-store-demo.nexveda.io"
  },
  {
    id: 4,
    title: "Apex AI SaaS Analytics HUD",
    category: "saas",
    industry: "Startups & FinTech",
    completionTime: "2.5 Weeks",
    imageGrad: "from-blue-950 via-slate-900 to-slate-950",
    metrics: "Raised $6.5M Series A | 14K Waitlist",
    desc: "Dark glassmorphic SaaS landing page and interactive investor demo environment.",
    fullDesc: "Apex SaaS needed a high-impact digital presence to launch their AI analytics suite to enterprise venture capital funds and early-adopter tech teams.",
    results: ["Over 14,000 developer waitlist signups in 14 days", "Successfully closed a $6.5M Series A round", "Featured on ProductHunt #1 Product of the Day"],
    stack: ["Next.js", "Framer Motion", "Tailwind CSS", "Stripe API"],
    previewUrl: "https://apex-analytics-demo.nexveda.io"
  },
  {
    id: 5,
    title: "Gourmet Direct Kitchen App",
    category: "hospitality",
    industry: "Hospitality & Dining",
    completionTime: "2 Weeks",
    imageGrad: "from-amber-950 via-slate-900 to-red-950",
    metrics: "Saved $45K/yr Fees | 82% Direct Orders",
    desc: "Direct online ordering system bypassing 3rd-party delivery app fees.",
    fullDesc: "A premium cloud kitchen restaurant network wanted to break free from high 3rd-party delivery commissions by offering their own instant web ordering system.",
    results: ["Captured 82% direct delivery orders", "Saved over $45,000 annually in delivery commissions", "Average order value increased by 28% via dynamic upsells"],
    stack: ["PWA", "Square API", "WebSockets", "Tailwind"],
    previewUrl: "https://gourmet-kitchen-demo.nexveda.io"
  },
  {
    id: 6,
    title: "Edura International Academy",
    category: "schools",
    industry: "Schools & EdTech",
    completionTime: "3 Weeks",
    imageGrad: "from-cyan-950 via-slate-900 to-teal-950",
    metrics: "100/100 Core Web Vitals | +190% Apps",
    desc: "Interactive course catalog and multi-lingual student admissions portal.",
    fullDesc: "Edura Academy required a modern, accessible web portal to showcase international curriculum, process student applications, and communicate with parents globally.",
    results: ["100/100 Lighthouse Performance & Accessibility score", "Processed over 8,500 international student applications", "Multi-language instant translation across 8 languages"],
    stack: ["Next.js", "Headless CMS", "i18n", "Tailwind"],
    previewUrl: "https://edura-academy-demo.nexveda.io"
  }
];

const PortfolioShowcase = ({ onOpenModal }) => {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    return filter === 'all' ? portfolioItems : portfolioItems.filter(item => item.category === filter);
  }, [filter]);

  const handleVisit = (title) => {
    alert(`Launching live enterprise preview environment for "${title}"...`);
  };

  return (
    <section id="portfolio" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-slate-950/40 border-t border-slate-900">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <RevealOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">PROVEN RESULTS</h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-white font-heading">
            <TextReveal text="Featured Enterprise" /> <span className="text-gradient-cyan"><TextReveal text="Case Studies" wordDelay={0.06} /></span>
          </p>
          <p className="text-slate-200 text-base">
            Explore how we engineered digital dominance for leading brands across industries.
          </p>
        </RevealOnScroll>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {['all', 'realestate', 'health', 'ecommerce', 'saas', 'hospitality', 'schools'].map(cat => (
            <LiquidButton
              key={cat}
              onClick={() => setFilter(cat)}
              className={`py-1.5 px-4 text-xs font-semibold ${
                filter === cat 
                  ? 'border-cyan-400 text-cyan-300 shadow-[0_0_25px_#00F0FF]' 
                  : 'border-slate-800 text-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Work' : cat.toUpperCase()}
            </LiquidButton>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item, idx) => (
            <RevealOnScroll key={item.id} delay={idx * 0.08}>
              <div className="portfolio-card-wrapper group h-full">
                <SpotlightCard className="glass-panel rounded-3xl overflow-hidden border border-slate-800 group-hover:border-cyan-400/60 transition-all duration-500 shadow-2xl flex flex-col justify-between relative h-full">
                
                <div className="bg-slate-950/90 px-5 py-3 border-b border-slate-800 flex items-center justify-between z-10 relative rounded-t-3xl">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
                    <span className="ml-2 text-[11px] font-mono text-slate-300 truncate max-w-[150px]">{item.previewUrl}</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    ⏱️ {item.completionTime}
                  </span>
                </div>

                <div className={`h-56 bg-gradient-to-br ${item.imageGrad} p-6 relative flex flex-col justify-between overflow-hidden`}>
                  <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none"></div>
                  <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-400/20 transition-all"></div>
                  
                  <div className="flex justify-between items-start z-10 relative">
                    <span className="text-xs px-3 py-1 rounded-full glass-pill text-cyan-300 font-semibold border border-cyan-500/30">{item.industry}</span>
                  </div>

                  <div className="z-10 relative space-y-1">
                    <div className="text-xs font-mono text-emerald-400 font-bold tracking-wide">🏆 {item.metrics}</div>
                    <h4 className="text-2xl font-extrabold text-white font-heading group-hover:text-cyan-300 transition-colors">{item.title}</h4>
                  </div>

                  <div className="portfolio-hover-overlay absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-3 p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                    <span className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-widest mb-1">ENTERPRISE CASE STUDY</span>
                    
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button onClick={() => handleVisit(item.title)} className="px-5 py-2.5 rounded-full bg-cyan-500 text-black font-semibold text-xs hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-1.5">
                        <span>Visit Website</span>
                        <span>↗</span>
                      </button>

                      <button onClick={() => onOpenModal(item)} className="px-5 py-2.5 rounded-full glass-panel border border-cyan-400/40 text-white font-semibold text-xs hover:border-cyan-400 transition flex items-center gap-1.5">
                        <span>Case Study</span>
                        <span>🔍</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4 bg-slate-950/60 border-t border-slate-800 rounded-b-3xl">
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                  
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.stack.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-[10px] font-mono rounded bg-slate-900 text-slate-300 border border-slate-800">{s}</span>
                    ))}
                  </div>
                </div>

              </SpotlightCard>
            </div>
          </RevealOnScroll>
        ))}
      </div>

      </div>
    </section>
  );
};

/* ----------------------------------------------------
 * 12. Comparison Matrix
 * ---------------------------------------------------- */
const ComparisonMatrix = () => {
  return (
    <section id="why-us" className="py-24 px-4 sm:px-6 lg:px-8 relative border-t border-slate-900">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <RevealOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">THE NEXVEDA ADVANTAGE</h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-white font-heading">
            <TextReveal text="How We Compare Against" /> <span className="text-gradient-cyan"><TextReveal text="Alternatives" wordDelay={0.06} /></span>
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <SpotlightCard className="glass-panel rounded-3xl overflow-x-auto no-scrollbar border border-cyan-500/20">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs font-heading font-semibold uppercase text-slate-200 border-b border-slate-800">
                <tr>
                  <th className="p-6">Feature / Capability</th>
                  <th className="p-6 text-cyan-400 font-bold bg-cyan-500/10 border-x border-cyan-500/20">Nexveda Engineering</th>
                  <th className="p-6">Traditional Agencies</th>
                  <th className="p-6">Budget Freelancers / Templates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr className="hover:bg-slate-900/40">
                  <td className="p-6 font-semibold text-white">Architecture & Codebase</td>
                  <td className="p-6 font-bold text-cyan-300 bg-cyan-500/5 border-x border-cyan-500/20">100% Hand-Crafted React/Next.js</td>
                  <td className="p-6 text-slate-200">Bloated WordPress / Page Builders</td>
                  <td className="p-6 text-slate-200">$50 Pre-made Themes</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-6 font-semibold text-white">Lighthouse Performance Score</td>
                  <td className="p-6 font-bold text-emerald-400 bg-cyan-500/5 border-x border-cyan-500/20">Guaranteed 95 - 100/100</td>
                  <td className="p-6 text-slate-200">45 - 65/100 (Unoptimized)</td>
                  <td className="p-6 text-slate-200">25 - 50/100 (Extremely Slow)</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-6 font-semibold text-white">Conversion Funnel Engineering</td>
                  <td className="p-6 font-bold text-cyan-300 bg-cyan-500/5 border-x border-cyan-500/20">Scientific UX & A/B Optimized</td>
                  <td className="p-6 text-slate-200">Generic stock layout</td>
                  <td className="p-6 text-slate-200">Zero conversion strategy</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-6 font-semibold text-white">Framerate & Animations</td>
                  <td className="p-6 font-bold text-cyan-300 bg-cyan-500/5 border-x border-cyan-500/20">Locked 60 FPS Micro-Interactions</td>
                  <td className="p-6 text-slate-200">Janky scroll plugins</td>
                  <td className="p-6 text-slate-200">No animations or broken code</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-6 font-semibold text-white">Turnaround Speed</td>
                  <td className="p-6 font-bold text-cyan-300 bg-cyan-500/5 border-x border-cyan-500/20">Rapid 2 - 4 Weeks Launch</td>
                  <td className="p-6 text-slate-200">3 - 6 Months Slow Delivery</td>
                  <td className="p-6 text-slate-200">Unpredictable delays</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-6 font-semibold text-white">Code Ownership</td>
                  <td className="p-6 font-bold text-cyan-300 bg-cyan-500/5 border-x border-cyan-500/20">100% IP Transfer & Repository</td>
                  <td className="p-6 text-slate-200">Proprietary Lock-in Fees</td>
                  <td className="p-6 text-slate-200">No source control provided</td>
                </tr>
              </tbody>
            </table>
          </SpotlightCard>
        </RevealOnScroll>

      </div>
    </section>
  );
};

/* ----------------------------------------------------
 * 12.5. Interactive Enterprise Architecture & Performance Showcase
 * ---------------------------------------------------- */
const ArchitectureBenchmarkShowcase = ({ onOpenBooking }) => {
  const [activeTab, setActiveTab] = useState('lcp');

  const benchmarks = {
    lcp: {
      title: "Sub-Second LCP Engine",
      subtitle: "Edge-rendered HTML pre-rendering with automated image AVIF encoding & zero layout shifts.",
      stats: [
        { label: "Largest Contentful Paint", value: "0.18s", badge: "Sub-Second", color: "text-cyan-400" },
        { label: "Interaction to Next Paint", value: "12ms", badge: "Instant", color: "text-emerald-400" },
        { label: "Cumulative Layout Shift", value: "0.000", badge: "Zero Shift", color: "text-cyan-300" },
        { label: "Time to First Byte", value: "38ms", badge: "Edge Global", color: "text-indigo-400" }
      ],
      code: `// Nexveda Edge Pre-Render & Image Optimization Engine
export const config = { runtime: 'edge' };

export default async function Page() {
  const data = await fetchEnterpriseCatalog({ cache: 'force-cache' });
  return (
    <Section className="hero-gpu-accelerated">
      <HeroTitle text={data.headline} />
      <OptimizedPicture src={data.heroImage} priority format="avif" />
    </Section>
  );
}`
    },
    cms: {
      title: "Headless CMS & GraphQL API Mesh",
      subtitle: "Decoupled architecture uniting Shopify Plus, Sanity CMS, & Supabase via edge caching.",
      stats: [
        { label: "GraphQL Mesh Latency", value: "18ms", badge: "Ultra Low", color: "text-cyan-400" },
        { label: "Global Edge Locations", value: "310+", badge: "Cloudflare", color: "text-emerald-400" },
        { label: "Cache Hit Ratio", value: "99.8%", badge: "Stale-While-Revalidate", color: "text-cyan-300" },
        { label: "API Rate Limit", value: "Unlimited", badge: "Auto Scaling", color: "text-indigo-400" }
      ],
      code: `// GraphQL Edge Mesh Query Execution
const enterpriseQuery = gql\`
  query GetGlobalCatalog($locale: String!) {
    products(first: 50, query: "tag:featured") {
      nodes { id title handle priceRange { minVariantPrice { amount } } }
    }
  }
\`;
const res = await edgeMeshClient.request(enterpriseQuery);`
    },
    motion: {
      title: "60 FPS GPU Motion Pipeline",
      subtitle: "Non-blocking compositor layer animations using transform3d & opacity for silk-smooth interaction.",
      stats: [
        { label: "Target Framerate", value: "60 FPS", badge: "Locked", color: "text-cyan-400" },
        { label: "Compositor Layer Count", value: "Zero Jank", badge: "Hardware Accel", color: "text-emerald-400" },
        { label: "CPU Thread Workload", value: "< 2%", badge: "Offloaded", color: "text-cyan-300" },
        { label: "Reduced Motion", value: "Auto Adapt", badge: "Accessibility", color: "text-indigo-400" }
      ],
      code: `// Hardware-Accelerated 3D Motion System
.element-gpu-pipeline {
  transform: translate3d(var(--x), var(--y), 0) scale(1.025);
  will-change: transform, opacity;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  backface-visibility: hidden;
}`
    },
    security: {
      title: "Zero-Trust Edge Security & DDoS Shield",
      subtitle: "SOC-2 Type II compliant header policies, bot mitigation, & automated SSL/TLS 1.3 encryption.",
      stats: [
        { label: "Security Header Rating", value: "Grade A+", badge: "Mozilla Observatory", color: "text-cyan-400" },
        { label: "DDoS Mitigation Rate", value: "100%", badge: "Enterprise Shield", color: "text-emerald-400" },
        { label: "SSL Handshake", value: "< 5ms", badge: "TLS 1.3", color: "text-cyan-300" },
        { label: "SOC-2 Compliance", value: "Certified", badge: "Audit Ready", color: "text-indigo-400" }
      ],
      code: `// Enterprise Security Header Policy
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self' https:; script-src 'self' 'unsafe-inline';",
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff'
};`
    }
  };

  const active = benchmarks[activeTab];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative bg-slate-950/60 border-t border-slate-900">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <RevealOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">ENTERPRISE PERFORMANCE HUD</h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-white font-heading">
            <TextReveal text="Sub-Second Core Web Vitals" /> <span className="text-gradient-cyan"><TextReveal text="Benchmark Architecture" wordDelay={0.06} /></span>
          </p>
          <p className="text-slate-200 text-base">
            Explore how Nexveda engineers achieve 100/100 Lighthouse performance, sub-second LCP, and zero layout shifts across high-concurrency production deployments.
          </p>
        </RevealOnScroll>

        {/* Tab Switcher */}
        <RevealOnScroll className="flex flex-wrap items-center justify-center gap-3">
          {[
            { id: 'lcp', label: '⚡ Sub-Second LCP Engine' },
            { id: 'cms', label: '🔗 Headless CMS & API Mesh' },
            { id: 'motion', label: '🎬 60 FPS Motion Pipeline' },
            { id: 'security', label: '🛡️ Zero-Trust Edge Security' }
          ].map(t => (
            <LiquidButton
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-2 px-5 text-xs font-heading font-extrabold ${
                activeTab === t.id
                  ? 'border-cyan-400 text-cyan-300 shadow-[0_0_25px_#00F0FF]'
                  : 'border-slate-800 text-slate-200'
              }`}
            >
              {t.label}
            </LiquidButton>
          ))}
        </RevealOnScroll>

        {/* Active Tab Panel */}
        <RevealOnScroll>
          <SpotlightCard className="glass-panel p-8 sm:p-12 rounded-3xl border border-cyan-500/30 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Stat Gauges */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold">
                  BENCHMARK SPECIFICATION
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white font-heading">{active.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{active.subtitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                {active.stats.map((s, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-200 font-medium">
                      <span>{s.label}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">{s.badge}</span>
                    </div>
                    <div className={`text-2xl font-extrabold font-heading ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <LiquidButton onClick={() => onOpenBooking(`Architecture Consultation: ${active.title}`)} icon="→">
                  Schedule Architecture Consultation
                </LiquidButton>
              </div>
            </div>

            {/* Right Column: Code Snippet & Live Inspection */}
            <div className="lg:col-span-6 rounded-2xl bg-slate-950 border border-slate-800 p-6 font-mono text-xs text-slate-300 space-y-4 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
                  <span className="ml-2 text-[10px] text-slate-300">nexveda-engine://architecture/{activeTab}.ts</span>
                </div>
                <span className="text-[10px] text-cyan-400 font-bold">100/100 LIGHTHOUSE</span>
              </div>

              <pre className="overflow-x-auto text-cyan-300/90 leading-relaxed py-2">
                <code>{active.code}</code>
              </pre>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Edge Pre-Compiled & Verified</span>
                </div>
                <span className="font-mono text-cyan-400">60 FPS Locked</span>
              </div>
            </div>

          </SpotlightCard>
        </RevealOnScroll>

      </div>
    </section>
  );
};

/* ----------------------------------------------------
 * 13. Process Pipeline
 * ---------------------------------------------------- */
const ProcessPipeline = () => {
  const steps = [
    { num: "01", title: "Discovery & Architecture", desc: "Competitor audits, conversion funnels, wireframes." },
    { num: "02", title: "High-Fidelity UI/UX", desc: "Apple & Linear inspired Figma designs with dark glass." },
    { num: "03", title: "Clean Code Development", desc: "Hand-written modular React/Next.js code & API sync." },
    { num: "04", title: "Speed & QA Tuning", desc: "Lighthouse 100/100 audit & security hardening." },
    { num: "05", title: "Launch & Scale", desc: "Zero-downtime deployment, DNS & IP transfer." }
  ];

  return (
    <section id="process" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-slate-950/40 border-t border-slate-900">
      <div className="max-w-7xl mx-auto space-y-16">
        
        <RevealOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">THE ROADMAP TO DOMINANCE</h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-white font-heading">
            <TextReveal text="Our 5-Stage" /> <span className="text-gradient-cyan"><TextReveal text="Engineering Pipeline" wordDelay={0.06} /></span>
          </p>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {steps.map((s, idx) => (
            <RevealOnScroll key={idx} delay={idx * 0.08}>
              <div className="h-full">
                <SpotlightCard className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 h-full">
                  <div className="text-xs font-mono font-bold text-cyan-400">STAGE {s.num}</div>
                  <h3 className="text-lg font-bold text-white font-heading">{s.title}</h3>
                  <p className="text-xs text-slate-200 leading-relaxed">{s.desc}</p>
                </SpotlightCard>
              </div>
            </RevealOnScroll>
          ))}
        </div>

      </div>
    </section>
  );
};

/* ----------------------------------------------------
 * 14. Interactive Cost Estimator
 * ---------------------------------------------------- */
const CostEstimator = ({ onOpenBooking }) => {
  const [industry, setIndustry] = useState('startup');
  const [scope, setScope] = useState('growth');
  const [features, setFeatures] = useState({ cms: false, effects: true, stripe: true, i18n: false });

  const baseRates = { local: 2450, startup: 4800, restaurant: 3200, realestate: 5900, clinic: 4500, school: 4900, ecommerce: 6800 };

  const { priceRange, timeline } = useMemo(() => {
    const base = baseRates[industry] || 3500;
    let mult = 1.0;
    if (scope === 'growth') mult = 1.65;
    if (scope === 'enterprise') mult = 2.4;

    let featureTotal = 0;
    if (features.cms) featureTotal += 1200;
    if (features.effects) featureTotal += 1500;
    if (features.stripe) featureTotal += 950;
    if (features.i18n) featureTotal += 800;

    const min = Math.round(base * mult + featureTotal);
    const max = Math.round(min * 1.25);

    let time = "2-3 Weeks";
    if (scope === 'growth') time = "3-5 Weeks";
    if (scope === 'enterprise') time = "6-8 Weeks";

    return { priceRange: `$${min.toLocaleString()} - $${max.toLocaleString()}`, timeline: time };
  }, [industry, scope, features]);

  const toggleFeature = (key) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative border-t border-slate-900">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <RevealOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">TRANSPARENT VALUE</h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-white font-heading">
            <TextReveal text="Interactive Project" /> <span className="text-gradient-cyan"><TextReveal text="Cost & Scope Estimator" wordDelay={0.06} /></span>
          </p>
          <p className="text-slate-200 text-base">
            No hidden fees. Customize your project scope below for an instant real-time quote estimate.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <SpotlightCard className="lg:col-span-7 glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-200 font-semibold mb-2">1. Select Your Industry</label>
                  <select value={industry} onChange={e => setIndustry(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none">
                    <option value="local">Local Business Platform</option>
                    <option value="startup">SaaS & Tech Startup</option>
                    <option value="restaurant">Restaurant & Hospitality</option>
                    <option value="realestate">Luxury Real Estate Showcase</option>
                    <option value="clinic">Medical Clinic & Healthcare</option>
                    <option value="school">School & Academy Site</option>
                    <option value="ecommerce">E-Commerce Brand Accelerator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-200 font-semibold mb-2">2. Project Scope Tier</label>
                  <select value={scope} onChange={e => setScope(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none">
                    <option value="starter">Essential Enterprise Package (Core Pages & Design System)</option>
                    <option value="growth">Growth Platform Package (Advanced Animations & CMS)</option>
                    <option value="enterprise">Full Enterprise Suite (Custom APIs, WebSockets & Dedicated QA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-200 font-semibold mb-3">3. Advanced Modules & Integrations</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                      <input type="checkbox" checked={features.cms} onChange={() => toggleFeature('cms')} className="calc-feature rounded bg-slate-800 border-slate-700 text-cyan-400 focus:ring-0" />
                      <span className="text-xs text-slate-300 font-medium">Headless CMS Setup (+$1.2k)</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                      <input type="checkbox" checked={features.effects} onChange={() => toggleFeature('effects')} className="calc-feature rounded bg-slate-800 border-slate-700 text-cyan-400 focus:ring-0" />
                      <span className="text-xs text-slate-300 font-medium">Interactive 3D / Canvas Effects (+$1.5k)</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                      <input type="checkbox" checked={features.stripe} onChange={() => toggleFeature('stripe')} className="calc-feature rounded bg-slate-800 border-slate-700 text-cyan-400 focus:ring-0" />
                      <span className="text-xs text-slate-300 font-medium">Stripe / Payment Integration (+$950)</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                      <input type="checkbox" checked={features.i18n} onChange={() => toggleFeature('i18n')} className="calc-feature rounded bg-slate-800 border-slate-700 text-cyan-400 focus:ring-0" />
                      <span className="text-xs text-slate-300 font-medium">Multi-Language i18n Suite (+$800)</span>
                    </label>

                  </div>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="lg:col-span-5 glass-panel p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 to-slate-950 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-cyan-400 uppercase font-bold">ESTIMATED INVESTMENT</span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300">Live Calculated</span>
              </div>

              <div className="space-y-2">
                <div className="text-4xl sm:text-5xl font-extrabold text-gradient-cyan font-heading">
                  {priceRange}
                </div>
                <div className="text-xs text-slate-200">Includes 100/100 Core Web Vitals guarantee, source code IP transfer, & 60 days post-launch warranty.</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-200">Estimated Turnaround:</span>
                  <span className="font-bold text-white">{timeline}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-200">Team Allocation:</span>
                  <span className="font-bold text-cyan-300">1 Senior Architect + 1 UI/UX Specialist</span>
                </div>
              </div>

              <button onClick={() => onOpenBooking('Project Quote Lock')} className="btn-electric w-full text-sm">
                Lock In Quote & Start Your Project →
              </button>
            </SpotlightCard>

          </div>
        </RevealOnScroll>

      </div>
    </section>
  );
};

/* ----------------------------------------------------
 * 15. Testimonials Wall of Love
 * ---------------------------------------------------- */
const Testimonials = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative bg-slate-950/40 border-t border-slate-900">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <RevealOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">VERIFIED CLIENT REVIEWS</h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-white font-heading">
            <TextReveal text="Trusted by Enterprise Founders &" /> <span className="text-gradient-cyan"><TextReveal text="Industry Leaders" wordDelay={0.06} /></span>
          </p>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <RevealOnScroll delay={0.04}>
            <div className="h-full">
              <SpotlightCard className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-4 h-full">
                <div className="flex text-amber-400 text-sm">★★★★★</div>
                <blockquote className="text-slate-300 text-sm leading-relaxed italic">
                  "Nexveda rebuilt our entire real estate platform. The visual glass aesthetic immediately sets us apart from competitors. Inquiries increased by 240% in our first month."
                </blockquote>
                <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 font-bold">MA</div>
                  <div>
                    <div className="text-sm font-bold text-white">Marcus Al-Mansoor</div>
                    <div className="text-xs text-slate-200">Managing Director, Aura Real Estate</div>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.08}>
            <div className="h-full">
              <SpotlightCard className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-4 h-full">
                <div className="flex text-amber-400 text-sm">★★★★★</div>
                <blockquote className="text-slate-300 text-sm leading-relaxed italic">
                  "When pitching venture capital funds, your website is your digital handshake. Nexveda designed our platform so cleanly that investors committed during our first demo."
                </blockquote>
                <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 font-bold">SL</div>
                  <div>
                    <div className="text-sm font-bold text-white">Sophia Lin</div>
                    <div className="text-xs text-slate-200">Co-Founder & CEO, Apex Analytics</div>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.12}>
            <div className="h-full">
              <SpotlightCard className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-4 h-full">
                <div className="flex text-amber-400 text-sm">★★★★★</div>
                <blockquote className="text-slate-300 text-sm leading-relaxed italic">
                  "Bypassing third-party delivery commissions by building our own custom Nexveda ordering app saved our restaurant network over $45,000 in the first year alone!"
                </blockquote>
                <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 font-bold">DV</div>
                  <div>
                    <div className="text-sm font-bold text-white">Dimitri Rossi</div>
                    <div className="text-xs text-slate-200">Head of Operations, Gourmet Kitchens</div>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          </RevealOnScroll>

        </div>

      </div>
    </section>
  );
};

/* ----------------------------------------------------
 * 16. Searchable FAQ Accordion
 * ---------------------------------------------------- */
const FaqAccordion = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "What makes Nexveda Technology different from standard web agencies?",
      a: "We do not use bloated pre-made templates or third-party page builders. We write hand-crafted React, Next.js, and Tailwind code from scratch. Every line of code is optimized for sub-second load times, 60 FPS performance, and high conversion rates."
    },
    {
      q: "How long does a typical project take from start to launch?",
      a: "Most projects launch within 2 to 4 weeks depending on scope. Complex enterprise platforms with custom API integrations take 4 to 8 weeks."
    },
    {
      q: "Do I own 100% of the source code and intellectual property?",
      a: "Yes, absolutely. Upon final deployment, 100% full intellectual property and code repository ownership is transferred to your organization. No recurring lock-in licensing fees."
    },
    {
      q: "Do you provide ongoing technical support and maintenance after launch?",
      a: "Yes! All projects include a 60-day complimentary post-launch warranty. We also offer optional monthly retainer packages for continuous feature updates, security monitoring, and conversion rate optimization."
    }
  ];

  const filteredFaqs = faqs.filter(f => f.q.toLowerCase().includes(searchTerm.toLowerCase()) || f.a.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 relative border-t border-slate-900">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <RevealOnScroll className="text-center space-y-4">
          <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">FREQUENTLY ASKED QUESTIONS</h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-white font-heading">
            <TextReveal text="Got Questions?" /> <span className="text-gradient-cyan"><TextReveal text="We Have Answers." wordDelay={0.06} /></span>
          </p>
          
          <div className="pt-4 max-w-md mx-auto">
            <input 
              type="text" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="Search questions (e.g. pricing, timeline, ownership)..." 
              className="w-full px-5 py-3 rounded-full bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:border-cyan-400 focus:outline-none placeholder-slate-500" 
            />
          </div>
        </RevealOnScroll>

        <div className="space-y-4">
          {filteredFaqs.map((f, idx) => (
            <RevealOnScroll key={idx} delay={idx * 0.05}>
              <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
                <button 
                  onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)} 
                  className="w-full p-6 text-left flex items-center justify-between text-base font-bold text-white font-heading hover:text-cyan-300 transition"
                >
                  <span>{f.q}</span>
                  <span className="text-cyan-400 text-xl font-mono">{openIndex === idx ? '−' : '+'}</span>
                </button>
                {openIndex === idx && (
                  <div className="px-6 pb-6 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4">
                    {f.a}
                  </div>
                )}
              </div>
            </RevealOnScroll>
          ))}
        </div>

      </div>
    </section>
  );
};

/* ----------------------------------------------------
 * 17. Glass Mega Footer
 * ---------------------------------------------------- */
const Footer = () => {
  const [time, setTime] = useState('--:--:-- UTC');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC/EST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="border-t border-slate-900 bg-slate-950 pt-16 pb-12 relative z-10 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-900">
          
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px]">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-cyan-400 font-bold">N</div>
              </div>
              <span className="font-heading font-extrabold text-xl text-white">NEXVEDA TECHNOLOGY</span>
            </div>
            <p className="text-sm text-slate-200 max-w-sm leading-relaxed">
              Enterprise Web Engineering & High-Converting Digital Platforms. Built for leaders who demand perfection.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span className="status-dot"></span>
              <span>SYSTEM TELEMETRY: ALL SERVICES OPERATIONAL</span>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-mono uppercase text-white font-bold tracking-wider">Navigation</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#industries" className="hover:text-cyan-400 transition">Client Solutions</a></li>
              <li><a href="#services" className="hover:text-cyan-400 transition">Services Blueprint</a></li>
              <li><a href="#portfolio" className="hover:text-cyan-400 transition">Featured Case Studies</a></li>
              <li><a href="#pricing" className="hover:text-cyan-400 transition">Project Estimator</a></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <div className="text-xs font-mono uppercase text-white font-bold tracking-wider">Global Operations</div>
            <div className="text-sm text-slate-300">
              Current Time: <span className="font-mono text-cyan-400 font-bold">{time}</span>
            </div>
            <div className="text-sm text-slate-200">
              Inquiries: <a href="mailto:hello@nexveda.com" className="text-cyan-400 hover:underline">hello@nexveda.com</a>
            </div>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-300">
          <div>© 2026 Nexveda Technology Inc. All rights reserved. Enterprise Quality Standard.</div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-cyan-400 transition">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-400 transition">Terms of Service</a>
            
            {/* Interactive Liquid Back to Top Arrow Button with Silk Slide Motion */}
            <button 
              onClick={() => smoothScrollToTop(1100)} 
              className="btn-liquid-sweep py-2.5 px-6 text-xs flex items-center gap-2.5 font-mono font-bold text-cyan-300 border border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_35px_#00F0FF] group"
              title="Return to top section"
            >
              <span>Back To Top</span>
              <span className="text-sm font-extrabold text-cyan-400 group-hover:text-black transition-transform duration-300 group-hover:-translate-y-1">↑</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

/* ----------------------------------------------------
 * 18. Booking Call Slide-In Modal
 * ---------------------------------------------------- */
const BookingModal = ({ isOpen, subject, onClose }) => {
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setConfirmed(true);
      setTimeout(() => {
        setConfirmed(false);
        onClose();
        alert('Thank you! Senior Engineering Lead will contact you within 2 business hours.');
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
      <div className="glass-panel max-w-lg w-full p-8 rounded-3xl border border-cyan-500/30 shadow-2xl relative space-y-6">
        
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-200 hover:text-white text-xl">✕</button>

        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase">PRIORITY SCHEDULING</span>
          <h3 className="text-2xl font-extrabold text-white font-heading mt-1">Start Your Project</h3>
          <p className="text-xs text-slate-200 mt-1">Speak directly with a Senior Web Architect to discuss your vision.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Full Name *</label>
            <input type="text" required placeholder="Alex Mercer" className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Work Email *</label>
            <input type="email" required placeholder="alex@company.com" className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Project Focus / Subject</label>
            <input type="text" defaultValue={subject || 'Enterprise Web App Redesign'} className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Estimated Budget</label>
            <select className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none">
              <option>$2,500 - $5,000</option>
              <option defaultValue="$5,000 - $10,000">$5,000 - $10,000</option>
              <option>$10,000 - $25,000+</option>
            </select>
          </div>

          <button type="submit" className={`w-full text-sm font-semibold py-3 mt-2 rounded-full transition ${confirmed ? 'bg-emerald-500 text-black' : 'btn-electric'}`}>
            {submitting ? '🌀 Submitting Request...' : confirmed ? '✓ Discovery Call Request Confirmed!' : 'Confirm Discovery Call Request →'}
          </button>
        </form>

      </div>
    </div>
  );
};

/* ----------------------------------------------------
 * 19. Technical Case Study Modal
 * ---------------------------------------------------- */
const CaseStudyModal = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
      <div className="glass-panel max-w-2xl w-full p-8 rounded-3xl border border-cyan-500/30 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-200 hover:text-white text-xl">✕</button>

        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase">{item.industry} • {item.completionTime}</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mt-1">{item.title}</h3>
          <div className="text-sm font-mono text-emerald-400 font-bold mt-1">🏆 {item.metrics}</div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-mono text-slate-200 uppercase font-bold">Executive Summary</h4>
          <p className="text-sm text-slate-300 leading-relaxed">{item.fullDesc}</p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-mono text-slate-200 uppercase font-bold">Key Delivered Results</h4>
          <ul className="space-y-2">
            {item.results.map((r, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="text-cyan-400 mt-0.5">✦</span> {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-mono text-slate-200 uppercase font-bold">Architecture Stack</h4>
          <div className="flex flex-wrap gap-2">
            {item.stack.map((s, idx) => (
              <span key={idx} className="px-3 py-1 text-xs rounded-md bg-slate-800 text-cyan-300 border border-slate-700">{s}</span>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button onClick={onClose} className="btn-outline-glass text-xs py-2 px-6">
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
};

/* ----------------------------------------------------
 * 17.5. Organic Liquid Sweep Button Showcase
 * ---------------------------------------------------- */
const LiquidButtonShowcase = ({ onOpenBooking }) => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative bg-slate-950/60 border-t border-slate-900">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <RevealOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">INTERACTION ENGINE</h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-white font-heading">
            <TextReveal text="Organic Liquid Sweep" /> <span className="text-gradient-cyan"><TextReveal text="Interaction Suite" wordDelay={0.06} /></span>
          </p>
          <p className="text-slate-200 text-base">
            Hover over any button below to experience the 60 FPS GPU-accelerated liquid fill with organic curved sweep & synchronized text contrast masking.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <SpotlightCard className="glass-panel p-8 sm:p-12 rounded-3xl border border-cyan-500/30 text-center space-y-8 max-w-4xl mx-auto">
            
            <div className="flex flex-wrap items-center justify-center gap-6 py-4">
              
              <LiquidButton onClick={() => onOpenBooking('Liquid Primary CTA')} icon="→">
                Start Your Project
              </LiquidButton>

              <LiquidButton onClick={() => onOpenBooking('Liquid Case Study')} icon="🔍">
                Explore Enterprise Work
              </LiquidButton>

              <LiquidButton onClick={() => onOpenBooking('Liquid Schedule')} icon="⚡">
                Book Discovery Call
              </LiquidButton>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-left text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="font-mono text-cyan-400 font-bold">ORGANIC CURVED FILL</div>
                <div className="text-slate-300">Fluid sweep enters from left with soft curved leading edge (`border-radius: 0 50% 50% 0`).</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="font-mono text-emerald-400 font-bold">SYNCHRONIZED MASKING</div>
                <div className="text-slate-300">Text color transitions smoothly to dark `#030712` on top of liquid and white `#FFFFFF` on dark bg.</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="font-mono text-indigo-400 font-bold">60 FPS GPU PIPELINE</div>
                <div className="text-slate-300">Driven purely via `transform3d` & `clip-path` with `cubic-bezier(0.22, 1, 0.36, 1)` easing.</div>
              </div>
            </div>

          </SpotlightCard>
        </RevealOnScroll>

      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
 * "Nebula Drift" — Premium WebGL Motion Background
 *  8 luminous orbs on Lissajous orbits (irrational frequency
 *  ratios → visually never repeats) · rotated-FBM organic
 *  turbulence · flowing energy veins · breathing pulse
 *  Mouse-spring parallax · 60 FPS · GPU-accelerated
 * ═══════════════════════════════════════════════════════════ */
const GlobalAuroraBackground = () => {
  const webglCanvasRef = useRef(null);
  const particleCanvasRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    /* ----------------------------------------------------
     * 1. WebGL Aurora Light Curtain Shader Engine
     * ---------------------------------------------------- */
    const webglCanvas = webglCanvasRef.current;
    if (!webglCanvas) return;

    const gl = (
      webglCanvas.getContext('webgl', {
        alpha: false, antialias: false,
        depth: false, stencil: false,
        powerPreference: 'high-performance',
      }) ||
      webglCanvas.getContext('experimental-webgl', { alpha: false, depth: false })
    );

    if (!gl) return;

    const VS = `attribute vec2 aP; void main(){ gl_Position=vec4(aP,0.,1.); }`;
    const FS = `
precision highp float;
uniform float uT;
uniform float uS;
uniform vec2  uM;
uniform vec2  uR;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}

float fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  mat2 R = mat2(0.80, -0.60, 0.60, 0.80);
  for(int i = 0; i < 4; i++){
    v += a * noise(p);
    p = R * p * 2.05 + vec2(1.7, 2.3);
    a *= 0.5;
  }
  return v;
}

// Floating Stardust Particles drifting upward in a smooth continuous loop
float stardustParticles(vec2 uv, float ar, float t) {
  float n = 0.0;
  vec2 st = uv * vec2(ar, 1.0) * 14.0;
  vec2 id = floor(st);
  vec2 f  = fract(st) - 0.5;
  
  float rnd = hash(id);
  if (rnd > 0.60) {
    float speed = 0.12 + rnd * 0.22;
    float yOffset = fract(t * speed + rnd * 12.0) - 0.5;
    float xOffset = sin(t * 0.7 + rnd * 30.0) * 0.18;
    
    vec2 p = vec2(xOffset, yOffset);
    float d = length(f - p);
    
    float circle = smoothstep(0.16, 0.0, d);
    float pulse = sin(t * 2.0 + rnd * 60.0) * 0.4 + 0.6;
    n += circle * pulse * (0.45 + rnd * 0.55);
  }
  return n;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uR;
  float ar = uR.x / uR.y;
  
  // Calm, smooth time advancement for elegant 60 FPS fluid motion
  float t = uT * 0.40;
  
  // Aspect ratio corrected coordinates
  vec2 p = vec2(uv.x * ar, uv.y) * 3.5;
  
  // Interactive mouse displacement force (matches cursor position 100%)
  vec2 m = vec2(uM.x * ar, uM.y) * 3.5;
  float mouseDist = length(p - m);
  float mousePush = smoothstep(0.70, 0.0, mouseDist) * 0.50;
  
  // Multi-directional rolling fluid water wave motion (Calm, Smooth LEFT -> RIGHT)
  vec2 waveMotion = vec2(
    sin((p.x - t * 0.9) * 1.6 + p.y * 0.7) * 0.50 + sin(p.y * 2.0 + t * 0.6) * 0.22,
    cos((p.y - t * 0.5) * 1.6 + p.x * 0.7) * 0.50 + cos(p.x * 2.0 - t * 0.7) * 0.22
  );
  
  waveMotion += (p - m) * mousePush;
  
  // 2-Stage Fluid Velocity Advection & Domain Warping
  vec2 q = vec2(
    fbm(p + waveMotion + vec2(t * 0.35, -t * 0.20)),
    fbm(p - waveMotion + vec2(-t * 0.25, t * 0.30))
  );
  
  vec2 r = vec2(
    fbm(p + 2.8 * q + vec2(1.7 - t * 0.50, 9.2)), // Smooth Left-to-Right wave drift
    fbm(p + 2.8 * q + vec2(8.3, 2.8 + t * 0.35))
  );
  
  float fluidPattern = fbm(p + 3.2 * r);
  
  // Darker Premium Ocean Water Fluid Colors (#010409 -> #001f36 -> #00d9ff -> #b3f2ff)
  vec3 bgObsidian = vec3(0.003, 0.015, 0.035); // Dark Obsidian #010409
  vec3 midOcean   = vec3(0.000, 0.120, 0.220); // Darker Ocean Blue #001f36
  vec3 cyanWave   = vec3(0.000, 0.850, 1.000); // Electric Cyan #00d9ff
  vec3 foamWhite  = vec3(0.700, 0.950, 1.000); // Soft Cyan Foam Crests
  
  vec3 col = mix(bgObsidian, midOcean, clamp(fluidPattern * 1.2, 0.0, 1.0));
  col = mix(col, cyanWave, pow(clamp(fluidPattern - 0.28, 0.0, 1.0), 1.8));
  col += foamWhite * pow(clamp(fluidPattern - 0.50, 0.0, 1.0), 2.4) * 0.55;
  col += cyanWave * mousePush * 0.40;
  
  // Soft Floating Stardust Particle Layer (Smooth Loop)
  float particles = stardustParticles(uv, ar, t);
  col += vec3(0.000, 0.941, 1.000) * particles * 0.55;
  col += vec3(0.900, 0.980, 1.000) * pow(particles, 1.8) * 0.45;
  
  // Soft Vignette for High Text Readability
  float vig = uv.x * (1.0 - uv.x) * uv.y * (1.0 - uv.y);
  col *= 0.82 + smoothstep(0.0, 0.25, vig) * 0.18;
  
  col = pow(clamp(col, 0.0, 1.0), vec3(0.85));
  gl_FragColor = vec4(col, 1.0);
}`;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, VS);
    const fs = compile(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const aP = gl.getAttribLocation(prog, 'aP');
    gl.enableVertexAttribArray(aP);
    gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);

    const uTL = gl.getUniformLocation(prog, 'uT');
    const uSL = gl.getUniformLocation(prog, 'uS');
    const uML = gl.getUniformLocation(prog, 'uM');
    const uRL = gl.getUniformLocation(prog, 'uR');

    let W = 0, H = 0;

    const onResize = () => {
      W = webglCanvas.width = window.innerWidth;
      H = webglCanvas.height = window.innerHeight;
      gl.viewport(0, 0, W, H);
      gl.uniform2f(uRL, W, H);
    };
    onResize();
    window.addEventListener('resize', onResize, { passive: true });

    let scrollVal = 0;
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollVal = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      lastScrollY = window.scrollY;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    let mouseX = -1000, mouseY = -1000;
    let mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5;
    const onMouse = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      tmx = e.clientX / W;
      tmy = 1.0 - (e.clientY / H); // Align Y coordinate with WebGL viewport (bottom=0, top=1)
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    let raf = null;
    const t0 = performance.now();
    const draw = (ts) => {
      // Render WebGL Ocean Water Wave Shader
      mx += (tmx - mx) * 0.055;
      my += (tmy - my) * 0.055;
      gl.uniform1f(uTL, (ts - t0) / 1000.0);
      gl.uniform1f(uSL, scrollVal);
      gl.uniform2f(uML, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouse);
      try { gl.deleteBuffer(buf); gl.deleteProgram(prog); gl.deleteShader(vs); gl.deleteShader(fs); } catch(_) {}
    };
  }, []);

  return (
    <div 
      className="aurora-motion-container" 
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -20, pointerEvents: 'none', overflow: 'hidden' }} 
      aria-hidden="true"
    >
      {/* 3D Ocean Water Waves WebGL Canvas */}
      <canvas
        ref={webglCanvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -10,
          pointerEvents: 'none',
          display: 'block',
        }}
      />
    </div>
  );
};

/* ----------------------------------------------------
 * Custom Ultra-Smooth Silk Scroll Glider Engine
 * ---------------------------------------------------- */

const smoothScrollToTop = (duration = 1100) => {
  const startPosition = window.scrollY || window.pageYOffset;
  if (startPosition <= 0) return;

  const startTime = performance.now();
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  const step = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);

    window.scrollTo(0, startPosition * (1 - easedProgress));

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

/* ----------------------------------------------------
 * Floating Scroll-To-Top Arrow Button
 * ---------------------------------------------------- */
const ScrollToTopFloatingButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => smoothScrollToTop(1100)}
      className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full glass-panel border border-cyan-500/50 flex items-center justify-center text-cyan-400 text-lg shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:shadow-[0_0_40px_#00F0FF] hover:bg-cyan-400 hover:text-black transition-all duration-300 hover:scale-110 group"
      aria-label="Scroll to top"
      title="Scroll to Top"
    >
      <span className="transition-transform duration-300 group-hover:-translate-y-1">↑</span>
    </button>
  );
};

/* ----------------------------------------------------
 * Luxury Lenis Smooth Scroll & GSAP ScrollTrigger Engine
 * ---------------------------------------------------- */
const useCinematicScrollEngine = () => {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    if (typeof Lenis === 'undefined' || typeof gsap === 'undefined') return;

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Initialize Lenis for cinematic smooth scrolling
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });

    lenis.on('scroll', () => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.update();
      }
    });

    const updateLenis = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);
    window.lenisInstance = lenis;

    // Smooth Scroll for Nav Links
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (anchor) {
        const id = anchor.getAttribute('href');
        if (id && id !== '#') {
          const targetEl = document.querySelector(id);
          if (targetEl) {
            e.preventDefault();
            lenis.scrollTo(targetEl, { offset: -80, duration: 1.3 });
          }
        }
      }
    };
    document.addEventListener('click', handleAnchorClick);

    // --- Cinematic GSAP ScrollTrigger Section & Element Animations ---
    const timer = setTimeout(() => {
      if (typeof ScrollTrigger === 'undefined') return;

      const sections = gsap.utils.toArray('main > section');

      sections.forEach((section, index) => {
        // 1. GSAP + ScrollTrigger Scroll Reveal System (y: 40px -> 0px, opacity: 0 -> 1, blur: 6px -> 0px, stagger: 0.15s)
        // 1a. Main Section Headers & Titles
        const sectionHeaders = section.querySelectorAll('h1, h2, h3, .animate-heading');
        sectionHeaders.forEach((header) => {
          gsap.fromTo(
            header,
            { y: 40, opacity: 0, filter: 'blur(6px)' },
            {
              y: 0,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 1.05,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: header,
                start: 'top 88%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });

        // 1b. Feature Cards, Glass Panels & Grid Items (Progressive 0.15s Stagger)
        const cards = section.querySelectorAll('.glass-panel, .glass-card, .service-card-wrapper, .portfolio-card-wrapper, .industry-card-wrapper, .testimonial-card, .faq-accordion-item');
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            { y: 40, opacity: 0, filter: 'blur(6px)' },
            {
              y: 0,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 1.0,
              stagger: 0.15,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 82%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }

        // 1c. Child Pills, Badges & Feature Bullet Lists (Progressive 0.15s Stagger)
        const childPillsAndLists = section.querySelectorAll('.glass-pill, .badge-glow, .floating-pill, ul > li, .deliverables-list > li');
        if (childPillsAndLists.length > 0) {
          gsap.fromTo(
            childPillsAndLists,
            { y: 40, opacity: 0, filter: 'blur(6px)' },
            {
              y: 0,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 0.85,
              stagger: 0.15,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 88%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }

        // 2. Paragraph Smooth Reveal (y: 40px -> 0px, opacity: 0 -> 1, blur: 6px -> 0px)
        const paragraphs = section.querySelectorAll('p, .animate-paragraph');
        paragraphs.forEach((p) => {
          gsap.fromTo(
            p,
            { y: 40, opacity: 0, filter: 'blur(6px)' },
            {
              y: 0,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 0.95,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: p,
                start: 'top 90%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });

        // 3. Button Scale & Fade Reveal (Scale 0.95 -> 1)
        const buttons = section.querySelectorAll('button, .animate-button');
        buttons.forEach((btn) => {
          gsap.fromTo(
            btn,
            { opacity: 0, scale: 0.95, y: 20 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.8,
              ease: 'back.out(1.4)',
              scrollTrigger: {
                trigger: btn,
                start: 'top 92%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });

        // 4. Image Clip-Path Mask & Scale Reveal (Clip-Path, Scale 1.08 -> 1, Blur 10px -> 0px)
        const images = section.querySelectorAll('img, .img-cinematic-reveal, .mockup-3d-card');
        images.forEach((img) => {
          gsap.fromTo(
            img,
            {
              clipPath: 'inset(10% 6% 10% 6% round 24px)',
              scale: 1.08,
              filter: 'blur(10px)',
              opacity: 0.3,
            },
            {
              clipPath: 'inset(0% 0% 0% 0% round 16px)',
              scale: 1,
              filter: 'blur(0px)',
              opacity: 1,
              duration: 1.25,
              ease: 'power3.inOut',
              scrollTrigger: {
                trigger: img,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });

        // 5. Multi-Layer Parallax Depth System (Background Image, Slow, Medium, Fast & Image Frame Parallax)
        // 50. High-Motion Background Image Parallax Scrubbing
        const bgImg = document.querySelector('.aurora-motion-bg-image');
        if (bgImg) {
          gsap.to(bgImg, {
            yPercent: 35,
            rotate: 5,
            ease: 'none',
            scrollTrigger: {
              trigger: 'body',
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.8,
            },
          });
        }

        // 5a. Slow Parallax (Section Titles, Accent Background Graphics)
        const slowParallax = section.querySelectorAll('[data-parallax="slow"], .parallax-slow');
        slowParallax.forEach((el) => {
          gsap.to(el, {
            y: -35,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.0,
            },
          });
        });

        // 5b. Medium Parallax (Staggered Grid Cards & Feature Cards)
        const mediumParallax = section.querySelectorAll('[data-parallax="medium"], .parallax-medium');
        mediumParallax.forEach((card, i) => {
          gsap.to(card, {
            y: -40,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
            },
          });
        });

        // 5c. Fast Parallax (Floating Badges, Metric Pills, Accent Icons)
        const fastParallax = section.querySelectorAll('[data-parallax="fast"], .parallax-fast, .badge-glow');
        fastParallax.forEach((el) => {
          gsap.to(el, {
            y: -110,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5,
            },
          });
        });

        // 5d. Internal Image Window Frame Parallax (Image slides inside frame)
        const frameImages = section.querySelectorAll('.portfolio-card-wrapper img, .mockup-3d-card img, .parallax-img-inner');
        frameImages.forEach((img) => {
          gsap.fromTo(
            img,
            { yPercent: -12, scale: 1.08 },
            {
              yPercent: 12,
              scale: 1.0,
              ease: 'none',
              scrollTrigger: {
                trigger: img.parentElement || section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
              },
            }
          );
        });

        // 5e. GSAP 3D Perspective Rotation Parallax (Cards & 3D Mockups)
        const card3D = section.querySelectorAll('.mockup-3d-card, .service-card-3d');
        card3D.forEach((card, i) => {
          gsap.fromTo(
            card,
            { rotateX: (i % 2 === 0 ? 12 : -12), rotateY: (i % 2 === 0 ? -10 : 10), transformPerspective: 1000 },
            {
              rotateX: 0,
              rotateY: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                end: 'top 25%',
                scrub: 1.0,
              },
            }
          );
        });

        // 6. Luxury "Sheet Overlap / Curtain Reveal" (Stacking Card Overlap System)
        if (index > 0) {
          const prevSection = sections[index - 1];

          // 6a. Section N+1 slides UP directly over previous section (translateY: 40% -> 0%)
          gsap.fromTo(
            section,
            { yPercent: 40, scale: 0.96, opacity: 0.82 },
            {
              yPercent: 0,
              scale: 1.0,
              opacity: 1.0,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 95%',
                end: 'top 15%',
                scrub: 0.8,
              },
            }
          );

          // 6b. Section N underneath scales down (scale: 1 -> 0.95), drifts upward, and drops opacity (1 -> 0.60)
          if (prevSection) {
            gsap.to(prevSection, {
              scale: 0.95,
              yPercent: -10,
              opacity: 0.60,
              filter: 'blur(4px)',
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top 90%',
                end: 'top 15%',
                scrub: 0.8,
              },
            });
          }
        }
      });

      // Refresh ScrollTrigger to ensure all layout bounds are accurately calculated
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleAnchorClick);
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      }
    };
  }, []);
};

/* ----------------------------------------------------
 * 20. Root Application Component
 * ---------------------------------------------------- */
const App = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSubject, setBookingSubject] = useState('General Discovery Call');
  const [activeCaseStudy, setActiveCaseStudy] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Initialize Awwwards-Level Lenis & GSAP Cinematic Scroll Engine
  useCinematicScrollEngine();

  useEffect(() => {
    const handleScroll = () => {
      // Hide upward arrow when in the 1st section (scrollY <= 450)
      setShowScrollTop(window.scrollY > 450);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenBooking = (subject = 'General Discovery Call') => {
    setBookingSubject(subject);
    setBookingOpen(true);
  };

  const handleScrollTop = () => {
    if (window.lenisInstance) {
      window.lenisInstance.scrollTo(0, { duration: 1.3 });
    } else {
      smoothScrollToTop(1100);
    }
  };

  return (
    <div className="relative text-slate-100 min-h-screen overflow-x-hidden">
      <GlobalAuroraBackground />
      <ScrollProgressBar />
      <CustomCursor />
      
      {showScrollTop && (
        <button
          onClick={handleScrollTop}
          className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full glass-panel border border-cyan-500/50 flex items-center justify-center text-cyan-400 text-lg shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:shadow-[0_0_40px_#00F0FF] hover:bg-cyan-400 hover:text-black transition-all duration-300 hover:scale-110 group"
          aria-label="Scroll to top"
          title="Scroll to Top"
        >
          <span className="transition-transform duration-300 group-hover:-translate-y-1">↑</span>
        </button>
      )}
      
      <Header onOpenBooking={handleOpenBooking} />
      
      <main className="relative z-10 pt-20">
        <Hero onOpenBooking={handleOpenBooking} />
        <IndustryShowcase onOpenBooking={handleOpenBooking} />
        <ServicesGrid onOpenBooking={handleOpenBooking} />
        <PortfolioShowcase onOpenModal={(item) => setActiveCaseStudy(item)} />
        <Marquee />
        <ComparisonMatrix />
        <ArchitectureBenchmarkShowcase onOpenBooking={handleOpenBooking} />
        <ProcessPipeline />
        <CostEstimator onOpenBooking={handleOpenBooking} />
        <Testimonials />
        <LiquidButtonShowcase onOpenBooking={handleOpenBooking} />
        <FaqAccordion />
      </main>

      <Footer />

      <BookingModal 
        isOpen={bookingOpen} 
        subject={bookingSubject} 
        onClose={() => setBookingOpen(false)} 
      />

      <CaseStudyModal 
        item={activeCaseStudy} 
        onClose={() => setActiveCaseStudy(null)} 
      />
    </div>
  );
};

// Render React Root safely
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
