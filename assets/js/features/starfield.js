(function () {
    // 等 DOM 完成后再插入 canvas，避免干扰 Hugo 模板
    document.addEventListener('DOMContentLoaded', function () {
        const profile = document.querySelector('.profile');
        if (!profile) return;

        const canvas = document.createElement('canvas');
        canvas.id = 'starfield-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        document.body.prepend(canvas);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const motion = matchMedia('(prefers-reduced-motion: reduce)');
        const isDark = () => document.body.classList.contains('dark');
        let stars = [], raf;
        let meteors = [];
        let nextMeteorAt = performance.now() + 7000 + Math.random() * 7000;
        // themeBlend: 0=浅色, 1=深色，每帧向目标渐进 6%
        let themeBlend = isDark() ? 1 : 0;

        function lerp(a, b, t) { return a + (b - a) * t; }

        // 同一帧的大星共用一张光晕图，主题颜色变化时才重新绘制。
        let glowBitmap;
        let glowColor;
        function getGlow(cr, cg, cb) {
            const color = `${cr},${cg},${cb}`;
            if (glowColor === color) return glowBitmap;
            const size = 12;
            const bitmap = typeof OffscreenCanvas === 'function'
                ? new OffscreenCanvas(size, size)
                : document.createElement('canvas');
            bitmap.width = bitmap.height = size;
            const glowContext = bitmap.getContext('2d');
            if (!glowContext) return null;
            const center = size / 2;
            const grd = glowContext.createRadialGradient(center, center, 0, center, center, 5);
            grd.addColorStop(0, `rgba(${cr},${cg},${cb},0.5)`);
            grd.addColorStop(1, 'transparent');
            glowContext.fillStyle = grd;
            glowContext.fillRect(0, 0, size, size);
            glowColor = color;
            glowBitmap = bitmap;
            return bitmap;
        }

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function makeStars(n) {
            stars = Array.from({ length: n }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.3 + 0.2,
                alpha: Math.random() * 0.7 + 0.2,
                da: (Math.random() * 0.007 + 0.002) * (Math.random() < 0.5 ? 1 : -1),
                vy: -(Math.random() * 0.08 + 0.02),
            }));
        }

        // 参考常见星图的主要轮廓：金牛座的 V 形头部与双角，双鱼座的两端与连线。
        const taurus = [
            [[7, 12], [40, 53], [68, 81], [87, 94], [109, 70], [140, 51], [164, 9]],
            [[40, 53], [54, 43]],
            [[109, 70], [125, 54]],
        ];
        const pisces = [
            [[8, 37], [19, 18], [38, 13], [55, 27], [48, 47], [28, 52], [8, 37]],
            [[55, 27], [78, 48], [97, 78], [119, 82], [137, 63]],
            [[137, 63], [141, 44], [157, 31], [174, 44], [171, 61], [154, 70], [137, 63]],
        ];
        const mainStars = [
            { figure: 0, point: taurus[0][0] },
            { figure: 0, point: taurus[0][4] },
            { figure: 0, point: taurus[0][6] },
            { figure: 1, point: pisces[0][2] },
            { figure: 1, point: pisces[1][2] },
            { figure: 1, point: pisces[2][2] },
        ];
        let glint;
        let nextGlintAt = performance.now() + 4500 + Math.random() * 4500;
        let signal;

        function drawSignal(timestamp, figures, size, cr, cg, cb) {
            if (motion.matches) return;
            if (!signal) return;

            const progress = Math.min(1, (timestamp - signal.start) / 2600);
            const locate = star => ({
                x: figures[star.figure].x + star.point[0] * size,
                y: figures[star.figure].y + star.point[1] * size,
            });
            const from = locate(signal.from);
            const to = locate(signal.to);
            const point = t => {
                const bend = 24 * size * Math.sin(Math.PI * t);
                return { x: lerp(from.x, to.x, t) - bend, y: lerp(from.y, to.y, t) };
            };
            const travel = Math.max(0, Math.min(1, (progress - 0.12) / 0.76));
            const eased = travel * travel * (3 - 2 * travel);
            const head = point(eased);
            const strength = lerp(0.32, 0.6, themeBlend);

            ctx.save();
            ctx.strokeStyle = ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
            ctx.lineWidth = 1;
            ctx.lineCap = 'round';
            for (let i = 10; i > 0; i--) {
                const tail = point(Math.max(0, eased - i * 0.008));
                const next = point(Math.max(0, eased - (i - 1) * 0.008));
                ctx.globalAlpha = strength * (1 - i / 11) * Math.sin(Math.PI * progress);
                ctx.beginPath();
                ctx.moveTo(tail.x, tail.y);
                ctx.lineTo(next.x, next.y);
                ctx.stroke();
            }
            ctx.globalAlpha = strength * Math.sin(Math.PI * progress);
            ctx.beginPath();
            ctx.arc(head.x, head.y, 2.4 * size, 0, Math.PI * 2);
            ctx.fill();
            const arrival = Math.max(0, 1 - Math.abs(progress - 0.9) / 0.1);
            ctx.globalAlpha = arrival * strength;
            ctx.beginPath();
            ctx.arc(to.x, to.y, 5 * size, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(to.x, to.y, 2.4 * size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            if (progress >= 1) signal = undefined;
        }

        function drawConstellations(timestamp, cr, cg, cb) {
            if (!motion.matches && timestamp >= nextGlintAt) {
                const from = mainStars[Math.floor(Math.random() * mainStars.length)];
                const receivers = mainStars.filter(star => star.figure !== from.figure);
                const to = receivers[Math.floor(Math.random() * receivers.length)];
                glint = { ...from, start: timestamp };
                signal = { from, to, start: timestamp };
                nextGlintAt = timestamp + 4500 + Math.random() * 4500;
            }
            const progress = glint ? (timestamp - glint.start) / 1800 : 1;
            if (progress >= 1 || motion.matches) glint = undefined;

            const size = Math.min(1, canvas.width / 680, canvas.height / 600);
            const figures = [
                { paths: taurus, x: canvas.width - 400 * size, y: 145 * size },
                { paths: pisces, x: canvas.width - 205 * size, y: canvas.height - 155 * size },
            ];
            ctx.strokeStyle = ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
            for (const [index, { paths, x, y }] of figures.entries()) {
                ctx.save();
                ctx.translate(x, y);
                ctx.scale(size, size);
                ctx.lineWidth = 0.8;
                ctx.globalAlpha = lerp(0.1, 0.22, themeBlend);
                for (const path of paths) {
                    ctx.beginPath();
                    path.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py));
                    ctx.stroke();
                }
                ctx.globalAlpha = lerp(0.2, 0.55, themeBlend);
                for (const path of paths) {
                    for (const [px, py] of path) {
                        ctx.beginPath();
                        ctx.arc(px, py, 1.4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                if (glint?.figure === index) {
                    const [px, py] = glint.point;
                    const brightness = Math.sin(progress * Math.PI);
                    const halo = ctx.createRadialGradient(px, py, 0, px, py, 12);
                    halo.addColorStop(0, `rgba(${cr},${cg},${cb},0.6)`);
                    halo.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
                    ctx.globalAlpha = brightness * lerp(0.5, 0.85, themeBlend);
                    ctx.fillStyle = halo;
                    ctx.fillRect(px - 12, py - 12, 24, 24);
                    ctx.globalAlpha = brightness;
                    ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
                    ctx.beginPath();
                    ctx.arc(px, py, 2.2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
            drawSignal(timestamp, figures, size, cr, cg, cb);
            ctx.globalAlpha = 1;
        }

        function drawMeteors(timestamp, cr, cg, cb, opacity) {
            if (motion.matches) return;
            if (timestamp >= nextMeteorAt) {
                const count = 1 + Math.floor(Math.random() * 9);
                meteors = Array.from({ length: count }, (_, i) => ({
                    x: canvas.width * (0.35 + Math.random() * 0.6),
                    y: canvas.height * (0.05 + Math.random() * 0.4),
                    start: timestamp + i * 150 + Math.random() * 150,
                }));
                nextMeteorAt = timestamp + 7000 + Math.random() * 7000;
            }
            meteors = meteors.filter(meteor => {
                const progress = (timestamp - meteor.start) / 900;
                if (progress >= 1) return false;
                if (progress < 0) return true;

                const x = meteor.x - progress * 180;
                const y = meteor.y + progress * 90;
                const fade = Math.sin(progress * Math.PI) * opacity * 0.45;
                const trail = ctx.createLinearGradient(x, y, x + 70, y - 35);
                trail.addColorStop(0, `rgba(${cr},${cg},${cb},${fade})`);
                trail.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
                ctx.strokeStyle = trail;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + 70, y - 35);
                ctx.stroke();
                return true;
            });
        }

        // 帧率节流：目标 30fps（约 33ms/帧），高刷屏下避免无效渲染
        const TARGET_FPS = 30;
        const FRAME_INTERVAL = 1000 / TARGET_FPS;
        let _lastFrameTime = 0;

        function frame(timestamp) {
            if (!document.hidden && !motion.matches) raf = requestAnimationFrame(frame);
            // 未达到目标帧间隔则跳过
            if (timestamp - _lastFrameTime < FRAME_INTERVAL) return;
            _lastFrameTime = timestamp;

            const targetBlend = isDark() ? 1 : 0;
            themeBlend += (targetBlend - themeBlend) * 0.06;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const opacity = lerp(0.22, 1, themeBlend);
            const cr = Math.round(lerp(60, 210, themeBlend));
            const cg = Math.round(lerp(80, 222, themeBlend));
            const cb = Math.round(lerp(160, 255, themeBlend));

            const glow = getGlow(cr, cg, cb);
            ctx.fillStyle = `rgb(${cr},${cg},${cb})`;

            stars.forEach(s => {
                s.alpha += s.da;
                if (s.alpha > 0.95 || s.alpha < 0.1) s.da *= -1;
                s.y += s.vy;
                if (s.y < -2) s.y = canvas.height + 2;

                ctx.globalAlpha = s.alpha * opacity;

                // 大星：用离屏缓存的发光晕 bitmap 绘制，无需每帧重建 RadialGradient
                if (s.r > 1.1 && glow) {
                    ctx.drawImage(glow, s.x - glow.width / 2, s.y - glow.height / 2);
                }

                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
            drawConstellations(timestamp, cr, cg, cb);
            drawMeteors(timestamp, cr, cg, cb, opacity);
        }

        function init() {
            resize();
            makeStars(Math.min(180, Math.max(60, Math.round(canvas.width * canvas.height / 7000))));
            meteors = [];
            nextMeteorAt = performance.now() + 7000 + Math.random() * 7000;
            glint = undefined;
            nextGlintAt = performance.now() + 4500 + Math.random() * 4500;
            signal = undefined;
            cancelAnimationFrame(raf);
            _lastFrameTime = 0; // 重置节流时钟，确保下一帧立即渲染
            if (!document.hidden) raf = requestAnimationFrame(frame);
        }

        // resize 加 debounce(300ms)，避免连续触发重建星星
        let _resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(_resizeTimer);
            _resizeTimer = setTimeout(init, 300);
        });

        init();
        motion.addEventListener('change', init);
        new MutationObserver(() => {
            if (motion.matches) {
                themeBlend = isDark() ? 1 : 0;
                _lastFrameTime = 0;
                frame(performance.now());
            }
        }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

        // 页面隐藏时暂停 RAF，恢复可见时重启，避免无效 GPU 消耗
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                cancelAnimationFrame(raf);
            } else {
                cancelAnimationFrame(raf);
                _lastFrameTime = 0;
                raf = requestAnimationFrame(frame);
            }
        });
    });
})();
