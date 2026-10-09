/**
 * Moteur Narratif Dynamique de 'Terra Nova 2058' - Édition Sprint 60 Secondes
 * Gère l'évolution en temps réel du scénario, les transmissions radio contextuelles,
 * le compte à rebours d'1 minute et la conclusion narrative personnalisée.
 */

class StoryEngine {
    constructor() {
        this.timeline = [];
        this.foundArchives = [];
        this.triggeredMilestones = new Set();
        this.currentRadioMessage = null;
        this.radioTimeout = null;

        this.stats = {
            purityEverAchieved: 0,
            pacifistSporeHeals: 0,
            wasteRecycled: 0,
            machinesNeutralized: 0,
            alignment: 'Harmonie Écologique',
            karma: 15
        };

        this.loreArchives = [
            {
                id: 'archive_2048',
                title: 'Holo-Log 2048 : La Grande Transition',
                author: 'Dr. Marcus Vance (Ancien Directeur)',
                text: '« Les actionnaires ont fui après l\'interdiction des forages profonds. Ils ont laissé les machines allumées en pensant revenir... Personne n\'est jamais revenu. Seuls les drones continuent de creuser dans le vide. Si quelqu\'un trouve ce message : ne détruisez pas tout, recyclez ce qui peut l\'être. »'
            },
            {
                id: 'archive_2052',
                title: 'Note Vocale 2052 : Le Premier Mycélium',
                author: 'Léna Chen (Pionnière Solarpunk)',
                text: '« Les souches de mycélium modifiées ont décomposé 80% des hydrocarbures du canal en seulement six semaines ! La nature ne demande qu\'un coup de pouce pour reprendre ses droits. Il faut juste couper les alimentations des excavatrices. »'
            },
            {
                id: 'archive_2056',
                title: 'Manifeste GAIA-7 : Symbiose 2056',
                author: 'Protocole d\'Éveil GAIA-7',
                text: '« La technologie n\'est pas l\'ennemie de la biosphère. Les panneaux photovoltaïques peuvent abriter les fougères de l\'ardeur du soleil, et les racines stabiliser les fondations des éco-habitats. L\'avenir est symbiotique. »'
            }
        ];
    }

    init() {
        this.addLog('URGENCE 60S : Déploiement éclair dans le complexe pour assainir la zone avant la surchauffe.');
        this.triggerRadio('Dr. Solène Vane', 'URGENCE ÉCOLOGIQUE ! Vous avez exactement 60 secondes pour régénérer un maximum de sol ! En avant !', '⚡', 4000);
    }

