/**
 * Entités Écologiques : Éco-Gardien, Pollu-Drones, Scrap-Bots, Smog-Titan et Déchets Recyclables
 */

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 14;
        this.speed = 195;
        this.facingAngle = 0;

        // Statistiques
        this.level = 1;
        this.xp = 0;
        this.xpNeeded = 100;
        this.maxHp = 120;
        this.hp = 120;
        this.maxMp = 60; // Bio-Énergie Solaire
        this.mp = 60;
        this.mpRegenRate = 4.0;
        this.gold = 50; // Éco-Crédits / Matières Recyclées
        this.karma = 10; // Karma Écologique
        this.potionsHealth = 3; // Bio-Gels Nutritifs
        this.potionsMana = 2;   // Piles Solaires d'Urgence

        // Attaque Biorésonante
        this.baseAtk = 18;
        this.critChance = 0.15;
        this.attackCooldown = 0;
        this.attackCooldownMax = 0.28;
        this.attackRange = 54;
        this.isAttacking = false;
        this.attackArc = Math.PI * 0.75;

        // Hydro-Glisse / Dash
        this.isDashing = false;
        this.dashDuration = 0;
        this.dashCooldown = 0;
        this.dashSpeed = 470;
        this.invulnerableTime = 0;

        // Compétences
        this.fireballCooldown = 0;
        this.frostNovaCooldown = 0;

        // Équipement
        this.equipment = {
            weapon: { id: 'bioresonance_gauntlet', name: 'Gantelet Biorésonant', atk: 8, rarity: 'common', desc: 'Émet des fréquences harmoniques dépolluantes.' },
            armor: { id: 'algae_exosuit', name: 'Combinaison en Bio-Algues', hp: 25, def: 3, rarity: 'common', desc: 'Filtre les particules fines de smog.' },
            relic: null
        };

        this.inventory = [
            { id: 'solar_cell', name: 'Cellule Solaire Organique', type: 'relic', mp: 30, rarity: 'common', desc: 'Recharge continuellement votre bio-énergie.' }
        ];
    }

    get totalAtk() {
        let bonus = this.baseAtk;
        if (this.equipment.weapon) bonus += (this.equipment.weapon.atk || 0);
        if (this.equipment.relic) bonus += (this.equipment.relic.atk || 0);
        return bonus;
    }

    get totalDef() {
        let bonus = 0;
        if (this.equipment.armor) bonus += (this.equipment.armor.def || 0);
        if (this.equipment.relic) bonus += (this.equipment.relic.def || 0);
        return bonus;
    }

    get totalMaxHp() {
        let bonus = 120 + (this.level - 1) * 20;
        if (this.equipment.armor) bonus += (this.equipment.armor.hp || 0);
        if (this.equipment.relic) bonus += (this.equipment.relic.hp || 0);
        return bonus;
    }

    get totalMaxMp() {
        let bonus = 60 + (this.level - 1) * 12;
        if (this.equipment.relic) bonus += (this.equipment.relic.mp || 0);
        return bonus;
    }

    addXp(amount) {
        this.xp += amount;
        if (window.particleSystem) {
            window.particleSystem.addFloatingText(`+${amount} Bio-Data`, this.x, this.y - 20, '#10b981');
        }
        if (this.xp >= this.xpNeeded) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.xp -= this.xpNeeded;
        this.xpNeeded = Math.floor(this.xpNeeded * 1.5);
        this.baseAtk += 4;
        this.hp = this.totalMaxHp;
        this.mp = this.totalMaxMp;

        if (window.soundEngine) window.soundEngine.playLevelUp();
        if (window.particleSystem) {
            window.particleSystem.addLevelUpRing(this.x, this.y);
            window.particleSystem.addFloatingText('RÉGÉNÉRATION ACCRUE !', this.x, this.y - 35, '#10b981', true);
        }
    }

    takeDamage(amount) {
        if (this.isDashing || this.invulnerableTime > 0) return 0;
        const reduced = Math.max(1, amount - this.totalDef);
        this.hp -= reduced;
        this.invulnerableTime = 0.5;

        if (window.soundEngine) window.soundEngine.playPlayerHurt();
        if (window.particleSystem) {
            window.particleSystem.addSparks(this.x, this.y, 8, '#ef4444');
            window.particleSystem.addFloatingText(`-${reduced}`, this.x, this.y, '#ef4444');
        }
        return reduced;
    }

    heal(amount) {
        const oldHp = this.hp;
        this.hp = Math.min(this.totalMaxHp, this.hp + amount);
        const gained = this.hp - oldHp;
        if (gained > 0 && window.particleSystem) {
            window.particleSystem.addFloatingText(`+${gained} PV`, this.x, this.y - 15, '#10b981');
        }
    }

    restoreMp(amount) {
        const oldMp = this.mp;
        this.mp = Math.min(this.totalMaxMp, this.mp + amount);
        const gained = this.mp - oldMp;
        if (gained > 0 && window.particleSystem) {
            window.particleSystem.addFloatingText(`+${gained} Bio-NRJ`, this.x, this.y - 15, '#38bdf8');
        }
    }

    useHealthPotion() {
        if (this.potionsHealth > 0 && this.hp < this.totalMaxHp) {
            this.potionsHealth--;
            this.heal(55);
            if (window.soundEngine) window.soundEngine.playPotion();
            return true;
        }
        return false;
    }

    useManaPotion() {
        if (this.potionsMana > 0 && this.mp < this.totalMaxMp) {
            this.potionsMana--;
            this.restoreMp(45);
            if (window.soundEngine) window.soundEngine.playPotion();
            return true;
        }
        return false;
    }

    dash() {
        if (this.dashCooldown <= 0 && (this.vx !== 0 || this.vy !== 0)) {
            this.isDashing = true;
            this.dashDuration = 0.22;
            this.dashCooldown = 0.85;
            this.invulnerableTime = 0.25;

            const len = Math.hypot(this.vx, this.vy) || 1;
            this.vx = (this.vx / len) * this.dashSpeed;
            this.vy = (this.vy / len) * this.dashSpeed;

            if (window.soundEngine) window.soundEngine.playDash();
            return true;
        }
        return false;
    }

    // Impulsion Biorésonante : Dépollue le sol et neutralise les circuits des machines
    basicAttack(enemies, breakables, dungeon) {
        if (this.attackCooldown > 0) return;
        this.attackCooldown = this.attackCooldownMax;
        this.isAttacking = true;

        if (window.soundEngine) window.soundEngine.playSlash();
        if (window.particleSystem) {
            window.particleSystem.addSlash(this.x, this.y, this.facingAngle, this.attackRange, '#34d399');
        }

        // Biorégénération de la zone frappée
        if (dungeon) {
            dungeon.purifyRadius(this.x + Math.cos(this.facingAngle) * 30, this.y + Math.sin(this.facingAngle) * 30, 65, 0.35);
        }

        // Frapper les ennemis
        for (const enemy of enemies) {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist <= this.attackRange + enemy.radius) {
                const angleToEnemy = Math.atan2(dy, dx);
                let diffAngle = angleToEnemy - this.facingAngle;
                while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
                while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;

                if (Math.abs(diffAngle) <= this.attackArc / 2) {
                    const isCrit = Math.random() < this.critChance;
                    let dmg = this.totalAtk + Math.floor(Math.random() * 5);
                    if (isCrit) dmg = Math.floor(dmg * 1.8);

                    enemy.takeDamage(dmg, isCrit, this.x, this.y);
                }
            }
        }

        // Recycler les fûts de déchets chimiques
        for (let i = breakables.length - 1; i >= 0; i--) {
            const b = breakables[i];
            const dist = Math.hypot(b.x - this.x, b.y - this.y);
            if (dist <= this.attackRange + b.radius) {
                b.hp = 0;
                if (dungeon) {
                    dungeon.purifyRadius(b.x, b.y, 85, 0.8);
                }
            }
        }
    }

    // Capsule de Spores Végétales (absorbe les métaux lourds et reverdit le terrain)
    castFireball() {
        const manaCost = 15;
        if (this.mp < manaCost || this.fireballCooldown > 0) return null;
        this.mp -= manaCost;
        this.fireballCooldown = 0.55;

        if (window.soundEngine) window.soundEngine.playFireball();

        const speed = 370;
        return new Projectile(
            this.x + Math.cos(this.facingAngle) * 18,
            this.y + Math.sin(this.facingAngle) * 18,
            Math.cos(this.facingAngle) * speed,
            Math.sin(this.facingAngle) * speed,
            'fireball',
            this.totalAtk * 1.6,
            true
        );
    }

    // Onde Florale Solaire : Gèle/immobilise les machines sous des lianes et reverdit 140px de terrain
    castFrostNova(enemies, dungeon) {
        const manaCost = 25;
        if (this.mp < manaCost || this.frostNovaCooldown > 0) return false;
        this.mp -= manaCost;
        this.frostNovaCooldown = 3.5;

        if (window.soundEngine) window.soundEngine.playFrost();
        if (window.particleSystem) {
            window.particleSystem.addIceShatter(this.x, this.y, 25);
            window.particleSystem.addFloatingText('ÉCLOSION SOLAIRE !', this.x, this.y - 25, '#34d399', true);
        }

        // Purifier massivement
        if (dungeon) {
            dungeon.purifyRadius(this.x, this.y, 140, 1.0);
        }

        const novaRadius = 135;
        for (const enemy of enemies) {
            const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist <= novaRadius) {
                enemy.freeze(3.5);
                enemy.takeDamage(this.totalAtk * 0.85, false, this.x, this.y);
            }
        }
        return true;
    }

    update(dt, dungeon) {
        if (this.mp < this.totalMaxMp) {
            this.mp = Math.min(this.totalMaxMp, this.mp + this.mpRegenRate * dt);
        }

        // Dépollution passive sous les pas du héros
        if (dungeon && (this.vx !== 0 || this.vy !== 0)) {
            dungeon.purifyRadius(this.x, this.y, 35, 0.05);
        }

        if (this.isDashing) {
            this.dashDuration -= dt;
            if (this.dashDuration <= 0) this.isDashing = false;
        }

        if (this.dashCooldown > 0) this.dashCooldown -= dt;
        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
            if (this.attackCooldown <= 0) this.isAttacking = false;
        }
        if (this.fireballCooldown > 0) this.fireballCooldown -= dt;
        if (this.frostNovaCooldown > 0) this.frostNovaCooldown -= dt;
        if (this.invulnerableTime > 0) this.invulnerableTime -= dt;

        const moveX = this.vx * dt;
        const moveY = this.vy * dt;

        if (!dungeon.isSolid(this.x + moveX, this.y, this.radius)) this.x += moveX;
        if (!dungeon.isSolid(this.x, this.y + moveY, this.radius)) this.y += moveY;

        dungeon.revealAround(this.x, this.y, 6);
    }
}

