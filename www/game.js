/**
 * Princess Rescue - Full Featured Game Engine
 * Match-3 Mechanics, Cascade Gravity, Audio Pipeline, Progress Storage & UI Controller
 */

/* ========================================== */
/* 1. OYUN YAPILANDIRMASI VE SABİTLER         */
/* ========================================== */
const GAME_CONFIG = {
    ROWS: 8,
    COLS: 8,
    TOTAL_WORLDS: 5,
    LEVELS_PER_WORLD: 5,
    WIN_SCORE_BASE: 1000,
    TILES_POOL: [
        '01_crown.png', '02_sword.png', '03_shield.png', '04_key.png',
        '05_blue_crystal.png', '06_heart.png', '07_red_rose.png', '08_apple.png',
        '09_magic_scroll.png', '10_lantern.png', '11_magic_potion.png', '12_gold_coin.png',
        '13_star.png', '14_feather.png', '15_magic_orb.png', '16_hourglass.png',
        '17_treasure_chest.png', '18_castle_emblem.png', '19_oak_leaf.png', '20_blue_bird.png',
        '21_ring.png', '22_book.png', '23_helmet.png', '24_crossbow.png',
        '25_campfire.png', '26_magic_flower.png', '27_dragon_egg.png', '28_royal_seal.png',
        '29_golden_harp.png', '30_princess_crown.png'
    ],
    WORLDS_INFO: {
        1: { name: 'Dünya 1: Krallık Ormanı', char: 'assets/characters/fairy_luna.png', dialogue: 'Taşları eşleştirerek ormanın derinliklerine ilerle!' },
        2: { name: 'Dünya 2: Karanlık Mağara', char: 'assets/characters/owl_sage.png', dialogue: 'Karanlıkta yolunu bulmak için fener ve kristalleri kullan!' },
        3: { name: 'Dünya 3: Büyülü Kale', char: 'assets/characters/knight_aras.png', dialogue: 'Morvak’ın muhafızları yaklaşıyor, kılıcını hazırla!' },
        4: { name: 'Dünya 4: Ejderha Kayalığı', char: 'assets/characters/dragon_guardian.png', dialogue: 'Alevlerden kaç ve gizli geçidi aç!' },
        5: { name: 'Dünya 5: Zindan & Kurtarış', char: 'assets/characters/princess_elara.png', dialogue: 'Beni kurtarmak için son engel! Bütün gücünü göster!' }
    }
};

/* ========================================== */
/* 2. GELİŞMİŞ SES YÖNETİCİSİ (AUDIO MANAGER) */
/* ========================================== */
class AudioManager {
    constructor() {
        this.sfxPool = {};
        this.musicVolume = 0.8;
        this.sfxVolume = 1.0;
        this.initSFX();
    }

    initSFX() {
        const soundFiles = [
            'click', 'button', 'match', 'swap', 'combo', 'cascade', 
            'match_4', 'match_5', 'rocket', 'bomb', 'color_bomb', 
            'level_win', 'level_lose', 'daily_reward', 'coin', 'star', 
            'magic', 'unlock', 'purchase', 'error'
        ];

        soundFiles.forEach(file => {
            const audio = new Audio(`sfx/${file}.mp3`);
            audio.preload = 'auto';
            this.sfxPool[file] = audio;
        });
    }

    play(name) {
        if (this.sfxVolume <= 0) return;
        const sound = this.sfxPool[name];
        if (sound) {
            const clone = sound.cloneNode();
            clone.volume = this.sfxVolume;
            clone.play().catch(() => {});
        }
    }

    setMusicVolume(vol) { this.musicVolume = vol / 100; }
    setSFXVolume(vol) { this.sfxVolume = vol / 100; }
}

/* ========================================== */
/* 3. KAYIT VE İLERLEME YÖNETİCİSİ            */
/* ========================================== */
class StorageManager {
    static getProgress() {
        const defaultData = { 
            currentWorld: 1, 
            currentLevel: 1, 
            coins: 500,
            boosters: { hammer: 3, bomb: 1, rainbow: 2 }
        };
        const saved = localStorage.getItem('princess_rescue_save');
        return saved ? JSON.parse(saved) : defaultData;
    }

    static saveProgress(data) {
        localStorage.setItem('princess_rescue_save', JSON.stringify(data));
    }
}

