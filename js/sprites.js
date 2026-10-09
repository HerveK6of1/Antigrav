/**
 * Rendu Procédural des Sprites Solarpunk & Écologie Futuriste
 * Éco-Gardiens, Pollu-Drones, Titans Industriels, et Flore Vivante
 */

// Polyfill de sécurité pour CanvasRenderingContext2D.roundRect
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
        const r = typeof radii === 'number' ? radii : 4;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y + x, y, r);
        this.closePath();
        return this;
    };
}

class SpriteRenderer {
    static drawShadow(ctx, x, y, radiusX = 14, radiusY = 7) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        ctx.ellipse(x, y + radiusY + 2, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Héros : L'Éco-Gardien de 2058
    static drawPlayer(ctx, p, time) {
        ctx.save();
        ctx.translate(p.x, p.y);

        this.drawShadow(ctx, 0, 10, 14, 7);

        // Effet de dash : Hydro-glisse avec traînée d'eau et de feuilles
        if (p.isDashing) {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
            ctx.beginPath();
            ctx.ellipse(-p.vx * 3, -p.vy * 3 + 4, 18, 18, 0, 0, Math.PI * 2);
            ctx.fill();

            // Feuilles flottantes dans le sillage
            ctx.fillStyle = '#34d399';
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.arc(-p.vx * (i * 0.8) + (i % 2 === 0 ? 6 : -6), -p.vy * (i * 0.8), 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        if (p.invulnerableTime > 0 && Math.floor(time * 20) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        const isMoving = Math.hypot(p.vx, p.vy) > 0.1;
        const walkCycle = isMoving ? Math.sin(time * 12) : 0;
        const bob = isMoving ? Math.abs(Math.sin(time * 12)) * 3 : Math.sin(time * 3) * 1;

        // Sacoche de Bio-Semences au dos
        ctx.fillStyle = '#065f46';
        ctx.beginPath();
        ctx.roundRect(-8, -8 - bob, 16, 14, 3);
        ctx.fill();
        // Fiole de mycélium luminescente verte
        ctx.fillStyle = '#34d399';
        ctx.fillRect(-4, -6 - bob, 8, 4);

        // Bottes souples en bioplastique recyclé
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-8 + walkCycle * 3, 10 - bob, 5, 6);
        ctx.fillRect(3 - walkCycle * 3, 10 - bob, 5, 6);

        // Combinaison de régénération blanche et émeraude
        ctx.fillStyle = '#f8fafc'; // Blanc pur épuré
        ctx.fillRect(-9, -6 - bob, 18, 16);
        // Bandes vertes photovoltaïques
        ctx.fillStyle = '#10b981';
        ctx.fillRect(-9, -2 - bob, 18, 4);
        ctx.fillRect(-2, -6 - bob, 4, 16);

        // Casque d'assistance respiratoire avec visiophone cyan
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, -13 - bob, 9, 0, Math.PI * 2);
        ctx.fill();
        // Visière panoramique holographique (cyan solaire)
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(-6, -16 - bob, 12, 5, 2);
        ctx.fill();
        // Écouteurs de bio-capteurs dorés
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(-8, -13 - bob, 2, 0, Math.PI * 2);
        ctx.arc(8, -13 - bob, 2, 0, Math.PI * 2);
        ctx.fill();

        // Gantelet Biorésonant & Canon Écologique
        ctx.save();
        const facingRight = p.facingAngle > -Math.PI / 2 && p.facingAngle < Math.PI / 2;
        const armPivotX = facingRight ? 6 : -6;
        ctx.translate(armPivotX, 0 - bob);

        let toolAngle = p.facingAngle;
        if (p.isAttacking) {
            const swingProgress = (p.attackCooldownMax - p.attackCooldown) / p.attackCooldownMax;
            toolAngle += (swingProgress - 0.5) * 1.8;
        }
        ctx.rotate(toolAngle);

        // Bras de support
        ctx.fillStyle = '#10b981';
        ctx.fillRect(0, -3, 8, 6);

        // Gantelet à bio-impulsion avec cristal de résonance
        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.roundRect(8, -4, 14, 8, 2);
        ctx.fill();
        // Émetteur solaire doré à l'avant
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(22, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        // Lueur arcanique de purification
        ctx.fillStyle = 'rgba(52, 211, 153, 0.6)';
        ctx.beginPath();
        ctx.arc(23, 0, 7 + Math.sin(time * 8) * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        ctx.restore();
    }

    // Monstres : Drones et Automates Polluants
    static drawMonster(ctx, m, time) {
        ctx.save();
        ctx.translate(m.x, m.y);

        this.drawShadow(ctx, 0, m.radius * 0.8, m.radius * 0.9, m.radius * 0.45);

        if (m.hitFlashTime > 0) {
            ctx.filter = 'brightness(2.5)';
        }

        // Effet de mycélium / lianes d'immobilisation (Freeze)
        if (m.isFrozen) {
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, m.radius + 6, 0, Math.PI * 2);
            ctx.stroke();
            // Feuilles d'emprisonnement
            ctx.fillStyle = '#34d399';
            ctx.beginPath();
            ctx.arc(m.radius, 0, 3, 0, Math.PI * 2);
            ctx.arc(-m.radius, 0, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        const bob = Math.sin(time * 8 + m.animOffset) * 2;

        switch (m.type) {
            case 'goblin': // Pollu-Drone Rapide
                this.renderPolluDrone(ctx, m, bob, time);
                break;
            case 'skeleton': // Scrap-Bot à Chenilles
                this.renderScrapBot(ctx, m, bob, time);
                break;
            case 'mage': // Drone Chimiste Répandeur d'Acide
                this.renderChemDrone(ctx, m, bob, time);
                break;
            case 'boss': // Smog-Titan X-900
                this.renderSmogTitan(ctx, m, bob, time);
                break;
            default:
                ctx.fillStyle = '#dc2626';
                ctx.beginPath();
                ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
                ctx.fill();
        }

        ctx.restore();
    }

    // Pollu-Drone MK-1 (Rapide, hélices rotatives, fumée d'échappement)
    static renderPolluDrone(ctx, m, bob, time) {
        // Châssis métallique corrodé
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(0, -bob, 10, 0, Math.PI * 2);
        ctx.fill();

        // 4 Hélices rotatives en croix
        const rotorAngle = time * 24;
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        [-1, 1].forEach(dx => {
            [-1, 1].forEach(dy => {
                const rx = dx * 11;
                const ry = dy * 11 - bob;
                ctx.strokeRect(rx - 4, ry - 1, 8, 2);
            });
        });

        // Oeil optique rouge hostile
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(Math.cos(m.facingAngle) * 4, -bob + Math.sin(m.facingAngle) * 4, 3, 0, Math.PI * 2);
        ctx.fill();

        // Petite traînée de fumée noire
        ctx.fillStyle = 'rgba(75, 85, 99, 0.4)';
        ctx.beginPath();
        ctx.arc(-Math.cos(m.facingAngle) * 8, -bob + 6, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // Scrap-Bot Industriel (Automate lourd à chenilles et pinces)
    static renderScrapBot(ctx, m, bob, time) {
        // Chenilles blindées sombres
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-12, 4 - bob, 24, 7);
        ctx.fillStyle = '#475569';
        for (let x = -10; x <= 10; x += 5) {
            ctx.fillRect(x, 5 - bob, 2, 5);
        }

        // Corps en tôle industrielle avec rouille
        ctx.fillStyle = '#78350f'; // Rouille
        ctx.fillRect(-10, -10 - bob, 20, 15);
        ctx.fillStyle = '#b45309';
        ctx.strokeRect(-10, -10 - bob, 20, 15);

        // Cheminée d'échappement crachant des étincelles
        ctx.fillStyle = '#334155';
        ctx.fillRect(4, -18 - bob, 5, 8);

        // Tête robotique avec fente optique ambrée
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-6, -8 - bob, 12, 5);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-4, -7 - bob, 8, 3);
    }

    // Drone Chimiste (Distributeur d'acide et toxines)
    static renderChemDrone(ctx, m, bob, time) {
        // Cuve de liquide toxique vert fluo
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-8, -14 - bob, 16, 20, 6);
        ctx.fill();

        // Liquide acide toxique luisant
        const acidGlow = 0.5 + Math.sin(time * 6) * 0.3;
        ctx.fillStyle = `rgba(168, 85, 247, ${acidGlow})`; // Violet toxique
        ctx.beginPath();
        ctx.arc(0, -4 - bob, 6, 0, Math.PI * 2);
        ctx.fill();

        // Buse d'aspersion dirigée vers la cible
        ctx.save();
        ctx.rotate(m.facingAngle);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(8, -2, 10, 4);
        ctx.restore();
    }

    // Boss : SMOG-TITAN X-900 (Excavatrice & Brûleur géant)
    static renderSmogTitan(ctx, m, bob, time) {
        const pulse = Math.sin(time * 6) * 4;

        // Nuage de smog et de chaleur autour du boss
        ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
        ctx.beginPath();
        ctx.arc(0, 0, m.radius + 16 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Châssis massif en acier forgé
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-24, -20 - bob, 48, 42, 6);
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Chenilles géantes
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-32, -18 - bob, 8, 36);
        ctx.fillRect(24, -18 - bob, 8, 36);

        // 3 Grandes cheminées crachant de la fumée noire
        ctx.fillStyle = '#334155';
        ctx.fillRect(-16, -34 - bob, 8, 14);
        ctx.fillRect(-4, -38 - bob, 8, 18);
        ctx.fillRect(8, -34 - bob, 8, 14);

        // Fumée d'échappement animée
        ctx.fillStyle = 'rgba(51, 65, 85, 0.6)';
        for (let i = 0; i < 3; i++) {
            const smokeY = -42 - bob - (time * 15 + i * 8) % 18;
            ctx.beginPath();
            ctx.arc(-12 + i * 12, smokeY, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        // Cœur thermique à combustion au centre (Orange/Rougeoyant)
        const coreGrad = ctx.createRadialGradient(0, 0 - bob, 2, 0, 0 - bob, 14);
        coreGrad.addColorStop(0, '#fef08a');
        coreGrad.addColorStop(0.5, '#f97316');
        coreGrad.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0 - bob, 12, 0, Math.PI * 2);
        ctx.fill();

        // Bras de forage et disque de sciage géant
        ctx.save();
        ctx.rotate(m.facingAngle);
        ctx.fillStyle = '#475569';
        ctx.fillRect(16, -6, 26, 12);
        // Tête rotative de forage
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(42, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }

    // Projectiles Écologiques et Industriels
    static drawProjectile(ctx, proj) {
        ctx.save();
        ctx.translate(proj.x, proj.y);

        if (proj.type === 'fireball') { // Capsule de Mycélium / Bio-Graine
            // Sphère de graines vert émeraude avec halo solaire
            const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, proj.radius);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.4, '#34d399');
            grad.addColorStop(0.8, '#059669');
            grad.addColorStop(1, 'rgba(5, 150, 105, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, proj.radius + 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (proj.type === 'darkOrb') { // Projectile Toxique d'Acide
            const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, proj.radius);
            grad.addColorStop(0, '#f5d0fe');
            grad.addColorStop(0.5, '#a855f7');
            grad.addColorStop(1, 'rgba(88, 28, 135, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    // Butin Écologique (Éco-Matériaux, Bioplastiques, Batteries Solaires)
    static drawLootDrop(ctx, drop, time) {
        ctx.save();
        ctx.translate(drop.x, drop.y);

        const floatY = Math.sin(time * 5 + drop.id) * 3;
        this.drawShadow(ctx, 0, 6, 8, 4);
        ctx.translate(0, floatY);

        if (drop.type === 'gold') { // Éco-Crédits / Matériaux Recyclés
            ctx.fillStyle = '#10b981'; // Vert écocitoyen
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        } else if (drop.type === 'potion_health') { // Fiole de Bio-Gel Nutritif
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(0, 2, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(-2, -6, 4, 4);
        } else if (drop.type === 'potion_mana') { // Cellule Solaire de Poche
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(0, 2, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(-2, -6, 4, 4);
        } else if (drop.type === 'equipment') {
            const rarityColors = {
                common: '#94a3b8',
                rare: '#38bdf8',
                epic: '#10b981',
                legendary: '#f59e0b'
            };
            const glowColor = rarityColors[drop.item.rarity] || '#10b981';
            ctx.fillStyle = glowColor;
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.globalAlpha = 0.4 + Math.sin(time * 4) * 0.2;
            ctx.fill();
            ctx.globalAlpha = 1.0;

            // Icône de composant technologique
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-4, -4, 8, 8);
        }

        ctx.restore();
    }
}

window.SpriteRenderer = SpriteRenderer;