class Enemy {
    constructor(x, y, type = 'goblin', floor = 1) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.type = type; // 'goblin' = PolluDrone, 'skeleton' = ScrapBot, 'mage' = ChemDrone, 'boss' = SmogTitan
        this.floor = floor;
        this.facingAngle = 0;
        this.animOffset = Math.random() * 10;
        this.hitFlashTime = 0;
        this.isFrozen = false;
        this.freezeTimer = 0;

        switch (type) {
            case 'goblin': // Pollu-Drone Rapide
                this.radius = 12;
                this.maxHp = 30 + floor * 10;
                this.hp = this.maxHp;
                this.speed = 135;
                this.atk = 8 + floor * 3;
                this.xpReward = 28 + floor * 8;
                this.attackRange = 26;
                this.attackCooldown = 0;
                this.attackInterval = 1.0;
                break;
            case 'skeleton': // Scrap-Bot à Chenilles
                this.radius = 14;
                this.maxHp = 52 + floor * 14;
                this.hp = this.maxHp;
                this.speed = 92;
                this.atk = 14 + floor * 4;
                this.xpReward = 48 + floor * 12;
                this.attackRange = 32;
                this.attackCooldown = 0;
                this.attackInterval = 1.4;
                break;
            case 'mage': // Drone Chimiste
                this.radius = 13;
                this.maxHp = 40 + floor * 12;
                this.hp = this.maxHp;
                this.speed = 100;
                this.atk = 16 + floor * 5;
                this.xpReward = 58 + floor * 15;
                this.attackRange = 220;
                this.attackCooldown = 1.5;
                this.attackInterval = 2.2;
                break;
            case 'boss': // Smog-Titan X-900
                this.radius = 28;
                this.maxHp = 420;
                this.hp = this.maxHp;
                this.speed = 105;
                this.atk = 26;
                this.xpReward = 350;
                this.attackRange = 55;
                this.attackCooldown = 1.0;
                this.attackInterval = 1.8;
                this.isEnraged = false;
                this.shockwaveCooldown = 4.0;
                break;
        }
    }

    takeDamage(amount, isCrit, attackerX, attackerY) {
        this.hp -= amount;
        this.hitFlashTime = 0.15;

        if (this.type !== 'boss') {
            const angle = Math.atan2(this.y - attackerY, this.x - attackerX);
            this.x += Math.cos(angle) * 14;
            this.y += Math.sin(angle) * 14;
        }

        if (window.soundEngine) window.soundEngine.playHit();
        if (window.particleSystem) {
            window.particleSystem.addSparks(this.x, this.y, isCrit ? 14 : 7, isCrit ? '#34d399' : '#ffffff');
            window.particleSystem.addFloatingText(`${Math.round(amount)}`, this.x, this.y - 10, isCrit ? '#34d399' : '#ffffff', isCrit);
        }
    }

    freeze(duration) {
        this.isFrozen = true;
        this.freezeTimer = duration;
    }

    update(dt, player, dungeon, newProjectiles) {
        if (this.hitFlashTime > 0) this.hitFlashTime -= dt;

        if (this.isFrozen) {
            this.freezeTimer -= dt;
            if (this.freezeTimer <= 0) this.isFrozen = false;
            return;
        }

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distToPlayer = Math.hypot(dx, dy);
        this.facingAngle = Math.atan2(dy, dx);

        if (this.attackCooldown > 0) this.attackCooldown -= dt;

        if (this.type === 'boss') {
            this.updateBoss(dt, player, dungeon, distToPlayer, newProjectiles);
        } else if (this.type === 'mage') {
            this.updateMage(dt, player, dungeon, distToPlayer, newProjectiles);
        } else {
            this.updateMelee(dt, player, dungeon, distToPlayer);
        }
    }

    updateMelee(dt, player, dungeon, dist) {
        if (dist < 280 && dist > this.attackRange) {
            const vx = Math.cos(this.facingAngle) * this.speed;
            const vy = Math.sin(this.facingAngle) * this.speed;
            if (!dungeon.isSolid(this.x + vx * dt, this.y, this.radius)) this.x += vx * dt;
            if (!dungeon.isSolid(this.x, this.y + vy * dt, this.radius)) this.y += vy * dt;
        } else if (dist <= this.attackRange && this.attackCooldown <= 0) {
            this.attackCooldown = this.attackInterval;
            player.takeDamage(this.atk);
        }
    }

    updateMage(dt, player, dungeon, dist, newProjectiles) {
        if (dist < 320) {
            if (dist < 100) {
                const retreatAngle = this.facingAngle + Math.PI;
                const rx = Math.cos(retreatAngle) * this.speed;
                const ry = Math.sin(retreatAngle) * this.speed;
                if (!dungeon.isSolid(this.x + rx * dt, this.y, this.radius)) this.x += rx * dt;
                if (!dungeon.isSolid(this.x, this.y + ry * dt, this.radius)) this.y += ry * dt;
            }

            if (this.attackCooldown <= 0) {
                this.attackCooldown = this.attackInterval;
                const projSpeed = 190;
                newProjectiles.push(new Projectile(
                    this.x,
                    this.y,
                    Math.cos(this.facingAngle) * projSpeed,
                    Math.sin(this.facingAngle) * projSpeed,
                    'darkOrb', // Jet toxique
                    this.atk,
                    false
                ));
            }
        }
    }

    updateBoss(dt, player, dungeon, dist, newProjectiles) {
        if (!this.isEnraged && this.hp < this.maxHp * 0.5) {
            this.isEnraged = true;
            this.speed = 130;
            if (window.particleSystem) {
                window.particleSystem.addFloatingText('SURCHAUFFE THERMIQUE !', this.x, this.y - 45, '#ef4444', true);
            }
        }

        if (dist > this.attackRange) {
            const vx = Math.cos(this.facingAngle) * this.speed;
            const vy = Math.sin(this.facingAngle) * this.speed;
            if (!dungeon.isSolid(this.x + vx * dt, this.y, this.radius)) this.x += vx * dt;
            if (!dungeon.isSolid(this.x, this.y + vy * dt, this.radius)) this.y += vy * dt;
        } else if (this.attackCooldown <= 0) {
            this.attackCooldown = this.attackInterval;
            player.takeDamage(this.atk);
            if (window.particleSystem) {
                window.particleSystem.addSparks(player.x, player.y, 16, '#f97316', 5);
            }
        }

        this.shockwaveCooldown -= dt;
        if (this.shockwaveCooldown <= 0) {
            this.shockwaveCooldown = this.isEnraged ? 3.0 : 5.0;
            if (window.particleSystem) {
                window.particleSystem.addFireExplosion(this.x, this.y, 140);
            }
            if (dist < 140) {
                player.takeDamage(this.atk * 0.9);
            }
        }
    }
}

class Projectile {
    constructor(x, y, vx, vy, type, damage, isPlayerOwned) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type;
        this.damage = damage;
        this.isPlayerOwned = isPlayerOwned;
        this.radius = type === 'fireball' ? 9 : 8;
        this.life = 2.5;
    }

    update(dt, dungeon) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;

        if (dungeon.isSolid(this.x, this.y)) {
            if (this.type === 'fireball' && window.particleSystem) {
                window.particleSystem.addFireExplosion(this.x, this.y, 35);
                dungeon.purifyRadius(this.x, this.y, 70, 0.6);
            }
            return false;
        }
        return this.life > 0;
    }
}

class LootDrop {
    constructor(x, y, type, item = null) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.item = item;
        this.id = Math.random();
        this.radius = 14;
    }
}

window.Player = Player;
window.Enemy = Enemy;
window.Projectile = Projectile;
window.LootDrop = LootDrop;