/* ========================================== */
/* 4. MATCH-3 CORE MOTORU (CORE ENGINE)       */
/* ========================================== */
class Match3Engine {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = [];
        this.activePool = [];
    }

    setupWorldPool(worldId) {
        const offset = ((worldId - 1) * 5) % (GAME_CONFIG.TILES_POOL.length - 5);
        this.activePool = GAME_CONFIG.TILES_POOL.slice(offset, offset + 5);
    }

    initGrid() {
        this.grid = [];
        for (let r = 0; r < this.rows; r++) {
            this.grid[r] = [];
            for (let c = 0; c < this.cols; c++) {
                let randomTile;
                do {
                    randomTile = this.getRandomTile();
                } while (this.hasInitialMatch(r, c, randomTile));
                this.grid[r][c] = randomTile;
            }
        }
    }

    getRandomTile() {
        return this.activePool[Math.floor(Math.random() * this.activePool.length)];
    }

    hasInitialMatch(r, c, tile) {
        if (c >= 2 && this.grid[r][c - 1] === tile && this.grid[r][c - 2] === tile) return true;
        if (r >= 2 && this.grid[r - 1][c] === tile && this.grid[r - 2][c] === tile) return true;
        return false;
    }

    swap(r1, c1, r2, c2) {
        const temp = this.grid[r1][c1];
        this.grid[r1][c1] = this.grid[r2][c2];
        this.grid[r2][c2] = temp;
    }

    findMatches() {
        let matched = Array.from({ length: this.rows }, () => Array(this.cols).fill(false));
        let matchCount = 0;

        // Yatay Eşleşme
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols - 2; c++) {
                let matchLen = 1;
                while (c + matchLen < this.cols && this.grid[r][c] && this.grid[r][c] === this.grid[r][c + matchLen]) {
                    matchLen++;
                }
                if (matchLen >= 3) {
                    for (let i = 0; i < matchLen; i++) {
                        if (!matched[r][c + i]) { matched[r][c + i] = true; matchCount++; }
                    }
                }
            }
        }

        // Dikey Eşleşme
        for (let c = 0; c < this.cols; c++) {
            for (let r = 0; r < this.rows - 2; r++) {
                let matchLen = 1;
                while (r + matchLen < this.rows && this.grid[r][c] && this.grid[r][c] === this.grid[r + matchLen][c]) {
                    matchLen++;
                }
                if (matchLen >= 3) {
                    for (let i = 0; i < matchLen; i++) {
                        if (!matched[r + i][c]) { matched[r + i][c] = true; matchCount++; }
                    }
                }
            }
        }

        return { hasMatch: matchCount > 0, matched, count: matchCount };
    }

    applyGravity() {
        for (let c = 0; c < this.cols; c++) {
            let writeRow = this.rows - 1;
            for (let r = this.rows - 1; r >= 0; r--) {
                if (this.grid[r][c] !== null) {
                    this.grid[writeRow][c] = this.grid[r][c];
                    if (writeRow !== r) this.grid[r][c] = null;
                    writeRow--;
                }
            }
            for (let r = writeRow; r >= 0; r--) {
                this.grid[r][c] = this.getRandomTile();
            }
        }
    }
}

/* ========================================== */
/* 5. MASTER OYUN KONTROLÖRÜ (GAME CONTROLLER) */
/* ========================================== */
class GameController {
    constructor() {
        this.audio = new AudioManager();
        this.engine = new Match3Engine(GAME_CONFIG.ROWS, GAME_CONFIG.COLS);
        this.userData = StorageManager.getProgress();

        this.currentWorld = 1;
        this.currentLevel = 1;
        this.movesLeft = 20;
        this.score = 0;
        this.selectedTile = null;
        this.isProcessingMove = false;
        this.activeBooster = null;

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateCurrencies();
        this.simulateLoading();
    }

