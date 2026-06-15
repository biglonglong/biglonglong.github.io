import { frameThrottle } from './utils.js';

const ring = document.querySelector('.orbit-ring');
if (ring) {
    const wrap = ring.closest('.orbit-wrap');
    const avatar = wrap.querySelector('.planet-face img');
    const satellites = Array.from(ring.querySelectorAll('.orbit-satellite'));
    const eccentricity = 0.08;
    const tilt = 0.92;
    const rotation = -20 * Math.PI / 180;
    const orbits = [
        { radius: 195, period: 14000 },
        { radius: 250, period: 20000 },
        { radius: 305, period: 28000 },
        { radius: 220, period: 10000 },
    ];
    const config = [
        { orbit: orbits[0], size: 40 },
        { orbit: orbits[1], size: 46 },
        { orbit: orbits[1], size: 44 },
        { orbit: orbits[2], size: 52 },
        { orbit: orbits[2], size: 48 },
        { orbit: orbits[3], size: 50 },
    ];
    const maxSize = 680;
    const rawSize = Math.max(...config.map(({ orbit, size }) => orbit.radius * (1 + eccentricity) + size / 2)) * 2 + 20;
    const initial = [90, 0, 180, 45, 225, 270];
    const angles = satellites.map((_, i) => (initial[i] ?? i * 360 / satellites.length) * Math.PI / 180);
    const canvas = document.createElement('canvas');
    canvas.className = 'orbit-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    ring.append(canvas);
    const ctx = canvas.getContext('2d');
    let scale = 1;
    let raf;
    let lastTime;
    let speed = 1;
    let targetSpeed = 1;
    let onScreen = true;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');

    function orbitPoint(orbit, meanAngle) {
        // M = E - e sin(E): 等时间推进平近点角，椭圆近心段自然更快。
        let eccentricAngle = meanAngle;
        for (let i = 0; i < 3; i++) {
            eccentricAngle -= (eccentricAngle - eccentricity * Math.sin(eccentricAngle) - meanAngle)
                / (1 - eccentricity * Math.cos(eccentricAngle));
        }
        const x = orbit.radius * (Math.cos(eccentricAngle) - eccentricity);
        const y = orbit.radius * Math.sqrt(1 - eccentricity ** 2) * Math.sin(eccentricAngle) * tilt;
        return {
            x: x * Math.cos(rotation) - y * Math.sin(rotation),
            y: x * Math.sin(rotation) + y * Math.cos(rotation),
        };
    }

    function position() {
        satellites.forEach((sat, i) => {
            const { x, y } = orbitPoint((config[i] || config[0]).orbit, angles[i]);
            sat.style.transform = `translate(${x * scale}px, ${y * scale}px)`;
        });
    }

    function draw() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = document.body.classList.contains('dark') ? 'rgba(150,165,200,0.10)' : 'rgba(120,130,180,0.08)';
        ctx.setLineDash([4, 8]);
        for (const { radius } of orbits) {
            ctx.beginPath();
            ctx.ellipse(
                canvas.width / 2 - radius * eccentricity * Math.cos(rotation) * scale,
                canvas.height / 2 - radius * eccentricity * Math.sin(rotation) * scale,
                radius * scale,
                radius * Math.sqrt(1 - eccentricity ** 2) * tilt * scale,
                rotation, 0, Math.PI * 2,
            );
            ctx.stroke();
        }
    }

    function resize() {
        const size = Math.round(Math.min(rawSize, wrap.parentElement.clientWidth, document.documentElement.clientWidth * 0.9, maxSize));
        scale = size / rawSize;
        wrap.style.width = wrap.style.height = `${size}px`;
        if (avatar) {
            const avatarSize = `${Number(avatar.getAttribute('width') || 275) * size / maxSize}px`;
            avatar.style.width = avatarSize;
            avatar.style.height = avatarSize;
        }
        canvas.width = canvas.height = size;
        satellites.forEach((sat, i) => {
            const size = (config[i] || config[0]).size * scale;
            sat.style.width = sat.style.height = `${size}px`;
            sat.style.top = sat.style.left = `calc(50% - ${size / 2}px)`;
            const svg = sat.querySelector('svg');
            if (svg) svg.style.width = svg.style.height = `${Math.round(size * 0.45)}px`;
        });
        position();
        draw();
    }

    function tick(time) {
        const delta = lastTime === undefined ? 0 : Math.min(time - lastTime, 100);
        lastTime = time;
        speed += (targetSpeed - speed) * 0.08;
        satellites.forEach((_, i) => {
            angles[i] = (angles[i] + delta * speed / (config[i] || config[0]).orbit.period * Math.PI * 2) % (Math.PI * 2);
        });
        position();
        raf = requestAnimationFrame(tick);
    }

    function resume() {
        cancelAnimationFrame(raf);
        lastTime = undefined;
        if (!document.hidden && !motion.matches && onScreen) raf = requestAnimationFrame(tick);
    }
    satellites.forEach(sat => {
        const title = sat.getAttribute('title');
        if (title) { sat.dataset.tip = title; sat.setAttribute('aria-label', title); sat.removeAttribute('title'); }
    });
    wrap.addEventListener('mouseenter', () => { targetSpeed = 0.15; });
    wrap.addEventListener('mouseleave', () => { targetSpeed = 1; });
    window.addEventListener('resize', frameThrottle(resize));
    document.addEventListener('visibilitychange', resume);
    motion.addEventListener('change', resume);
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting;
            resume();
        }, { rootMargin: '100px' }).observe(wrap);
    }
    new MutationObserver(draw).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    resize();
    resume();
}
