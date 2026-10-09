/**
 * Moteur de Biome et Biorégénération Écologique (Terra Nova 2058)
 * Gère la dépollution en temps réel, l'éclosion de la végétation et les stations solaires
 */

class Dungeon {
    constructor() {
        this.tileSize = 48;
        this.width = 40;
        this.height = 30;
        this.tiles = [];
        this.purity = []; // Pureté de chaque dalle de 0.0 (pollué) à 1.0 (restauré)
        this.floor = 1;
        this.rooms = [];
        this.chests = [];     // Conteneurs de recyclage
        this.breakables = []; // Fûts de déchets chimiques
        this.traps = [];      // Fuites de vapeurs corrosives
        this.torches = [];    // Balises solaires de purification
        this.stairs = { x: 0, y: 0 }; // Tour Solaire / Ascenseur vers le secteur suivant
        this.startPos = { x: 0, y: 0 };
        this.explored = [];
        this.hasKey = false;
        this.totalFloorTiles = 0;
    }

    init(floorNumber = 1) {
        this.floor = floorNumber;
        this.width = floorNumber === 3 ? 32 : 36 + floorNumber * 4;
        this.height = floorNumber === 3 ? 24 : 26 + floorNumber * 2;
        this.tiles = Array(this.height).fill(0).map(() => Array(this.width).fill(2)); // Murs
        this.purity = Array(this.height).fill(0).map(() => Array(this.width).fill(0.0)); // 0 = pollué
        this.explored = Array(this.height).fill(0).map(() => Array(this.width).fill(false));
        this.rooms = [];
        this.chests = [];
        this.breakables = [];
        this.traps = [];
        this.torches = [];
        this.hasKey = false;
        this.totalFloorTiles = 0;

        if (this.floor === 3) {
            this.generateBossArena();
        } else {
            this.generateProceduralBiome();
        }

        // Compter les dalles de sol
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.tiles[y][x] === 1) this.totalFloorTiles++;
            }
        }

        // Balises solaires sur les murs
        this.generateSolarBeacons();
    }

    generateProceduralBiome() {
        const roomCount = 5 + this.floor * 2;
        const minSize = 6;
        const maxSize = 11;

        for (let i = 0; i < roomCount * 4 && this.rooms.length < roomCount; i++) {
            const w = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
            const h = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
            const x = Math.floor(Math.random() * (this.width - w - 4)) + 2;
            const y = Math.floor(Math.random() * (this.height - h - 4)) + 2;

            let overlaps = false;
            for (const r of this.rooms) {
                if (x <= r.x + r.w + 1 && x + w + 1 >= r.x &&
                    y <= r.y + r.h + 1 && y + h + 1 >= r.y) {
                    overlaps = true;
                    break;
                }
            }

            if (!overlaps) {
                const newRoom = { x, y, w, h, cx: Math.floor(x + w / 2), cy: Math.floor(y + h / 2) };
                this.carveRoom(newRoom);
                if (this.rooms.length > 0) {
                    const prev = this.rooms[this.rooms.length - 1];
                    this.carveCorridor(prev.cx, prev.cy, newRoom.cx, newRoom.cy);
                }
                this.rooms.push(newRoom);
            }
        }

        if (this.rooms.length === 0) {
            const main = { x: 3, y: 3, w: this.width - 6, h: this.height - 6, cx: Math.floor(this.width / 2), cy: Math.floor(this.height / 2) };
            this.carveRoom(main);
            this.rooms.push(main);
        }

        // Départ du joueur
        this.startPos = {
            x: this.rooms[0].cx * this.tileSize + this.tileSize / 2,
            y: this.rooms[0].cy * this.tileSize + this.tileSize / 2
        };

        // Tour Solaire Alpha / Passage vers le secteur suivant
        const lastRoom = this.rooms[this.rooms.length - 1];
        this.stairs = {
            x: lastRoom.cx * this.tileSize + this.tileSize / 2,
            y: lastRoom.cy * this.tileSize + this.tileSize / 2
        };

        // Conteneurs de recyclage et fûts toxiques
        for (let i = 1; i < this.rooms.length; i++) {
            const room = this.rooms[i];
            const isKeyRoom = (i === Math.floor(this.rooms.length / 2));
            this.chests.push({
                x: (room.x + 1) * this.tileSize + this.tileSize / 2,
                y: (room.y + 1) * this.tileSize + this.tileSize / 2,
                opened: false,
                isKeyChest: isKeyRoom
            });

            // Fûts de déchets chimiques industriels à décontaminer
            const wasteCount = Math.floor(Math.random() * 3) + 1;
            for (let b = 0; b < wasteCount; b++) {
                this.breakables.push({
                    x: (room.x + 2 + b) * this.tileSize + this.tileSize / 2,
                    y: (room.y + room.h - 2) * this.tileSize + this.tileSize / 2,
                    hp: 1,
                    radius: 16
                });
            }

            // Fuites de vapeurs corrosives
            if (this.floor >= 2 && Math.random() > 0.4) {
                this.traps.push({
                    x: room.cx * this.tileSize + this.tileSize / 2,
                    y: room.cy * this.tileSize + this.tileSize / 2,
                    active: false,
                    timer: Math.random() * 2,
                    radius: 20
                });
            }
        }
    }

    generateBossArena() {
        const arena = {
            x: 4,
            y: 4,
            w: this.width - 8,
            h: this.height - 8,
            cx: Math.floor(this.width / 2),
            cy: Math.floor(this.height / 2)
        };
        this.carveRoom(arena);
        this.rooms.push(arena);

        // Piliers de ventilation de la mégamachine
        const pillars = [
            { x: arena.x + 4, y: arena.y + 4 },
            { x: arena.x + arena.w - 5, y: arena.y + 4 },
            { x: arena.x + 4, y: arena.y + arena.h - 5 },
            { x: arena.x + arena.w - 5, y: arena.y + arena.h - 5 }
        ];

        pillars.forEach(p => {
            this.tiles[p.y][p.x] = 2;
        });

        this.startPos = {
            x: arena.cx * this.tileSize + this.tileSize / 2,
            y: (arena.y + arena.h - 3) * this.tileSize + this.tileSize / 2
        };

        this.stairs = {
            x: arena.cx * this.tileSize + this.tileSize / 2,
            y: (arena.y + 2) * this.tileSize + this.tileSize / 2
        };
    }

    carveRoom(room) {
        for (let y = room.y; y < room.y + room.h; y++) {
            for (let x = room.x; x < room.x + room.w; x++) {
                if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
                    this.tiles[y][x] = 1;
                }
            }
        }
    }

    carveCorridor(x1, y1, x2, y2) {
        let x = x1;
        let y = y1;
        while (x !== x2) {
            this.tiles[y][x] = 1;
            x += (x2 > x) ? 1 : -1;
        }
        while (y !== y2) {
            this.tiles[y][x] = 1;
            y += (y2 > y) ? 1 : -1;
        }
    }

    generateSolarBeacons() {
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (this.tiles[y][x] === 2 && this.tiles[y + 1][x] === 1) {
                    if (Math.random() < 0.2) {
                        this.torches.push({
                            x: x * this.tileSize + this.tileSize / 2,
                            y: y * this.tileSize + this.tileSize * 0.75,
                            flicker: Math.random() * Math.PI
                        });
                    }
                }
            }
        }
    }

    // Dépollution active d'une zone en temps réel
    purifyRadius(pixelX, pixelY, radius = 80, amount = 0.5) {
        const centerTx = Math.floor(pixelX / this.tileSize);
        const centerTy = Math.floor(pixelY / this.tileSize);
        const tileRadius = Math.ceil(radius / this.tileSize);

        for (let ty = centerTy - tileRadius; ty <= centerTy + tileRadius; ty++) {
            for (let tx = centerTx - tileRadius; tx <= centerTx + tileRadius; tx++) {
                if (tx >= 0 && tx < this.width && ty >= 0 && ty < this.height && this.tiles[ty][tx] === 1) {
                    const dist = Math.hypot(tx * this.tileSize + this.tileSize / 2 - pixelX, ty * this.tileSize + this.tileSize / 2 - pixelY);
                    if (dist <= radius) {
                        this.purity[ty][tx] = Math.min(1.0, this.purity[ty][tx] + amount);
                    }
                }
            }
        }
    }

    // Calcul du taux global de restauration de la biosphère
    getBiomeHealthPercentage() {
        if (this.totalFloorTiles === 0) return 0;
        let sum = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.tiles[y][x] === 1) {
                    sum += this.purity[y][x];
                }
            }
        }
        return Math.min(100, Math.round((sum / this.totalFloorTiles) * 100));
    }

    isSolid(pixelX, pixelY, radius = 0) {
        const checkOffsets = [
            { x: 0, y: 0 },
            { x: radius, y: 0 },
            { x: -radius, y: 0 },
            { x: 0, y: radius },
            { x: 0, y: -radius }
        ];

        for (const off of checkOffsets) {
            const tx = Math.floor((pixelX + off.x) / this.tileSize);
            const ty = Math.floor((pixelY + off.y) / this.tileSize);
            if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return true;
            if (this.tiles[ty][tx] === 2) return true;
        }
        return false;
    }

    revealAround(x, y, radiusTiles = 5) {
        const centerTx = Math.floor(x / this.tileSize);
        const centerTy = Math.floor(y / this.tileSize);

        for (let ty = centerTy - radiusTiles; ty <= centerTy + radiusTiles; ty++) {
            for (let tx = centerTx - radiusTiles; tx <= centerTx + radiusTiles; tx++) {
                if (tx >= 0 && tx < this.width && ty >= 0 && ty < this.height) {
                    const dist = Math.hypot(tx - centerTx, ty - centerTy);
                    if (dist <= radiusTiles) {
                        this.explored[ty][tx] = true;
                    }
                }
            }
        }
    }

    update(dt) {
        for (const trap of this.traps) {
            trap.timer += dt;
            if (trap.timer >= 2.5) {
                trap.active = !trap.active;
                trap.timer = 0;
            }
        }
    }

    // Rendu du monde : Transformation visuelle en direct de la pollution vers la nature verdoyante
    draw(ctx, camera, time) {
        const startCol = Math.max(0, Math.floor(camera.x / this.tileSize));
        const endCol = Math.min(this.width - 1, Math.ceil((camera.x + camera.width) / this.tileSize));
        const startRow = Math.max(0, Math.floor(camera.y / this.tileSize));
        const endRow = Math.min(this.height - 1, Math.ceil((camera.y + camera.height) / this.tileSize));

        for (let ty = startRow; ty <= endRow; ty++) {
            for (let tx = startCol; tx <= endCol; tx++) {
                const screenX = tx * this.tileSize - camera.x;
                const screenY = ty * this.tileSize - camera.y;
                const tileType = this.tiles[ty][tx];

                if (tileType === 1) {
                    const purityLevel = this.purity[ty][tx];

                    if (purityLevel < 0.4) {
                        // Sol pollué : Asphalte fissuré, goudron sombre et taches de pétrole
                        ctx.fillStyle = '#1e1b2e'; // Asphalte industriel
                        ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

                        // Fissures toxiques violacées
                        ctx.strokeStyle = '#312e81';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);

                        // Tache d'hydrocarbures
                        if ((tx * 3 + ty * 7) % 4 === 0) {
                            ctx.fillStyle = 'rgba(168, 85, 247, 0.15)'; // Mauve chimique
                            ctx.beginPath();
                            ctx.arc(screenX + 24, screenY + 24, 12, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    } else {
                        // Sol purifié : Herbe verdoyante éclatante Solarpunk !
                        ctx.fillStyle = purityLevel > 0.8 ? '#059669' : '#047857';
                        ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

                        // Tapis de fleurs sauvages écloses (jaunes, bleues et blanches)
                        const seed = (tx * 13 + ty * 19);
                        if (seed % 3 === 0) {
                            const flowerColor = seed % 2 === 0 ? '#fbbf24' : '#38bdf8';
                            ctx.fillStyle = flowerColor;
                            const fx = screenX + (seed % 30) + 8;
                            const fy = screenY + ((seed * 7) % 30) + 8;
                            ctx.beginPath();
                            ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
                            ctx.fill();
                        }

                        // Brins d'herbe frais
                        ctx.strokeStyle = '#34d399';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(screenX + 10, screenY + 20);
                        ctx.lineTo(screenX + 12, screenY + 14);
                        ctx.moveTo(screenX + 32, screenY + 36);
                        ctx.lineTo(screenX + 34, screenY + 30);
                        ctx.stroke();
                    }
                } else if (tileType === 2) {
                    // Structure de soutènement industrielle / murs en béton biomimétique
                    ctx.fillStyle = '#090d16';
                    ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

                    // Revêtement mural
                    ctx.fillStyle = '#1e293b';
                    ctx.fillRect(screenX + 2, screenY + 2, this.tileSize - 4, this.tileSize - 4);

                    // Capteurs solaires muraux
                    ctx.fillStyle = '#065f46';
                    ctx.fillRect(screenX + 4, screenY + 4, this.tileSize - 8, (this.tileSize - 8) / 2);
                }
            }
        }

        // Fuites de vapeurs toxiques (Traps)
        for (const trap of this.traps) {
            const sx = trap.x - camera.x;
            const sy = trap.y - camera.y;
            ctx.fillStyle = '#334155';
            ctx.fillRect(sx - 16, sy - 16, 32, 32);

            if (trap.active) {
                // Nuage de gaz violet/acide
                ctx.fillStyle = 'rgba(168, 85, 247, 0.45)';
                ctx.beginPath();
                ctx.arc(sx, sy, 22 + Math.sin(time * 8) * 4, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.arc(sx, sy, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Tour Solaire Alpha / Ascenseur de Biorégénération
        const stairsSx = this.stairs.x - camera.x;
        const stairsSy = this.stairs.y - camera.y;

        ctx.save();
        ctx.translate(stairsSx, stairsSy);
        ctx.rotate(time * 0.6);
        ctx.strokeStyle = this.hasKey ? '#10b981' : '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = this.hasKey ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.2)';
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.floor === 3 ? '☀️ GAIA-7' : '⚡ TOUR SOLAIRE', stairsSx, stairsSy + 4);

        // Fûts de déchets chimiques industriels (Breakables)
        for (const b of this.breakables) {
            const bx = b.x - camera.x;
            const by = b.y - camera.y;
            ctx.fillStyle = '#475569';
            ctx.beginPath();
            ctx.roundRect(bx - 12, by - 14, 24, 28, 4);
            ctx.fill();
            // Symbole de recyclage vert
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(bx, by, 6, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Conteneurs de recyclage technologique (Chests)
        for (const chest of this.chests) {
            const cx = chest.x - camera.x;
            const cy = chest.y - camera.y;

            if (chest.opened) {
                ctx.fillStyle = '#065f46';
                ctx.fillRect(cx - 14, cy - 6, 28, 16);
                ctx.fillStyle = '#34d399';
                ctx.fillRect(cx - 10, cy - 8, 20, 6);
            } else {
                ctx.fillStyle = chest.isKeyChest ? '#047857' : '#1e293b';
                ctx.beginPath();
                ctx.roundRect(cx - 14, cy - 12, 28, 24, 3);
                ctx.fill();
                ctx.strokeStyle = chest.isKeyChest ? '#34d399' : '#64748b';
                ctx.lineWidth = 2;
                ctx.strokeRect(cx - 14, cy - 12, 28, 24);

                // Diode de batterie solaire
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.arc(cx, cy, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Balises solaires murales
        for (const torch of this.torches) {
            const tx = torch.x - camera.x;
            const ty = torch.y - camera.y;

            ctx.fillStyle = '#334155';
            ctx.fillRect(tx - 3, ty, 6, 12);

            // Lanterne photonique solaire
            const grad = ctx.createRadialGradient(tx, ty - 4, 1, tx, ty - 4, 9);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.4, '#38bdf8');
            grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(tx, ty - 4, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Éclairage Solaire & Halos Photoniques
    drawLighting(ctx, camera, player, time) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';

        const playerSx = player.x - camera.x;
        const playerSy = player.y - camera.y;
        const playerRadius = 150 + Math.sin(time * 4) * 4;

        // Halo de l'Éco-Gardien
        const pGrad = ctx.createRadialGradient(playerSx, playerSy, 20, playerSx, playerSy, playerRadius);
        pGrad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
        pGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.7)');
        pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(playerSx, playerSy, playerRadius, 0, Math.PI * 2);
        ctx.fill();

        // Balises solaires
        for (const t of this.torches) {
            const tsx = t.x - camera.x;
            const tsy = t.y - camera.y;
            const tGrad = ctx.createRadialGradient(tsx, tsy, 10, tsx, tsy, 95);
            tGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
            tGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = tGrad;
            ctx.beginPath();
            ctx.arc(tsx, tsy, 95, 0, Math.PI * 2);
            ctx.fill();
        }

        // Tour Solaire
        const stairsSx = this.stairs.x - camera.x;
        const stairsSy = this.stairs.y - camera.y;
        const sGrad = ctx.createRadialGradient(stairsSx, stairsSy, 10, stairsSx, stairsSy, 80);
        sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
        sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.arc(stairsSx, stairsSy, 80, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

window.Dungeon = Dungeon;