    addLog(text) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        this.timeline.unshift({ time, text });
        this.updateStoryUI();
    }

    triggerRadio(speaker, text, avatar = '📻', duration = 4000) {
        this.currentRadioMessage = { speaker, text, avatar };
        const radioBox = document.getElementById('hud-radio-transmission');
        const speakerEl = document.getElementById('radio-speaker');
        const textEl = document.getElementById('radio-text');
        const avatarEl = document.getElementById('radio-avatar');

        if (radioBox && speakerEl && textEl && avatarEl) {
            speakerEl.textContent = speaker;
            textEl.textContent = text;
            avatarEl.textContent = avatar;
            radioBox.classList.remove('hidden');

            if (this.radioTimeout) clearTimeout(this.radioTimeout);
            this.radioTimeout = setTimeout(() => {
                radioBox.classList.add('hidden');
                this.currentRadioMessage = null;
            }, duration);
        }

        if (window.soundEngine) {
            window.soundEngine.playCoin();
        }
    }

    // Alertes narratives dynamiques synchronisées sur le chrono de 60 secondes
    checkTimeMilestones(secondsLeft) {
        if (secondsLeft <= 45 && secondsLeft > 44 && !this.triggeredMilestones.has('time_45')) {
            this.triggeredMilestones.add('time_45');
            this.triggerRadio('Kaelen (Radio)', '45s restantes ! Les spores se propagent à grande vitesse, continuez la floraison !', '🌱', 3000);
        }
        if (secondsLeft <= 30 && secondsLeft > 29 && !this.triggeredMilestones.has('time_30')) {
            this.triggeredMilestones.add('time_30');
            this.triggerRadio('GAIA-7', 'MI-PARCOURS : Les racines solaires s\'étendent. Purifiez les abords des fûts !', '☀️', 3000);
        }
        if (secondsLeft <= 15 && secondsLeft > 14 && !this.triggeredMilestones.has('time_15')) {
            this.triggeredMilestones.add('time_15');
            this.triggerRadio('Dr. Solène Vane', '15 SECONDES ! Déployez toutes vos bio-ondes pour stabiliser la biosphère !', '🚨', 3000);
        }
    }

    checkPurityMilestones(purityPercent, floor) {
        if (purityPercent >= 30 && !this.triggeredMilestones.has(`purity_30_${floor}`)) {
            this.triggeredMilestones.add(`purity_30_${floor}`);
            this.addLog(`Cap des 30% franchi : Les trèfles et mousses sauvages ont envahi le bitume.`);
        }
        if (purityPercent >= 60 && !this.triggeredMilestones.has(`purity_60_${floor}`)) {
            this.triggeredMilestones.add(`purity_60_${floor}`);
            this.addLog(`Cap des 60% franchi : L'air ambiant est purifié. Les papillons réapparaissent.`);
        }
        if (purityPercent >= 90 && !this.triggeredMilestones.has(`purity_90_${floor}`)) {
            this.triggeredMilestones.add(`purity_90_${floor}`);
            this.addLog(`Cap des 90% franchi : BIORÉGÉNÉRATION SOLAIRE QUASI-TOTALE !`);
        }
    }

    discoverRandomArchive() {
        const remaining = this.loreArchives.filter(a => !this.foundArchives.some(fa => fa.id === a.id));
        if (remaining.length > 0) {
            const archive = remaining[0];
            this.foundArchives.push(archive);
            this.addLog(`Archive retrouvée : « ${archive.title} » ajoutée à votre codex.`);
            this.triggerRadio('Codex Solarpunk', `Archive récupérée : « ${archive.title} »`, '📜', 3500);
            return archive;
        }
        return null;
    }

    recordChoice(scenarioId, choiceText, karmaChange, alignmentEffect) {
        this.stats.karma += karmaChange;
        if (alignmentEffect) this.stats.alignment = alignmentEffect;
        this.addLog(`Décision prise : « ${choiceText} »`);
    }

    updateStoryUI() {
        const logContainer = document.getElementById('story-log-list');
        const archivesContainer = document.getElementById('story-archives-list');
        const alignmentEl = document.getElementById('story-alignment-text');
        const karmaEl = document.getElementById('story-karma-text');

        if (alignmentEl) alignmentEl.textContent = this.stats.alignment;
        if (karmaEl) karmaEl.textContent = `${this.stats.karma} pts`;

        if (logContainer) {
            logContainer.innerHTML = '';
            this.timeline.slice(0, 15).forEach(item => {
                const entry = document.createElement('div');
                entry.className = 'story-entry';
                entry.innerHTML = `<span class="story-time">[${item.time}]</span> <span class="story-content">${item.text}</span>`;
                logContainer.appendChild(entry);
            });
        }

        if (archivesContainer) {
            archivesContainer.innerHTML = '';
            if (this.foundArchives.length === 0) {
                archivesContainer.innerHTML = '<div style="color: #64748b; font-style: italic;">Aucune archive découverte. Fouillez les conteneurs !</div>';
            } else {
                this.foundArchives.forEach(arch => {
                    const card = document.createElement('div');
                    card.className = 'archive-card';
                    card.innerHTML = `
                        <div class="archive-card-title">${arch.title}</div>
                        <div class="archive-card-author">${arch.author}</div>
                        <div class="archive-card-text">${arch.text}</div>
                    `;
                    archivesContainer.appendChild(card);
                });
            }
        }
    }
}

window.storyEngine = new StoryEngine();
