/**
 * Système de Particules & Effets Visuels
 * Gère les étincelles, poussières d'ambiance, arcs d'attaque et textes flottants de dégâts
 */
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.floatingTexts = [];
        this.ambientMotes = [];
        this.maxAmbientMotes = 40;
    }

    reset() {
        this.particles = [];
        this.floatingTexts = [];
        this.ambientMotes = [];
    }

    initAmbient(width, height) {
        this.ambientMotes = [];
        for (let i = 0; i < this.maxAmbientMotes; i++) {
            this.ambientMotes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: -Math.random() * 0.3 - 0.1,
                radius: Math.random() * 2 + 1,
                alpha: Math.random() * 0.5 + 0.2,
                maxLife: 300 + Math.random() * 200,
                life: Math.random() * 300,
                color: Math.random() > 0.4 ? 'rgba(255, 215, 120, ' : 'rgba(180, 220, 255, '
            });
        }
    }

    addSlash(x, y, angle, radius, color = '#ffffff') {
        this.particles.push({
            type: 'slash',
            x, y,
            angle,
            radius,
            color,
            alpha: 0.9,
            life: 1,
            decay: 0.12
        });
    }

    addSparks(x, y, count = 12, color = '#f59e0b', speed = 3) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = (Math.random() * 0.7 + 0.3) * speed;
            this.particles.push({
                type: 'spark',
                x, y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                radius: Math.random() * 3 + 1.5,
                color,
                alpha: 1,
                life: 1,
                decay: Math.random() * 0.04 + 0.04
            });
        }
    }

    addBlood(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const vel = Math.random() * 2.5 + 0.5;
            this.particles.push({
                type: 'blood',
                x, y,
                vx: Math.cos(angle) * vel,
                vy: Math.sin(angle) * vel,
                radius: Math.random() * 2.5 + 1.5,
                color: '#dc2626',
                alpha: 0.9,
                life: 1,
                decay: 0.035
            });
        }
    }

    addIceShatter(x, y, count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const vel = Math.random() * 3 + 1;
            this.particles.push({
                type: 'spark',
                x, y,
                vx: Math.cos(angle) * vel,
                vy: Math.sin(angle) * vel,
                radius: Math.random() * 3 + 2,
                color: '#38bdf8',
                alpha: 1,
                life: 1,
                decay: 0.05
            });
        }
    }

    addFireExplosion(x, y, radius = 40) {
        // Cercle d'onde de choc
        this.particles.push({
            type: 'shockwave',
            x, y,
            radius: 10,
            maxRadius: radius,
            color: '#fb923c',
            alpha: 0.8,
            life: 1,
            decay: 0.08
        });

        // Flammes
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const vel = Math.random() * 4 + 1.5;
            this.particles.push({
                type: 'spark',
                x, y,
                vx: Math.cos(angle) * vel,
                vy: Math.sin(angle) * vel,
                radius: Math.random() * 4 + 2,
                color: Math.random() > 0.5 ? '#ef4444' : '#f59e0b',
                alpha: 1,
                life: 1,
                decay: 0.04
            });
        }
    }

    addLevelUpRing(x, y) {
        for (let i = 0; i < 35; i++) {
            const angle = (i / 35) * Math.PI * 2;
            const vel = 3.5;
            this.particles.push({
                type: 'spark',
                x, y,
                vx: Math.cos(angle) * vel,
                vy: Math.sin(angle) * vel,
                radius: 3,
                color: '#eab308',
                alpha: 1,
                life: 1,
                decay: 0.03
            });
        }
    }

    addFloatingText(text, x, y, color = '#ffffff', isCrit = false) {
        this.floatingTexts.push({
            text,
            x: x + (Math.random() - 0.5) * 16,
            y: y - 10,
            vy: -1.6,
            alpha: 1,
            isCrit,
            scale: isCrit ? 1.4 : 1.0,
            color,
            life: 1,
            decay: 0.022
        });
    }

    update(dt = 1, mapWidth, mapHeight) {
        // Particules standard
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= p.decay * dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            p.alpha = Math.max(0, p.life);

            if (p.vx !== undefined) {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.vx *= 0.94;
                p.vy *= 0.94;
            }

            if (p.type === 'shockwave') {
                p.radius += (p.maxRadius - p.radius) * 0.2 * dt;
            }
        }

        // Textes flottants
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy * dt;
            ft.life -= ft.decay * dt;
            ft.alpha = Math.max(0, ft.life);
            if (ft.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }

        // Poussières d'ambiance
        if (mapWidth && mapHeight) {
            for (let i = 0; i < this.ambientMotes.length; i++) {
                const m = this.ambientMotes[i];
                m.x += m.vx * dt;
                m.y += m.vy * dt;
                m.life += dt;
                if (m.life >= m.maxLife || m.y < 0 || m.x < 0 || m.x > mapWidth) {
                    m.x = Math.random() * mapWidth;
                    m.y = mapHeight + 10;
                    m.life = 0;
                }
            }
        }
    }

    draw(ctx, camera) {
        ctx.save();

        // 1. Poussière d'ambiance
        for (const m of this.ambientMotes) {
            const screenX = m.x - camera.x;
            const screenY = m.y - camera.y;
            ctx.fillStyle = `${m.color}${m.alpha})`;
            ctx.beginPath();
            ctx.arc(screenX, screenY, m.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // 2. Particules de combat & effets
        for (const p of this.particles) {
            const screenX = p.x - camera.x;
            const screenY = p.y - camera.y;

            if (p.type === 'slash') {
                ctx.save();
                ctx.translate(screenX, screenY);
                ctx.rotate(p.angle);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 4 * p.alpha;
                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(0, 0, p.radius, -Math.PI / 3, Math.PI / 3);
                ctx.stroke();
                ctx.restore();
            } else if (p.type === 'shockwave') {
                ctx.save();
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 3;
                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(screenX, screenY, p.radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            } else {
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(screenX, screenY, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // 3. Textes flottants (dégâts, soins, esquive)
        for (const ft of this.floatingTexts) {
            const screenX = ft.x - camera.x;
            const screenY = ft.y - camera.y;

            ctx.save();
            ctx.globalAlpha = ft.alpha;
            ctx.font = `bold ${Math.round(14 * ft.scale)}px 'Outfit', sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillStyle = '#0f172a';
            ctx.fillText(ft.text, screenX + 1, screenY + 1); // Ombre portée
            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, screenX, screenY);
            ctx.restore();
        }

        ctx.restore();
    }
}

window.particleSystem = new ParticleSystem();
