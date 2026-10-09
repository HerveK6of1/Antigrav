/**
 * Gestionnaire d'Interface Utilisateur & Système Narratif Interactif
 * Gère les choix de dialogues multiples, le taux de restauration du biome, l'éco-inventaire
 * et le Journal de Bord Narratif Évolutif (Chronique Vivante de Terra Nova)
 */

class UIManager {
    constructor() {
        this.isDialogueActive = false;
        this.typewriterInterval = null;
        this.currentScenario = null;
    }

    init() {
        const invBtn = document.getElementById('inventory-toggle-btn');
        const closeInvBtn = document.getElementById('close-inventory-btn');
        if (invBtn) invBtn.addEventListener('click', () => this.toggleInventory());
        if (closeInvBtn) closeInvBtn.addEventListener('click', () => this.closeInventory());

        // Bouton Journal Narratif / Chronique Vivante
        const journalBtn = document.getElementById('journal-toggle-btn');
        const closeJournalBtn = document.getElementById('close-journal-btn');
        if (journalBtn) journalBtn.addEventListener('click', () => this.toggleJournal());
        if (closeJournalBtn) closeJournalBtn.addEventListener('click', () => this.closeJournal());

        // Onglets du Journal Narratif
        const tabLog = document.getElementById('tab-btn-log');
        const tabArchives = document.getElementById('tab-btn-archives');
        const viewLog = document.getElementById('journal-view-log');
        const viewArchives = document.getElementById('journal-view-archives');

        if (tabLog && tabArchives && viewLog && viewArchives) {
            tabLog.addEventListener('click', () => {
                tabLog.classList.add('active-tab');
                tabArchives.classList.remove('active-tab');
                viewLog.classList.remove('hidden');
                viewArchives.classList.add('hidden');
            });
            tabArchives.addEventListener('click', () => {
                tabArchives.classList.add('active-tab');
                tabLog.classList.remove('active-tab');
                viewArchives.classList.remove('hidden');
                viewLog.classList.add('hidden');
            });
        }

        const muteBtn = document.getElementById('audio-toggle-btn');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                if (window.soundEngine) {
                    const muted = window.soundEngine.toggleMute();
                    muteBtn.innerHTML = muted ? '🔇' : '🔊';
                }
            });
        }

        const helpBtn = document.getElementById('help-toggle-btn');
        const helpModal = document.getElementById('help-modal');
        const closeHelpBtn = document.getElementById('close-help-btn');
        if (helpBtn && helpModal) {
            helpBtn.addEventListener('click', () => helpModal.classList.toggle('hidden'));
        }
        if (closeHelpBtn && helpModal) {
            closeHelpBtn.addEventListener('click', () => helpModal.classList.add('hidden'));
        }

        if (window.storyEngine) window.storyEngine.init();
    }

    updateHUD(player, dungeon, totalKills = 0) {
        // Barre de vie (PV)
        const hpBar = document.getElementById('hud-hp-bar');
        const hpText = document.getElementById('hud-hp-text');
        if (hpBar && hpText) {
            const hpPercent = Math.max(0, Math.min(100, (player.hp / player.totalMaxHp) * 100));
            hpBar.style.width = `${hpPercent}%`;
            hpText.textContent = `${Math.ceil(player.hp)} / ${player.totalMaxHp}`;
        }

        // Bio-Énergie Solaire (PM)
        const mpBar = document.getElementById('hud-mp-bar');
        const mpText = document.getElementById('hud-mp-text');
        if (mpBar && mpText) {
            const mpPercent = Math.max(0, Math.min(100, (player.mp / player.totalMaxMp) * 100));
            mpBar.style.width = `${mpPercent}%`;
            mpText.textContent = `${Math.ceil(player.mp)} / ${player.totalMaxMp}`;
        }

        // Niveau et Bio-Data (XP)
        const xpBar = document.getElementById('hud-xp-bar');
        const levelBadge = document.getElementById('hud-level-badge');
        if (xpBar && levelBadge) {
            const xpPercent = Math.max(0, Math.min(100, (player.xp / player.xpNeeded) * 100));
            xpBar.style.width = `${xpPercent}%`;
            levelBadge.textContent = `Niv. ${player.level}`;
        }

        // Éco-Crédits et Karma
        const goldCount = document.getElementById('hud-gold-count');
        const keyIndicator = document.getElementById('hud-key-indicator');
        if (goldCount) goldCount.textContent = `${player.gold}`;
        if (keyIndicator) {
            if (dungeon.hasKey) keyIndicator.classList.remove('hidden');
            else keyIndicator.classList.add('hidden');
        }

        // Taux de Biorégénération du Biome en temps réel !
        const biomeHealthPct = dungeon.getBiomeHealthPercentage();
        const biomeFill = document.getElementById('hud-biome-fill');
        const biomeText = document.getElementById('hud-biome-text');
        if (biomeFill && biomeText) {
            biomeFill.style.width = `${biomeHealthPct}%`;
            biomeText.textContent = `Pureté : ${biomeHealthPct}%`;
        }

        // Vérification dynamique des étapes narratives franchies
        if (window.storyEngine) {
            window.storyEngine.checkPurityMilestones(biomeHealthPct, dungeon.floor);
        }

        // Potions (Bio-Gels et Piles Solaires)
        const potHpBadge = document.getElementById('potion-hp-count');
        const potMpBadge = document.getElementById('potion-mp-count');
        if (potHpBadge) potHpBadge.textContent = `${player.potionsHealth}`;
        if (potMpBadge) potMpBadge.textContent = `${player.potionsMana}`;

        // Cooldowns
        const dashCd = document.getElementById('spell-dash-cd');
        const fireCd = document.getElementById('spell-fire-cd');
        const frostCd = document.getElementById('spell-frost-cd');
        if (dashCd) dashCd.style.height = `${Math.max(0, (player.dashCooldown / 0.85) * 100)}%`;
        if (fireCd) fireCd.style.height = `${Math.max(0, (player.fireballCooldown / 0.55) * 100)}%`;
        if (frostCd) frostCd.style.height = `${Math.max(0, (player.frostNovaCooldown / 3.5) * 100)}%`;

        // Quête Écologique Active
        const questTitle = document.getElementById('quest-title');
        const questObj = document.getElementById('quest-objective');
        const questData = window.ECO_QUESTS ? window.ECO_QUESTS[dungeon.floor - 1] : null;
        if (questTitle && questObj && questData) {
            questTitle.textContent = questData.title;
            questObj.textContent = questData.objective;
        }

        // Boss Bar Smog-Titan
        const bossContainer = document.getElementById('boss-bar-container');
        if (bossContainer) {
            if (dungeon.floor === 3 && window.game && window.game.bossEnemy && window.game.bossEnemy.hp > 0) {
                bossContainer.classList.remove('hidden');
                const boss = window.game.bossEnemy;
                const bossFill = document.getElementById('boss-hp-bar');
                const bossHpText = document.getElementById('boss-hp-text');
                if (bossFill && bossHpText) {
                    const bossPct = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));
                    bossFill.style.width = `${bossPct}%`;
                    bossHpText.textContent = `${Math.ceil(boss.hp)} / ${boss.maxHp}`;
                }
            } else {
                bossContainer.classList.add('hidden');
            }
        }
    }

    renderMinimap(dungeon, player, enemies) {
        const miniCanvas = document.getElementById('minimap-canvas');
        if (!miniCanvas) return;
        const mctx = miniCanvas.getContext('2d');
        const mw = miniCanvas.width;
        const mh = miniCanvas.height;

        mctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        mctx.fillRect(0, 0, mw, mh);

        const tileScaleX = mw / dungeon.width;
        const tileScaleY = mh / dungeon.height;

        for (let y = 0; y < dungeon.height; y++) {
            for (let x = 0; x < dungeon.width; x++) {
                if (dungeon.explored[y][x]) {
                    if (dungeon.tiles[y][x] === 1) {
                        mctx.fillStyle = dungeon.purity[y][x] >= 0.5 ? '#059669' : '#334155';
                        mctx.fillRect(x * tileScaleX, y * tileScaleY, tileScaleX, tileScaleY);
                    } else if (dungeon.tiles[y][x] === 2) {
                        mctx.fillStyle = '#0f172a';
                        mctx.fillRect(x * tileScaleX, y * tileScaleY, tileScaleX, tileScaleY);
                    }
                }
            }
        }

        const sx = (dungeon.stairs.x / dungeon.tileSize) * tileScaleX;
        const sy = (dungeon.stairs.y / dungeon.tileSize) * tileScaleY;
        mctx.fillStyle = dungeon.hasKey ? '#10b981' : '#f59e0b';
        mctx.beginPath();
        mctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
        mctx.fill();

        for (const e of enemies) {
            const ex = (e.x / dungeon.tileSize) * tileScaleX;
            const ey = (e.y / dungeon.tileSize) * tileScaleY;
            const tx = Math.floor(e.x / dungeon.tileSize);
            const ty = Math.floor(e.y / dungeon.tileSize);

            if (tx >= 0 && tx < dungeon.width && ty >= 0 && ty < dungeon.height && dungeon.explored[ty][tx]) {
                mctx.fillStyle = e.type === 'boss' ? '#ef4444' : '#f87171';
                mctx.beginPath();
                mctx.arc(ex, ey, e.type === 'boss' ? 4 : 2, 0, Math.PI * 2);
                mctx.fill();
            }
        }

        const px = (player.x / dungeon.tileSize) * tileScaleX;
        const py = (player.y / dungeon.tileSize) * tileScaleY;
        mctx.fillStyle = '#38bdf8';
        mctx.beginPath();
        mctx.arc(px, py, 3.5, 0, Math.PI * 2);
        mctx.fill();
    }

    // ==========================================================
    // SYSTÈME DE DIALOGUE NARRATIF INTERACTIF À CHOIX MULTIPLES
    // ==========================================================
    showInteractiveDialogue(scenario) {
        if (!scenario) return;
        this.currentScenario = scenario;
        this.isDialogueActive = true;

        const box = document.getElementById('dialogue-box');
        const speakerElem = document.getElementById('dialogue-speaker');
        const textElem = document.getElementById('dialogue-text');
        const choicesContainer = document.getElementById('dialogue-choices');

        if (!box || !speakerElem || !textElem || !choicesContainer) return;

        box.classList.remove('hidden');
        speakerElem.textContent = scenario.speaker;
        textElem.textContent = '';
        choicesContainer.innerHTML = '';
        choicesContainer.classList.add('hidden');

        if (this.typewriterInterval) clearInterval(this.typewriterInterval);

        let charIdx = 0;
        this.typewriterInterval = setInterval(() => {
            if (charIdx < scenario.text.length) {
                textElem.textContent += scenario.text[charIdx];
                charIdx++;
            } else {
                clearInterval(this.typewriterInterval);
                this.renderDialogueChoices(scenario.choices);
            }
        }, 16);
    }

    renderDialogueChoices(choices) {
        const choicesContainer = document.getElementById('dialogue-choices');
        if (!choicesContainer || !choices) return;
        choicesContainer.innerHTML = '';
        choicesContainer.classList.remove('hidden');

        choices.forEach((choice) => {
            const btn = document.createElement('button');
            btn.className = 'dialogue-choice-btn';
            btn.innerHTML = choice.text;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleChoiceSelection(choice);
            });
            choicesContainer.appendChild(btn);
        });
    }

    handleChoiceSelection(choice) {
        const player = window.game ? window.game.player : null;
        if (player) {
            if (choice.karma) player.karma = (player.karma || 0) + choice.karma;
            if (choice.bonus) {
                if (choice.bonus.type === 'mp') player.restoreMp(choice.bonus.amount);
                if (choice.bonus.type === 'xp') player.addXp(choice.bonus.amount);
                if (choice.bonus.type === 'gold') player.gold += choice.bonus.amount;
            }
        }

        // Enregistrer dans le moteur narratif dynamique
        if (window.storyEngine && this.currentScenario) {
            const align = choice.karma > 12 ? 'Symbiose Totale' : 'Pragmatisme Écologique';
            window.storyEngine.recordChoice(this.currentScenario.id, choice.text, choice.karma || 0, align);
        }

        const textElem = document.getElementById('dialogue-text');
        const choicesContainer = document.getElementById('dialogue-choices');
        if (choicesContainer) choicesContainer.classList.add('hidden');

        if (textElem && choice.response) {
            textElem.innerHTML = `<em>${choice.response}</em>`;
            setTimeout(() => this.closeDialogue(), 2600);
        } else {
            this.closeDialogue();
        }
    }

    closeDialogue() {
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
        }
        const box = document.getElementById('dialogue-box');
        if (box) box.classList.add('hidden');
        this.isDialogueActive = false;
        this.currentScenario = null;
    }

    // Journal Narratif / Chronique Vivante
    toggleJournal() {
        const modal = document.getElementById('journal-modal');
        if (!modal) return;
        if (modal.classList.contains('hidden')) this.openJournal();
        else this.closeJournal();
    }

    openJournal() {
        const modal = document.getElementById('journal-modal');
        if (modal) modal.classList.remove('hidden');
        if (window.storyEngine) window.storyEngine.updateStoryUI();
    }

    closeJournal() {
        const modal = document.getElementById('journal-modal');
        if (modal) modal.classList.add('hidden');
    }

    // Inventaire
    toggleInventory() {
        const modal = document.getElementById('inventory-modal');
        if (!modal) return;
        if (modal.classList.contains('hidden')) this.openInventory();
        else this.closeInventory();
    }

    openInventory() {
        const modal = document.getElementById('inventory-modal');
        if (modal) modal.classList.remove('hidden');
        this.refreshInventoryUI();
    }

    closeInventory() {
        const modal = document.getElementById('inventory-modal');
        if (modal) modal.classList.add('hidden');
    }

    refreshInventoryUI() {
        const player = window.game ? window.game.player : null;
        if (!player) return;

        this.setupEquipmentSlot(document.getElementById('equip-weapon-slot'), player.equipment.weapon, 'weapon');
        this.setupEquipmentSlot(document.getElementById('equip-armor-slot'), player.equipment.armor, 'armor');
        this.setupEquipmentSlot(document.getElementById('equip-relic-slot'), player.equipment.relic, 'relic');

        const statsAtk = document.getElementById('inv-stat-atk');
        const statsDef = document.getElementById('inv-stat-def');
        const statsHp = document.getElementById('inv-stat-hp');
        const statsMp = document.getElementById('inv-stat-mp');

        if (statsAtk) statsAtk.textContent = `${player.totalAtk}`;
        if (statsDef) statsDef.textContent = `${player.totalDef}`;
        if (statsHp) statsHp.textContent = `${player.totalMaxHp}`;
        if (statsMp) statsMp.textContent = `${player.totalMaxMp}`;

        const grid = document.getElementById('inventory-grid');
        if (!grid) return;
        grid.innerHTML = '';

        for (let i = 0; i < 16; i++) {
            const item = player.inventory[i];
            const slot = document.createElement('div');
            slot.className = 'inventory-slot' + (item ? ` item-${item.rarity}` : ' empty-slot');

            if (item) {
                slot.innerHTML = `
                    <div class="item-name">${item.name}</div>
                    <div class="item-meta">${item.type.toUpperCase()}</div>
                `;
                slot.addEventListener('click', () => this.equipItem(i));
                slot.addEventListener('mouseenter', () => this.showItemDetails(item));
            } else {
                slot.innerHTML = `<span class="empty-label">+</span>`;
            }
            grid.appendChild(slot);
        }
    }

    setupEquipmentSlot(elem, item, type) {
        if (!elem) return;
        if (item) {
            elem.className = `equipment-slot equipped item-${item.rarity}`;
            elem.innerHTML = `
                <div class="slot-title">${item.name}</div>
                <div class="slot-stats">${this.formatItemStats(item)}</div>
            `;
            elem.onclick = () => this.unequipItem(type);
            elem.onmouseenter = () => this.showItemDetails(item);
        } else {
            elem.className = 'equipment-slot empty';
            elem.innerHTML = `<div class="slot-title">[Module : ${type}]</div>`;
            elem.onclick = null;
        }
    }

    formatItemStats(item) {
        const stats = [];
        if (item.atk) stats.push(`+${item.atk} ATK`);
        if (item.def) stats.push(`+${item.def} DEF`);
        if (item.hp) stats.push(`+${item.hp} PV`);
        if (item.mp) stats.push(`+${item.mp} PM`);
        return stats.join(' | ');
    }

    showItemDetails(item) {
        const descPanel = document.getElementById('item-details-panel');
        if (!descPanel) return;
        descPanel.innerHTML = `
            <div class="detail-header item-${item.rarity}">
                <span class="detail-name">${item.name}</span>
                <span class="detail-rarity">${item.rarity.toUpperCase()}</span>
            </div>
            <div class="detail-stats">${this.formatItemStats(item)}</div>
            <div class="detail-desc">${item.desc}</div>
        `;
    }

    equipItem(index) {
        const player = window.game ? window.game.player : null;
        if (!player || !player.inventory[index]) return;

        const item = player.inventory[index];
        const oldEquipped = player.equipment[item.type];

        player.equipment[item.type] = item;
        if (oldEquipped) player.inventory[index] = oldEquipped;
        else player.inventory.splice(index, 1);

        if (window.soundEngine) window.soundEngine.playCoin();
        this.refreshInventoryUI();
    }

    unequipItem(type) {
        const player = window.game ? window.game.player : null;
        if (!player || !player.equipment[type]) return;

        if (player.inventory.length < 16) {
            player.inventory.push(player.equipment[type]);
            player.equipment[type] = null;
            if (window.soundEngine) window.soundEngine.playCoin();
            this.refreshInventoryUI();
        }
    }

    showGameOver(stats) {
        const modal = document.getElementById('gameover-modal');
        if (!modal) return;
        modal.classList.remove('hidden');

        document.getElementById('gameover-floor').textContent = `Secteur atteint : ${stats.floor}`;
        document.getElementById('gameover-kills').textContent = `Machines neutralisées : ${stats.kills}`;
        document.getElementById('gameover-gold').textContent = `Matières recyclées : ${stats.gold}`;
    }

    showVictory(stats) {
        const modal = document.getElementById('victory-modal');
        if (!modal) return;
        modal.classList.remove('hidden');

        document.getElementById('victory-level').textContent = `Niveau de Biorégénération : ${stats.level}`;
        document.getElementById('victory-kills').textContent = `Machines dépolluées : ${stats.kills}`;
        document.getElementById('victory-gold').textContent = `Éco-Crédits finaux : ${stats.gold}`;
    }
}

window.uiManager = new UIManager();
