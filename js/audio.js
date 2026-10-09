/**
 * Moteur Audio Solarpunk Web Audio API
 * Zéro fichier externe requis - 100% synthétisé en temps réel
 * Comprend :
 * - Ambiance sonore continue (brise de vent, nappe solaire harmonique)
 * - Gazouillis d'oiseaux procéduraux réagissant au taux de dépollution
 * - Gouttes d'eau et ruissellement cristallin
 * - Pulsation cardiaque / tic-tac de tension pour la fin du compte à rebours 60s
 * - Musique et SFX dynamiques
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterVolume = 0.55;
        this.musicVolume = 0.32;
        this.sfxVolume = 0.65;
        this.ambientVolume = 0.38; // Volume de l'ambiance sonore
        this.isMuted = false;

        this.musicInterval = null;
        this.ambientInterval = null;
        this.isBossMusic = false;
        this.stepCount = 0;

        // Nœuds d'ambiance sonore continue
        this.windNode = null;
        this.windGain = null;
        this.droneOsc1 = null;
        this.droneOsc2 = null;
        this.droneGain = null;

        this.biomePurity = 0; // Pureté actuelle (0 à 100)
        this.ambientActive = false;
        this.heartbeatInterval = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        if (!this.ambientActive) {
            this.startAmbientSoundscape();
        }
    }

    setMasterVolume(val) {
        this.masterVolume = Math.max(0, Math.min(1, val));
        this.updateAmbientGains();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.updateAmbientGains();
        return this.isMuted;
    }

    updateAmbientGains() {
        const effGain = this.isMuted ? 0 : this.ambientVolume * this.masterVolume;
        if (this.windGain && this.ctx) {
            this.windGain.gain.setTargetAtTime(effGain * 0.35, this.ctx.currentTime, 0.2);
        }
        if (this.droneGain && this.ctx) {
            this.droneGain.gain.setTargetAtTime(effGain * 0.25, this.ctx.currentTime, 0.2);
        }
    }

    // ==========================================================
    // AMBIANCE SONORE CONTINUE : BRISE DE VENT & NAPPE SOLAIRE
    // ==========================================================
    startAmbientSoundscape() {
        if (!this.ctx || this.ambientActive) return;
        this.ambientActive = true;

        try {
            const now = this.ctx.currentTime;

            // 1. Souffle de vent procédural continu (Bruit rose filtré et modulé)
            const bufferSize = this.ctx.sampleRate * 2;
            const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            let b0 = 0, b1 = 0, b2 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99765 * b0 + white * 0.0990460;
                b1 = 0.96300 * b1 + white * 0.1159260;
                b2 = 0.86650 * b2 + white * 0.2165600;
                output[i] = (b0 + b1 + b2) * 0.18;
            }

            this.windNode = this.ctx.createBufferSource();
            this.windNode.buffer = noiseBuffer;
            this.windNode.loop = true;

            const windFilter = this.ctx.createBiquadFilter();
            windFilter.type = 'bandpass';
            windFilter.frequency.setValueAtTime(320, now);
            windFilter.Q.setValueAtTime(1.8, now);

            // LFO pour faire onduler doucement la brise
            const lfo = this.ctx.createOscillator();
            lfo.frequency.setValueAtTime(0.18, now); // Ondulation lente de 5.5s
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.setValueAtTime(140, now);
            lfo.connect(lfoGain);
            lfoGain.connect(windFilter.frequency);
            lfo.start(now);

            this.windGain = this.ctx.createGain();
            const effGain = this.isMuted ? 0 : this.ambientVolume * this.masterVolume * 0.35;
            this.windGain.gain.setValueAtTime(effGain, now);

            this.windNode.connect(windFilter);
            windFilter.connect(this.windGain);
            this.windGain.connect(this.ctx.destination);
            this.windNode.start(now);

            // 2. Nappe harmonique solaire apaisante (Warm Solar Drone)
            this.droneOsc1 = this.ctx.createOscillator();
            this.droneOsc2 = this.ctx.createOscillator();
            this.droneOsc1.type = 'sine';
            this.droneOsc2.type = 'triangle';
            this.droneOsc1.frequency.setValueAtTime(130.81, now); // C3
            this.droneOsc2.frequency.setValueAtTime(196.00, now); // G3

            const droneFilter = this.ctx.createBiquadFilter();
            droneFilter.type = 'lowpass';
            droneFilter.frequency.setValueAtTime(450, now);

            this.droneGain = this.ctx.createGain();
            const droneEff = this.isMuted ? 0 : this.ambientVolume * this.masterVolume * 0.22;
            this.droneGain.gain.setValueAtTime(droneEff, now);

            this.droneOsc1.connect(droneFilter);
            this.droneOsc2.connect(droneFilter);
            droneFilter.connect(this.droneGain);
            this.droneGain.connect(this.ctx.destination);

            this.droneOsc1.start(now);
            this.droneOsc2.start(now);

            // 3. Boucle d'ambiance vivante : Chants d'oiseaux & Gouttes d'eau
            if (this.ambientInterval) clearInterval(this.ambientInterval);
            this.ambientInterval = setInterval(() => {
                if (this.isMuted || !this.ctx) return;

                // Plus la pureté est élevée, plus les oiseaux chantent souvent !
                const birdChance = 0.25 + (this.biomePurity / 100) * 0.55;
                if (Math.random() < birdChance) {
                    this.playProceduralBirdChirp();
                }

                // Gouttes d'eau cristallines dans les zones restaurées
                if (Math.random() < 0.45) {
                    this.playWaterDrop();
                }
            }, 3200);

        } catch (e) {
            console.warn('Erreur initialisation ambiance sonore:', e);
        }
    }

    // Mise à jour de la pureté du biome pour adapter l'ambiance
    setAmbientBiomePurity(purityPercent) {
        this.biomePurity = Math.max(0, Math.min(100, purityPercent));
    }

    // Gazouillis d'oiseaux procéduraux solarpunk
    playProceduralBirdChirp() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;

        const chirps = Math.floor(Math.random() * 3) + 2;
        const baseFreq = 2400 + Math.random() * 800;

        for (let i = 0; i < chirps; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + i * 0.12 + Math.random() * 0.05;
            const dur = 0.08 + Math.random() * 0.04;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq, startTime);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * (1.3 + Math.random() * 0.3), startTime + dur * 0.5);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, startTime + dur);

            const vol = this.ambientVolume * this.masterVolume * (0.15 + (this.biomePurity / 100) * 0.15);
            gain.gain.setValueAtTime(vol, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + dur);
        }
    }

    // Gouttelette d'eau pure cristalline
    playWaterDrop() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const freq = 1200 + Math.random() * 900;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.08);

        gain.gain.setValueAtTime(this.ambientVolume * this.masterVolume * 0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
    }

    // Battement cardiaque / Tic-Tac de tension pour les 10 dernières secondes
    playCountdownTick() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.1);

        gain.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    // ==========================================================
    // EFFETS SONORES (SFX)
    // ==========================================================

    playSlash() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(1400, now + 0.12);

        gain.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    playHit() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.14);

        gain.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.14);
    }

    playFireball() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.35;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.25);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
    }

    playFrost() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);
            gain.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.35, now + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.45);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.45);
        });
    }

    playDash() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);

        gain.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    playCoin() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.50, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.07);

        gain.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    }

    playChestOpen() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        [587.33, 739.99, 880, 1174.66].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.07);
            gain.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.4, now + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.35);
        });
    }

    playPotion() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.linearRampToValueAtTime(760, now + 0.18);
        osc.frequency.linearRampToValueAtTime(520, now + 0.28);

        gain.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.32);
    }

    playLevelUp() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            gain.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.4, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.5);
        });
    }

    playPlayerHurt() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.18);

        gain.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
    }

    playGameOver() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [440, 392, 349.23, 329.63, 261.63];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.22);
            gain.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.35, now + i * 0.22);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.22 + 0.4);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.22);
            osc.stop(now + i * 0.22 + 0.4);
        });
    }

    // Mélodie arpeggiée Solarpunk
    startMusic(isBoss = false) {
        this.init();
        if (this.musicInterval) clearInterval(this.musicInterval);
        this.isBossMusic = isBoss;
        this.stepCount = 0;

        const solarpunkScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
        const bossIndustrialScale = [110.00, 130.81, 146.83, 164.81, 196.00];

        const tempo = isBoss ? 230 : 340;

        this.musicInterval = setInterval(() => {
            if (this.isMuted || !this.ctx) return;
            const now = this.ctx.currentTime;
            const scale = this.isBossMusic ? bossIndustrialScale : solarpunkScale;

            if (this.stepCount % 4 === 0) {
                const bassOsc = this.ctx.createOscillator();
                const bassGain = this.ctx.createGain();
                const bassFreq = scale[0] / (this.isBossMusic ? 2 : 1.5);
                bassOsc.type = this.isBossMusic ? 'sawtooth' : 'triangle';
                bassOsc.frequency.setValueAtTime(bassFreq, now);

                bassGain.gain.setValueAtTime(this.musicVolume * this.masterVolume * 0.28, now);
                bassGain.gain.exponentialRampToValueAtTime(0.001, now + (tempo / 1000) * 3);

                bassOsc.connect(bassGain);
                bassGain.connect(this.ctx.destination);
                bassOsc.start(now);
                bassOsc.stop(now + (tempo / 1000) * 3);
            }

            if (Math.random() > (this.isBossMusic ? 0.25 : 0.35)) {
                const melOsc = this.ctx.createOscillator();
                const melGain = this.ctx.createGain();
                const noteIndex = Math.floor(Math.random() * scale.length);
                const freq = scale[noteIndex];

                melOsc.type = this.isBossMusic ? 'sawtooth' : 'sine';
                melOsc.frequency.setValueAtTime(freq, now);

                const dur = (tempo / 1000) * 0.85;
                melGain.gain.setValueAtTime(this.musicVolume * this.masterVolume * 0.16, now);
                melGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

                melOsc.connect(melGain);
                melGain.connect(this.ctx.destination);
                melOsc.start(now);
                melOsc.stop(now + dur);
            }

            this.stepCount++;
        }, tempo);
    }

    stopMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
}

window.soundEngine = new SoundEngine();

// Auto-démarrage de l'ambiance sonore au tout premier clic ou interaction
const startAudioOnFirstInteraction = () => {
    if (window.soundEngine) {
        window.soundEngine.init();
    }
    window.removeEventListener('click', startAudioOnFirstInteraction);
    window.removeEventListener('keydown', startAudioOnFirstInteraction);
    window.removeEventListener('touchstart', startAudioOnFirstInteraction);
};
window.addEventListener('click', startAudioOnFirstInteraction);
window.addEventListener('keydown', startAudioOnFirstInteraction);
window.addEventListener('touchstart', startAudioOnFirstInteraction);