    simulateLoading() {
        let progress = 0;
        const progressBar = document.getElementById('loading-progress-bar');
        const interval = setInterval(() => {
            progress += 20;
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progress >= 100) {
                clearInterval(interval);
                this.switchScreen('screen-main-menu');
            }
        }, 150);
    }

    bindEvents() {
        // Yardımcı Güvenli Etkinlik Bağlayıcı
        const bind = (id, event, handler) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener(event, handler);
        };

        // Ana Menü
        bind('btn-play-main', 'click', () => {
            this.audio.play('click');
            this.openWorldMap(this.userData.currentWorld);
        });

        bind('btn-open-settings-menu', 'click', () => {
            this.audio.play('button');
            this.toggleModal('modal-settings', true);
        });

        bind('btn-close-settings', 'click', () => {
            this.audio.play('button');
            this.toggleModal('modal-settings', false);
        });

        bind('btn-open-shop', 'click', () => {
            this.audio.play('button');
            this.toggleModal('modal-shop', true);
        });

        bind('btn-close-shop', 'click', () => {
            this.audio.play('button');
            this.toggleModal('modal-shop', false);
        });

        // Harita Navigasyonu
        bind('btn-map-to-menu', 'click', () => {
            this.audio.play('click');
            this.switchScreen('screen-main-menu');
        });

        bind('btn-prev-world', 'click', () => {
            if (this.currentWorld > 1) this.openWorldMap(this.currentWorld - 1);
        });

        bind('btn-next-world', 'click', () => {
            if (this.currentWorld < GAME_CONFIG.TOTAL_WORLDS) this.openWorldMap(this.currentWorld + 1);
        });

        // Oyun İçi HUD
        bind('btn-pause-game', 'click', () => {
            this.audio.play('button');
            this.toggleModal('modal-pause', true);
        });

        bind('btn-resume-game', 'click', () => {
            this.audio.play('button');
            this.toggleModal('modal-pause', false);
        });

        bind('btn-quit-to-map', 'click', () => {
            this.audio.play('button');
            this.toggleModal('modal-pause', false);
            this.openWorldMap(this.currentWorld);
        });

        // Modallar
        bind('btn-win-next', 'click', () => {
            this.audio.play('click');
            this.toggleModal('modal-win', false);
            this.openWorldMap(this.userData.currentWorld);
        });

        bind('btn-lose-retry', 'click', () => {
            this.audio.play('click');
            this.toggleModal('modal-lose', false);
            this.startLevel(this.currentWorld, this.currentLevel);
        });

        // Ses Ayarları Sliders
        bind('slider-sfx', 'input', (e) => {
            this.audio.setSFXVolume(e.target.value);
        });

        bind('slider-music', 'input', (e) => {
            this.audio.setMusicVolume(e.target.value);
        });

        // Günlük Ödül & Mağaza Modalları Düğmeleri
        bind('btn-open-daily', 'click', () => {
            this.audio.play('button');
            this.toggleModal('modal-daily', true);
        });

        bind('btn-close-daily', 'click', () => {
            this.audio.play('button');
            this.toggleModal('modal-daily', false);
        });

        bind('btn-claim-daily', 'click', () => {
            this.audio.play('daily_reward');
            this.userData.coins += 100;
            StorageManager.saveProgress(this.userData);
            this.updateCurrencies();
            this.toggleModal('modal-daily', false);
        });

        // Haritadaki ekstra Ayarlar/Mağaza Düğmeleri
        bind('btn-open-settings-map', 'click', () => {
            this.audio.play('button');
            this.toggleModal('modal-settings', true);
        });

        bind('btn-open-shop-map', 'click', () => {
            this.audio.play('button');
            this.toggleModal('modal-shop', true);
        });

        // Oyun İçi Yeniden Başlat Düğmesi
        bind('btn-restart-game', 'click', () => {
            this.audio.play('button');
            this.toggleModal('modal-pause', false);
            this.startLevel(this.currentWorld, this.currentLevel);
        });

        // Geliştirici / Hile Araçları (Dev Tools)
        bind('btn-dev-win', 'click', () => {
            this.score = GAME_CONFIG.WIN_SCORE_BASE + (this.currentLevel * 100);
            this.toggleModal('modal-pause', false);
            this.checkLevelStatus();
        });

        bind('btn-dev-add-coins', 'click', () => {
            this.userData.coins += 500;
            StorageManager.saveProgress(this.userData);
            this.updateCurrencies();
            this.audio.play('coin');
        });

        bind('btn-reset-progress', 'click', () => {
            if (confirm("Tüm ilerlemeniz sıfırlanacak. Emin misiniz?")) {
                localStorage.removeItem('princess_rescue_save');
                location.reload();
            }
        });

        // Booster Tıklamaları
        document.querySelectorAll('.booster-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const boosterType = e.currentTarget.dataset.booster;
                this.activateBooster(boosterType);
            });
        });
    }

    switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(screenId);
        if (target) target.classList.add('active');
    }

    toggleModal(modalId, show) {
        const modal = document.getElementById(modalId);
        if (modal) {
            if (show) modal.classList.add('active');
            else modal.classList.remove('active');
        }
    }

    updateCurrencies() {
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val;
        };
        const coinsFormatted = this.userData.coins.toLocaleString();
        setVal('menu-coin-count', coinsFormatted);
        setVal('map-coin-count', coinsFormatted);
    }

    openWorldMap(worldId) {
        this.currentWorld = worldId;
        this.switchScreen('screen-world-map');

        const info = GAME_CONFIG.WORLDS_INFO[worldId];
        const titleEl = document.getElementById('world-title-text');
        if (titleEl) titleEl.innerText = info.name;

        const bgLayer = document.getElementById('map-background-layer');
        if (bgLayer) bgLayer.style.backgroundImage = `url('assets/maps/world${worldId}/world${worldId}_bg.png')`;

        this.renderMapNodes(worldId);
    }

    renderMapNodes(worldId) {
        const nodesContainer = document.getElementById('level-nodes-layer');
        if (!nodesContainer) return;
        nodesContainer.innerHTML = '';

        for (let l = 1; l <= GAME_CONFIG.LEVELS_PER_WORLD; l++) {
            const node = document.createElement('div');
            node.className = 'level-node';

            const isUnlocked = (worldId < this.userData.currentWorld) ||
                (worldId === this.userData.currentWorld && l <= this.userData.currentLevel);

            node.innerText = l;
            if (!isUnlocked) {
                node.classList.add('locked');
            } else {
                node.addEventListener('click', () => {
                    this.audio.play('click');
                    this.startLevel(worldId, l);
                });
            }
            nodesContainer.appendChild(node);
        }
    }

    startLevel(worldId, levelId) {
        this.currentWorld = worldId;
        this.currentLevel = levelId;
        this.movesLeft = 20 - (levelId * 2); // Bölüm seviyesine göre hamle zorlaşır
        if (this.movesLeft < 10) this.movesLeft = 10;
        this.score = 0;

        const info = GAME_CONFIG.WORLDS_INFO[worldId];
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val;
        };

        setVal('hud-level-num', `${worldId}-${levelId}`);
        setVal('hud-moves-left', this.movesLeft);
        setVal('hud-score-value', this.score);

        const charImg = document.getElementById('game-character-left');
        if (charImg) charImg.src = info.char;

        const dialogue = document.getElementById('character-dialogue-bubble');
        if (dialogue) dialogue.innerText = info.dialogue;

        this.engine.setupWorldPool(worldId);
        this.engine.initGrid();
        this.switchScreen('screen-gameplay');
        this.renderBoard();
    }

    renderBoard() {
        const gridEl = document.getElementById('grid-board');
        if (!gridEl) return;
        gridEl.innerHTML = '';

        for (let r = 0; r < GAME_CONFIG.ROWS; r++) {
            for (let c = 0; c < GAME_CONFIG.COLS; c++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                const tileImg = this.engine.grid[r][c];
                if (tileImg) {
                    tile.style.backgroundImage = `url('assets/tiles/${tileImg}')`;
                }
                tile.dataset.row = r;
                tile.dataset.col = c;

                tile.addEventListener('click', (e) => this.onTileClick(e));
                gridEl.appendChild(tile);
            }
        }
    }

    async onTileClick(e) {
        if (this.isProcessingMove) return;

        const r = parseInt(e.target.dataset.row);
        const c = parseInt(e.target.dataset.col);

        // Booster Aktifse
        if (this.activeBooster) {
            await this.applyBoosterEffect(r, c);
            return;
        }

        // Standart Taş Seçimi
        if (!this.selectedTile) {
            this.selectedTile = { r, c, el: e.target };
            e.target.classList.add('selected');
            this.audio.play('click');
        } else {
            const prev = this.selectedTile;
            prev.el.classList.remove('selected');
            this.selectedTile = null;

            const isAdjacent = Math.abs(prev.r - r) + Math.abs(prev.c - c) === 1;
            if (isAdjacent) {
                await this.executeMove(prev.r, prev.c, r, c);
            } else {
                this.audio.play('click');
            }
        }
    }

    async executeMove(r1, c1, r2, c2) {
        this.isProcessingMove = true;
        this.engine.swap(r1, c1, r2, c2);
        this.audio.play('swap');
        this.renderBoard();

        let matchResult = this.engine.findMatches();

        if (!matchResult.hasMatch) {
            await new Promise(res => setTimeout(res, 200));
            this.engine.swap(r1, c1, r2, c2);
            this.audio.play('error');
            this.renderBoard();
        } else {
            this.movesLeft--;
            const movesEl = document.getElementById('hud-moves-left');
            if (movesEl) movesEl.innerText = this.movesLeft;
            await this.handleCascades();
            this.checkLevelStatus();
        }
        this.isProcessingMove = false;
    }

    async handleCascades() {
        let cascadeCount = 0;
        let matchResult = this.engine.findMatches();

        while (matchResult.hasMatch) {
            cascadeCount++;
            if (cascadeCount === 1) this.audio.play('match');
            else if (cascadeCount === 2) this.audio.play('combo');
            else this.audio.play('cascade');

            // Eşleşenleri Temizle
            const tiles = document.querySelectorAll('.tile');
            for (let r = 0; r < GAME_CONFIG.ROWS; r++) {
                for (let c = 0; c < GAME_CONFIG.COLS; c++) {
                    if (matchResult.matched[r][c]) {
                        const index = r * GAME_CONFIG.COLS + c;
                        if (tiles[index]) tiles[index].classList.add('matched-pop');
                        this.engine.grid[r][c] = null;
                        this.score += 10 * cascadeCount;
                    }
                }
            }

            const scoreEl = document.getElementById('hud-score-value');
            if (scoreEl) scoreEl.innerText = this.score;
            await new Promise(res => setTimeout(res, 250));

            // Yerçekimi Uygula
            this.engine.applyGravity();
            this.renderBoard();
            await new Promise(res => setTimeout(res, 200));

            matchResult = this.engine.findMatches();
        }
    }

    activateBooster(type) {
        if (this.userData.boosters[type] > 0) {
            this.activeBooster = type;
            this.audio.play('magic');
            alert(`Güçlendirici Aktif: ${type.toUpperCase()}. Lütfen hedef taşı seçin.`);
        } else {
            this.audio.play('error');
            alert("Bu güçlendiriciden elinizde kalmadı!");
        }
    }

    async applyBoosterEffect(r, c) {
        this.isProcessingMove = true;
        this.audio.play('bomb');

        if (this.activeBooster === 'hammer') {
            this.engine.grid[r][c] = null;
        } else if (this.activeBooster === 'bomb') {
            for (let i = Math.max(0, r - 1); i <= Math.min(GAME_CONFIG.ROWS - 1, r + 1); i++) {
                for (let j = Math.max(0, c - 1); j <= Math.min(GAME_CONFIG.COLS - 1, c + 1); j++) {
                    this.engine.grid[i][j] = null;
                }
            }
        }

        this.userData.boosters[this.activeBooster]--;
        this.activeBooster = null;
        StorageManager.saveProgress(this.userData);

        this.engine.applyGravity();
        this.renderBoard();
        await this.handleCascades();
        this.checkLevelStatus();
        this.isProcessingMove = false;
    }

    checkLevelStatus() {
        const targetScore = GAME_CONFIG.WIN_SCORE_BASE + (this.currentLevel * 100);

        if (this.score >= targetScore) {
            this.audio.play('level_win');
            this.userData.coins += 50;
            this.unlockNextLevel();
            this.updateCurrencies();
            this.toggleModal('modal-win', true);
        } else if (this.movesLeft <= 0) {
            this.audio.play('level_lose');
            this.toggleModal('modal-lose', true);
        }
    }

    unlockNextLevel() {
        if (this.currentWorld === this.userData.currentWorld && this.currentLevel === this.userData.currentLevel) {
            if (this.currentLevel < GAME_CONFIG.LEVELS_PER_WORLD) {
                this.userData.currentLevel++;
            } else if (this.currentWorld < GAME_CONFIG.TOTAL_WORLDS) {
                this.userData.currentWorld++;
                this.userData.currentLevel = 1;
            }
            StorageManager.saveProgress(this.userData);
        }
    }
}

// Oyunu Başlat
window.addEventListener('DOMContentLoaded', () => {
    window.gameApp = new GameController();
});
