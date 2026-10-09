/**
 * Boucle Principale de 'Terra Nova 2058 : L'Éveil de Gaia'
 * Mode Sprint 60 Secondes : Dépollution Éclair et Évolution Narrative Dynamique
 */

class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.state = 'START';
        this.lastTime = 0;
        this.totalKills = 0;

        // Minuteur de 60 secondes
        this.timeRemaining = 60.0;
        this.isTimerActive = true;

        this.camera = { x: 0, y: 0, width: 960, height: 600 };

        this.dungeon = new Dungeon();
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.lootDrops = [];
        this.bossEnemy = null;

        this.keys = {};
        this.mouse = { x: 0, y: 0, worldX: 0, worldY: 0, isDown: false };
    }

    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.setupEventListeners();
        this.resize();
        window.addEventListener('resize', () => this.resize());

        if (window.uiManager) window.uiManager.init();

        this.startNewGame();
        requestAnimationFrame((t) => this.loop(t));
    }

    resize() {
        this.canvas.width = 960;
        this.canvas.height = 600;
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;
    }

    startNewGame() {
        this.totalKills = 0;
        this.timeRemaining = 60.0;
        this.isTimerActive = true;

        this.dungeon.init(1);
        this.player = new Player(this.dungeon.startPos.x, this.dungeon.startPos.y);
        this.enemies = [];
        this.projectiles = [];
        this.lootDrops = [];
        this.bossEnemy = null;
        this.state = 'PLAYING';

        if (window.particleSystem) {
            window.particleSystem.reset();
            window.particleSystem.initAmbient(this.dungeon.width * this.dungeon.tileSize, this.dungeon.height * this.dungeon.tileSize);
        }
        if (window.soundEngine) {
            window.soundEngine.startMusic(false);
        }
        if (window.storyEngine) {
            window.storyEngine.triggeredMilestones.clear();
            window.storyEngine.init();
        }

        this.spawnSectorEnemies();

        // Masquer les modales
        const goModal = document.getElementById('gameover-modal');
        const vicModal = document.getElementById('victory-modal');
        const sprintModal = document.getElementById('sprint-end-modal');
        if (goModal) goModal.classList.add('hidden');
        if (vicModal) vicModal.classList.add('hidden');
        if (sprintModal) sprintModal.classList.add('hidden');
    }

    spawnSectorEnemies() {
        this.enemies = [];
        this.bossEnemy = null;

        for (let i = 1; i < this.dungeon.rooms.length; i++) {
            const room = this.dungeon.rooms[i];
            const count = Math.floor(Math.random() * 2) + 2;

            for (let c = 0; c < count; c++) {
                const rx = (room.x + 1 + Math.random() * (room.w - 2)) * this.dungeon.tileSize;
                const ry = (room.y + 1 + Math.random() * (room.h - 2)) * this.dungeon.tileSize;

                const enemyType = Math.random() > 0.4 ? 'goblin' : 'skeleton';
                this.enemies.push(new Enemy(rx, ry, enemyType, 1));
            }
        }
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.keys[e.code] = true;

            if (e.key === 'e' || e.key === 'E') this.interact();
            if (e.key === '1') this.player.useHealthPotion();
            if (e.key === '2') this.player.useManaPotion();
            if (e.key === 'i' || e.key === 'I' || e.key === 'b' || e.key === 'B') {
                if (window.uiManager) window.uiManager.toggleInventory();
            }
            if (e.key === 'j' || e.key === 'J') {
                if (window.uiManager) window.uiManager.toggleJournal();
            }
            if (e.key === ' ' && !this.player.isDashing) {
                if (this.keys['shift'] || Math.hypot(this.player.vx, this.player.vy) > 0.5) {
                    this.player.dash();
                } else {
                    this.player.basicAttack(this.enemies, this.dungeon.breakables, this.dungeon);
                }
            }
            if (e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'q') {
                this.castPlayerSpore();
            }
            if (e.key.toLowerCase() === 'z' || e.key.toLowerCase() === 'w') {
                this.player.castFrostNova(this.enemies, this.dungeon);
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            this.keys[e.code] = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;

            this.mouse.x = (e.clientX - rect.left) * scaleX;
            this.mouse.y = (e.clientY - rect.top) * scaleY;
            this.mouse.worldX = this.mouse.x + this.camera.x;
            this.mouse.worldY = this.mouse.y + this.camera.y;
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (window.soundEngine && !window.soundEngine.ctx) {
                window.soundEngine.init();
            }

            if (e.button === 0) {
                this.mouse.isDown = true;
                if (this.player && this.state === 'PLAYING') {
                    this.player.basicAttack(this.enemies, this.dungeon.breakables, this.dungeon);
                }
            } else if (e.button === 2) {
                e.preventDefault();
                this.castPlayerSpore();
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouse.isDown = false;
        });

        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        const btnAttack = document.getElementById('touch-btn-attack');
        const btnFire = document.getElementById('touch-btn-fire');
        const btnFrost = document.getElementById('touch-btn-frost');
        const btnDash = document.getElementById('touch-btn-dash');
        const btnPotionHp = document.getElementById('hud-potion-hp');
        const btnPotionMp = document.getElementById('hud-potion-mp');

        if (btnAttack) btnAttack.addEventListener('click', () => this.player.basicAttack(this.enemies, this.dungeon.breakables, this.dungeon));
        if (btnFire) btnFire.addEventListener('click', () => this.castPlayerSpore());
        if (btnFrost) btnFrost.addEventListener('click', () => this.player.castFrostNova(this.enemies, this.dungeon));
        if (btnDash) btnDash.addEventListener('click', () => this.player.dash());
        if (btnPotionHp) btnPotionHp.addEventListener('click', () => this.player.useHealthPotion());
        if (btnPotionMp) btnPotionMp.addEventListener('click', () => this.player.useManaPotion());

        const btnRestart = document.getElementById('restart-btn');
        const btnVictoryRestart = document.getElementById('victory-restart-btn');
        const btnSprintRestart = document.getElementById('sprint-restart-btn');

        if (btnRestart) btnRestart.addEventListener('click', () => this.startNewGame());
        if (btnVictoryRestart) btnVictoryRestart.addEventListener('click', () => this.startNewGame());
        if (btnSprintRestart) btnSprintRestart.addEventListener('click', () => this.startNewGame());
    }

    castPlayerSpore() {
        if (!this.player) return;
        const proj = this.player.castFireball();
        if (proj) {
            this.projectiles.push(proj);
        }
    }

    interact() {
        if (!this.player || this.state !== 'PLAYING') return;

        for (const chest of this.dungeon.chests) {
            const dist = Math.hypot(chest.x - this.player.x, chest.y - this.player.y);
            if (dist < 46 && !chest.opened) {
                chest.opened = true;
                if (window.soundEngine) window.soundEngine.playChestOpen();

                const goldGain = 35 + Math.floor(Math.random() * 40);
                this.player.gold += goldGain;
                const itemLoot = window.getRandomEcoLootItem(1);
                this.lootDrops.push(new LootDrop(chest.x, chest.y + 16, 'equipment', itemLoot));
                if (window.particleSystem) {
                    window.particleSystem.addFloatingText(`+${goldGain} Éco-Crédits`, chest.x, chest.y - 15, '#10b981');
                }

                if (window.storyEngine) {
                    window.storyEngine.discoverRandomArchive();
                }
                return;
            }
        }
    }

    // Fin du Sprint de 60 Secondes : Calcul du Score & Rang Écologique
    triggerOneMinuteEnd() {
        this.state = 'SPRINT_END';
        this.isTimerActive = false;

        if (window.soundEngine) {
            window.soundEngine.playLevelUp();
        }

        const purity = this.dungeon.getBiomeHealthPercentage();
        let grade = 'B';
        let gradeColor = '#38bdf8';
        let title = 'Éco-Citoyen Actif';

        if (purity >= 75) {
            grade = 'S+';
            gradeColor = '#fbbf24';
            title = 'Maître Éco-Régénérateur Légendaire';
        } else if (purity >= 50) {
            grade = 'A';
            gradeColor = '#10b981';
            title = 'Gardien Solarpunk Émérite';
        } else if (purity >= 25) {
            grade = 'B';
            gradeColor = '#38bdf8';
            title = 'Bioréparateur Engagé';
        } else {
            grade = 'C';
            gradeColor = '#94a3b8';
            title = 'Apprenti de la Transition';
        }

        if (window.storyEngine) {
            window.storyEngine.addLog(`BILAN 60S : ${purity}% de pureté atteint. Rang décerné : [${grade}] (${title}).`);
        }

        const modal = document.getElementById('sprint-end-modal');
        if (modal) {
            modal.classList.remove('hidden');
            const gradeEl = document.getElementById('sprint-grade-badge');
            const purityEl = document.getElementById('sprint-purity-stat');
            const killsEl = document.getElementById('sprint-kills-stat');
            const goldEl = document.getElementById('sprint-gold-stat');
            const titleEl = document.getElementById('sprint-title-stat');

            if (gradeEl) {
                gradeEl.textContent = grade;
                gradeEl.style.color = gradeColor;
                gradeEl.style.borderColor = gradeColor;
            }
            if (purityEl) purityEl.textContent = `${purity}%`;
            if (killsEl) killsEl.textContent = `${this.totalKills}`;
            if (goldEl) goldEl.textContent = `${this.player.gold}`;
            if (titleEl) titleEl.textContent = title;
        }
    }

    triggerGameOver() {
        this.state = 'GAMEOVER';
        if (window.soundEngine) {
            window.soundEngine.stopMusic();
            window.soundEngine.playGameOver();
        }
        if (window.uiManager) {
            window.uiManager.showGameOver({
                floor: 1,
                kills: this.totalKills,
                gold: this.player.gold
            });
        }
    }

    handlePlayerMovement() {
        let mx = 0;
        let my = 0;

        if (this.keys['z'] || this.keys['w'] || this.keys['arrowup']) my -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) my += 1;
        if (this.keys['q'] || this.keys['a'] || this.keys['arrowleft']) mx -= 1;
        if (this.keys['d'] || this.keys['arrowright']) mx += 1;

        const len = Math.hypot(mx, my);
        if (len > 0) {
            this.player.vx = (mx / len) * this.player.speed;
            this.player.vy = (my / len) * this.player.speed;
        } else if (!this.player.isDashing) {
            this.player.vx = 0;
            this.player.vy = 0;
        }

        this.mouse.worldX = this.mouse.x + this.camera.x;
        this.mouse.worldY = this.mouse.y + this.camera.y;
        this.player.facingAngle = Math.atan2(this.mouse.worldY - this.player.y, this.mouse.worldX - this.player.x);
    }

    update(dt) {
        if (this.state !== 'PLAYING') return;

        // Gestion du Chrono de 60 secondes
        if (this.isTimerActive) {
            const oldSec = Math.floor(this.timeRemaining);
            this.timeRemaining -= dt;
            const newSec = Math.floor(this.timeRemaining);

            if (window.storyEngine) {
                window.storyEngine.checkTimeMilestones(this.timeRemaining);
            }

            // Tic-Tac de pulsation dans les 10 dernières secondes
            if (this.timeRemaining <= 10 && this.timeRemaining > 0 && oldSec !== newSec) {
                if (window.soundEngine) window.soundEngine.playCountdownTick();
            }

            if (this.timeRemaining <= 0) {
                this.timeRemaining = 0;
                this.triggerOneMinuteEnd();
                return;
            }
        }

        // Adapter l'ambiance sonore à la santé de la biosphère
        if (window.soundEngine && this.dungeon) {
            window.soundEngine.setAmbientBiomePurity(this.dungeon.getBiomeHealthPercentage());
        }

        this.handlePlayerMovement();
        this.player.update(dt, this.dungeon);

        if (this.player.hp <= 0) {
            this.triggerGameOver();
            return;
        }

        this.dungeon.update(dt);
        for (const trap of this.dungeon.traps) {
            if (trap.active) {
                const dist = Math.hypot(this.player.x - trap.x, this.player.y - trap.y);
                if (dist < trap.radius) {
                    this.player.takeDamage(12);
                }
            }
        }

        const newProjectiles = [];
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(dt, this.player, this.dungeon, newProjectiles);

            if (enemy.hp <= 0) {
                this.totalKills++;
                this.player.addXp(enemy.xpReward);

                // Dépollution généreuse
                this.dungeon.purifyRadius(enemy.x, enemy.y, 95, 1.0);

                const dropGold = Math.floor(Math.random() * 16) + 12;
                this.lootDrops.push(new LootDrop(enemy.x, enemy.y, 'gold', dropGold));

                if (Math.random() < 0.3) {
                    this.lootDrops.push(new LootDrop(enemy.x + 8, enemy.y, 'potion_health'));
                } else if (Math.random() < 0.25) {
                    this.lootDrops.push(new LootDrop(enemy.x - 8, enemy.y, 'potion_mana'));
                }

                this.enemies.splice(i, 1);
            }
        }

        this.projectiles.push(...newProjectiles);

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            const alive = p.update(dt, this.dungeon);
            if (!alive) {
                this.projectiles.splice(i, 1);
                continue;
            }

            if (p.isPlayerOwned) {
                for (const enemy of this.enemies) {
                    const dist = Math.hypot(p.x - enemy.x, p.y - enemy.y);
                    if (dist < p.radius + enemy.radius) {
                        if (window.particleSystem) {
                            window.particleSystem.addFireExplosion(p.x, p.y, 50);
                        }
                        this.dungeon.purifyRadius(p.x, p.y, 110, 1.0);

                        for (const target of this.enemies) {
                            const aoeDist = Math.hypot(p.x - target.x, p.y - target.y);
                            if (aoeDist < 75) {
                                target.takeDamage(p.damage, false, p.x, p.y);
                            }
                        }
                        this.projectiles.splice(i, 1);
                        break;
                    }
                }
            } else {
                const distToPlayer = Math.hypot(p.x - this.player.x, p.y - this.player.y);
                if (distToPlayer < p.radius + this.player.radius) {
                    this.player.takeDamage(p.damage);
                    if (window.particleSystem) {
                        window.particleSystem.addSparks(p.x, p.y, 10, '#c084fc');
                    }
                    this.projectiles.splice(i, 1);
                }
            }
        }

        for (let i = this.lootDrops.length - 1; i >= 0; i--) {
            const drop = this.lootDrops[i];
            const dist = Math.hypot(this.player.x - drop.x, this.player.y - drop.y);
            if (dist < 26) {
                if (drop.type === 'gold') {
                    this.player.gold += drop.item;
                    if (window.soundEngine) window.soundEngine.playCoin();
                    if (window.particleSystem) window.particleSystem.addFloatingText(`+${drop.item} Matières`, this.player.x, this.player.y - 12, '#10b981');
                } else if (drop.type === 'potion_health') {
                    this.player.potionsHealth++;
                    if (window.soundEngine) window.soundEngine.playCoin();
                    if (window.particleSystem) window.particleSystem.addFloatingText('+1 Bio-Gel', this.player.x, this.player.y - 12, '#34d399');
                } else if (drop.type === 'potion_mana') {
                    this.player.potionsMana++;
                    if (window.soundEngine) window.soundEngine.playCoin();
                    if (window.particleSystem) window.particleSystem.addFloatingText('+1 Pile Solaire', this.player.x, this.player.y - 12, '#38bdf8');
                } else if (drop.type === 'equipment') {
                    if (this.player.inventory.length < 16) {
                        this.player.inventory.push(drop.item);
                        if (window.soundEngine) window.soundEngine.playChestOpen();
                        if (window.particleSystem) window.particleSystem.addFloatingText(drop.item.name, this.player.x, this.player.y - 15, '#10b981', true);
                    }
                }
                this.lootDrops.splice(i, 1);
            }
        }

        if (window.particleSystem) {
            window.particleSystem.update(
                dt * 60,
                this.dungeon.width * this.dungeon.tileSize,
                this.dungeon.height * this.dungeon.tileSize
            );
        }

        // Mettre à jour le chrono dans le HUD
        const timerText = document.getElementById('hud-timer-text');
        const timerBadge = document.getElementById('hud-timer-badge');
        if (timerText && timerBadge) {
            const secs = Math.ceil(this.timeRemaining);
            const m = Math.floor(secs / 60);
            const s = secs % 60;
            timerText.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

            if (secs <= 10) {
                timerBadge.classList.add('timer-critical');
            } else {
                timerBadge.classList.remove('timer-critical');
            }
        }

        if (window.uiManager) {
            window.uiManager.updateHUD(this.player, this.dungeon, this.totalKills);
            window.uiManager.renderMinimap(this.dungeon, this.player, this.enemies);
        }

        const targetCamX = this.player.x - this.camera.width / 2;
        const targetCamY = this.player.y - this.camera.height / 2;
        this.camera.x += (targetCamX - this.camera.x) * 0.12;
        this.camera.y += (targetCamY - this.camera.y) * 0.12;

        const maxCamX = this.dungeon.width * this.dungeon.tileSize - this.camera.width;
        const maxCamY = this.dungeon.height * this.dungeon.tileSize - this.camera.height;
        this.camera.x = Math.max(0, Math.min(maxCamX, this.camera.x));
        this.camera.y = Math.max(0, Math.min(maxCamY, this.camera.y));
    }

    render(time) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.dungeon.draw(this.ctx, this.camera, time);

        for (const drop of this.lootDrops) {
            SpriteRenderer.drawLootDrop(this.ctx, drop, time);
        }

        for (const enemy of this.enemies) {
            SpriteRenderer.drawMonster(this.ctx, enemy, time);
        }

        if (this.player) {
            SpriteRenderer.drawPlayer(this.ctx, this.player, time);
        }

        for (const proj of this.projectiles) {
            const screenProj = { ...proj, x: proj.x - this.camera.x, y: proj.y - this.camera.y };
            SpriteRenderer.drawProjectile(this.ctx, screenProj);
        }

        if (window.particleSystem) {
            window.particleSystem.draw(this.ctx, this.camera);
        }

        this.dungeon.drawLighting(this.ctx, this.camera, this.player, time);
    }

    loop(currentTime) {
        if (!this.lastTime) this.lastTime = currentTime;
        const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
        this.lastTime = currentTime;

        this.update(dt);
        this.render(currentTime / 1000);

        requestAnimationFrame((t) => this.loop(t));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
    window.game.init();
});
