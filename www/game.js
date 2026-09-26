/**
 * Princess Rescue
 * 6x6 Match-3
 * 5 Dünya / 5 Bölüm
 * Günlük Ödül + Elmas + Hazine
 * Booster Mağazası
 * Karakter Seçimi
 * Asset tabanlı UI
 */

const GAME_CONFIG = {

    ROWS: 6,
    COLS: 6,

    TOTAL_WORLDS: 5,
    LEVELS_PER_WORLD: 5,

    DAILY_COIN_REWARD: 100,
    DAILY_DIAMOND_REWARD: 1,

    TREASURE_COST: 10,
    TREASURE_REWARD: 1000,

    DAILY_PURCHASE_LIMIT: 5,

    LEVEL_REWARD: 50,

    TILES_POOL: [
        "01_crown.png",
        "02_sword.png",
        "03_shield.png",
        "04_key.png",
        "05_blue_crystal.png",
        "06_heart.png",
        "07_red_rose.png",
        "08_apple.png",
        "09_magic_scroll.png",
        "10_lantern.png",
        "11_magic_potion.png",
        "12_gold_coin.png",
        "13_star.png",
        "14_feather.png",
        "15_magic_orb.png",
        "16_hourglass.png",
        "17_treasure_chest.png",
        "18_castle_emblem.png",
        "19_oak_leaf.png",
        "20_blue_bird.png",
        "21_ring.png",
        "22_book.png",
        "23_helmet.png",
        "24_crossbow.png",
        "25_campfire.png",
        "26_magic_flower.png",
        "27_dragon_egg.png",
        "28_royal_seal.png",
        "29_golden_harp.png",
        "30_princess_crown.png"
    ],

    WORLDS_INFO: {

        1: {
            name: "Dünya 1: Krallık Ormanı",
            bg: "assets/maps/world1/world1_bg.png",
            map: "assets/maps/world1/world1_map.png",
            guide: "fairy_luna.png",
            dialogue: "Aynı sembollerden üç veya daha fazlasını eşleştir!"
        },

        2: {
            name: "Dünya 2: Karanlık Mağara",
            bg: "assets/maps/world2/world2_bg.png",
            map: "assets/maps/world2/world2_map.png",
            guide: "owl_sage.png",
            dialogue: "Yolu açmak için eşleşmeleri tamamla!"
        },

        3: {
            name: "Dünya 3: Büyülü Kale",
            bg: "assets/maps/world3/world3_bg.png",
            map: "assets/maps/world3/world3_map.png",
            guide: "knight_aras.png",
            dialogue: "Hedefe ulaşmak için mümkün olduğunca çok eşleşme yap!"
        },

        4: {
            name: "Dünya 4: Ejderha Kayalığı",
            bg: "assets/maps/world4/world4_bg.png",
            map: "assets/maps/world4/world4_map.png",
            guide: "dragon_guardian.png",
            dialogue: "Daha büyük eşleşmeler daha fazla puan getirir!"
        },

        5: {
            name: "Dünya 5: Zindan & Kurtarış",
            bg: "assets/maps/world5/world5_bg.png",
            map: "assets/maps/world5/world5_map.png",
            guide: "king_alaric.png",
            dialogue: "Son engelleri aş ve Elara'ya ulaş!"
        }
    },

    CHARACTERS: [
        {
            id: "knight_aras",
            name: "Knight Aras",
            image: "assets/characters/knight_aras.png"
        },
        {
            id: "prince_kael",
            name: "Prince Kael",
            image: "assets/characters/prince_kael.png"
        },
        {
            id: "king_alaric",
            name: "King Alaric",
            image: "assets/characters/king_alaric.png"
        },
        {
            id: "dragon_guardian",
            name: "Dragon Guardian",
            image: "assets/characters/dragon_guardian.png"
        },
        {
            id: "fairy_luna",
            name: "Fairy Luna",
            image: "assets/characters/fairy_luna.png"
        },
        {
            id: "owl_sage",
            name: "Owl Sage",
            image: "assets/characters/owl_sage.png"
        }
    ],

    BOOSTERS: {
        hammer: {
            name: "Hammer",
            image: "assets/ui/booster_hammer.png",
            cost: 100,
            sound: "magic"
        },

        bomb: {
            name: "Bomb",
            image: "assets/ui/booster_bomb.png",
            cost: 150,
            sound: "bomb"
        },

        color_bomb: {
            name: "Color Bomb",
            image: "assets/ui/booster_color_bomb.png",
            cost: 200,
            sound: "color_bomb"
        },

        star: {
            name: "Booster Star",
            image: "assets/ui/booster_star.png",
            cost: 250,
            sound: "star"
        }
    }
};


/* ========================================== */
/* AUDIO */
/* ========================================== */

class AudioManager {

    constructor() {

        this.sfxVolume = 1;

        this.sfxPool = {};

        this.init();
    }

    init() {

        const files = [
            "bomb",
            "button",
            "cascade",
            "click",
            "coin",
            "color_bomb",
            "combo",
            "daily_reward",
            "error",
            "level_lose",
            "level_win",
            "magic",
            "match",
            "match_4",
            "match_5",
            "purchase",
            "rocket",
            "star",
            "swap",
            "unlock"
        ];

        files.forEach(name => {

            const audio = new Audio(`sfx/${name}.mp3`);

            audio.preload = "auto";

            this.sfxPool[name] = audio;
        });
    }

    play(name) {

        if (this.sfxVolume <= 0) {
            return;
        }

        const original = this.sfxPool[name];

        if (!original) {
            return;
        }

        const sound = original.cloneNode();

        sound.volume = this.sfxVolume;

        sound.play().catch(() => {});
    }

    playMatch(count) {

        if (count >= 5) {
            this.play("match_5");
        }
        else if (count === 4) {
            this.play("match_4");
        }
        else {
            this.play("match");
        }
    }

    setSFXVolume(value) {

        const numeric = Number(value);

        this.sfxVolume = Math.max(
            0,
            Math.min(1, numeric / 100)
        );
    }
}


/* ========================================== */
/* STORAGE */
/* ========================================== */

class StorageManager {

    static defaultData() {

        return {

            currentWorld: 1,

            currentLevel: 1,

            coins: 500,

            diamonds: 0,

            boosters: {
                hammer: 3,
                bomb: 1,
                color_bomb: 1,
                star: 1
            },

            daily: {
                lastClaimDate: null,
                treasureProgress: 0
            },

            dailyPurchases: {
                date: null,
                hammer: 0,
                bomb: 0,
                color_bomb: 0,
                star: 0
            },

            selectedCharacter: "knight_aras",

            characterSelected: false,

            completedLevels: {},

            stars: {},

            settings: {
                sfxVolume: 100
            }
        };
    }


    static getProgress() {

        const defaults = this.defaultData();

        let saved = null;

        try {

            const raw = localStorage.getItem(
                "princess_rescue_save"
            );

            if (raw) {
                saved = JSON.parse(raw);
            }

        }
        catch (error) {

            console.warn(
                "Kayıt okunamadı:",
                error
            );
        }

        if (!saved || typeof saved !== "object") {
            return defaults;
        }

        const data = {

            ...defaults,
            ...saved,

            boosters: {
                ...defaults.boosters,
                ...(saved.boosters || {})
            },

            daily: {
                ...defaults.daily,
                ...(saved.daily || {})
            },

            dailyPurchases: {
                ...defaults.dailyPurchases,
                ...(saved.dailyPurchases || {})
            },

            settings: {
                ...defaults.settings,
                ...(saved.settings || {})
            },

            completedLevels: {
                ...defaults.completedLevels,
                ...(saved.completedLevels || {})
            },

            stars: {
                ...defaults.stars,
                ...(saved.stars || {})
            }
        };

        /*
         * Eski sürümde rainbow kullanıldıysa
         * color_bomb'a taşı.
         */
        if (
            saved.boosters &&
            saved.boosters.rainbow !== undefined &&
            saved.boosters.color_bomb === undefined
        ) {

            data.boosters.color_bomb =
                Number(saved.boosters.rainbow) || 0;
        }

        return data;
    }


    static saveProgress(data) {

        try {

            localStorage.setItem(
                "princess_rescue_save",
                JSON.stringify(data)
            );

        }
        catch (error) {

            console.warn(
                "Kayıt yazılamadı:",
                error
            );
        }
    }
}


/* ========================================== */
/* MATCH ENGINE */
/* ========================================== */

class Match3Engine {

    constructor(rows, cols) {

        this.rows = rows;

        this.cols = cols;

        this.grid = [];

        this.activePool = [];
    }


    setupWorldPool(worldId) {

        /*
         * 30 taş = 5 dünya x 6 taş.
         * Her dünya kendi 6 taşlık grubunu kullanır.
         */

        const worldIndex = Math.max(
            0,
            Math.min(
                GAME_CONFIG.TOTAL_WORLDS - 1,
                worldId - 1
            )
        );

        const start = worldIndex * 6;

        this.activePool =
            GAME_CONFIG.TILES_POOL.slice(
                start,
                start + 6
            );

        if (this.activePool.length < 6) {

            this.activePool =
                GAME_CONFIG.TILES_POOL.slice(0, 6);
        }
    }


    getRandomTile() {

        return this.activePool[
            Math.floor(
                Math.random() *
                this.activePool.length
            )
        ];
    }


    initGrid() {

        let attempts = 0;

        do {

            this.grid = [];

            for (
                let r = 0;
                r < this.rows;
                r++
            ) {

                this.grid[r] = [];

                for (
                    let c = 0;
                    c < this.cols;
                    c++
                ) {

                    let tile;

                    do {

                        tile = this.getRandomTile();

                    }
                    while (
                        this.hasInitialMatch(
                            r,
                            c,
                            tile
                        )
                    );

                    this.grid[r][c] = tile;
                }
            }

            attempts++;

        }
        while (
            !this.hasPossibleMove() &&
            attempts < 100
        );
    }


    hasInitialMatch(r, c, tile) {

        if (
            c >= 2 &&
            this.grid[r][c - 1] === tile &&
            this.grid[r][c - 2] === tile
        ) {
            return true;
        }

        if (
            r >= 2 &&
            this.grid[r - 1][c] === tile &&
            this.grid[r - 2][c] === tile
        ) {
            return true;
        }

        return false;
    }


    swap(r1, c1, r2, c2) {

        const temp =
            this.grid[r1][c1];

        this.grid[r1][c1] =
            this.grid[r2][c2];

        this.grid[r2][c2] =
            temp;
    }


    findMatches() {

        const matched =
            Array.from(
                { length: this.rows },
                () => Array(this.cols).fill(false)
            );

        let count = 0;


        /*
         * Yatay
         */

        for (
            let r = 0;
            r < this.rows;
            r++
        ) {

            let c = 0;

            while (c < this.cols) {

                const value =
                    this.grid[r][c];

                if (!value) {
                    c++;
                    continue;
                }

                let end = c + 1;

                while (
                    end < this.cols &&
                    this.grid[r][end] === value
                ) {
                    end++;
                }

                const length = end - c;

                if (length >= 3) {

                    for (
                        let x = c;
                        x < end;
                        x++
                    ) {

                        if (!matched[r][x]) {

                            matched[r][x] = true;

                            count++;
                        }
                    }
                }

                c = end;
            }
        }


        /*
         * Dikey
         */

        for (
            let c = 0;
            c < this.cols;
            c++
        ) {

            let r = 0;

            while (r < this.rows) {

                const value =
                    this.grid[r][c];

                if (!value) {
                    r++;
                    continue;
                }

                let end = r + 1;

                while (
                    end < this.rows &&
                    this.grid[end][c] === value
                ) {
                    end++;
                }

                const length = end - r;

                if (length >= 3) {

                    for (
                        let y = r;
                        y < end;
                        y++
                    ) {

                        if (!matched[y][c]) {

                            matched[y][c] = true;

                            count++;
                        }
                    }
                }

                r = end;
            }
        }

        return {
            hasMatch: count > 0,
            matched,
            count
        };
    }


    removeMatched(matchResult) {

        for (
            let r = 0;
            r < this.rows;
            r++
        ) {

            for (
                let c = 0;
                c < this.cols;
                c++
            ) {

                if (
                    matchResult.matched[r][c]
                ) {

                    this.grid[r][c] = null;
                }
            }
        }
    }


    applyGravity() {

        for (
            let c = 0;
            c < this.cols;
            c++
        ) {

            let writeRow =
                this.rows - 1;


            for (
                let r = this.rows - 1;
                r >= 0;
                r--
            ) {

                if (
                    this.grid[r][c] !== null
                ) {

                    this.grid[writeRow][c] =
                        this.grid[r][c];

                    if (writeRow !== r) {

                        this.grid[r][c] =
                            null;
                    }

                    writeRow--;
                }
            }


            for (
                let r = writeRow;
                r >= 0;
                r--
            ) {

                this.grid[r][c] =
                    this.getRandomTile();
            }
        }
    }


    hasPossibleMove() {

        for (
            let r = 0;
            r < this.rows;
            r++
        ) {

            for (
                let c = 0;
                c < this.cols;
                c++
            ) {

                if (c + 1 < this.cols) {

                    this.swap(
                        r,
                        c,
                        r,
                        c + 1
                    );

                    const result =
                        this.findMatches();

                    this.swap(
                        r,
                        c,
                        r,
                        c + 1
                    );

                    if (result.hasMatch) {
                        return true;
                    }
                }


                if (r + 1 < this.rows) {

                    this.swap(
                        r,
                        c,
                        r + 1,
                        c
                    );

                    const result =
                        this.findMatches();

                    this.swap(
                        r,
                        c,
                        r + 1,
                        c
                    );

                    if (result.hasMatch) {
                        return true;
                    }
                }
            }
        }

        return false;
    }


    reshuffle() {

        const values = [];

        for (
            let r = 0;
            r < this.rows;
            r++
        ) {

            for (
                let c = 0;
                c < this.cols;
                c++
            ) {

                values.push(
                    this.grid[r][c]
                );
            }
        }


        for (
            let attempt = 0;
            attempt < 100;
            attempt++
        ) {

            for (
                let i = values.length - 1;
                i > 0;
                i--
            ) {

                const j =
                    Math.floor(
                        Math.random() *
                        (i + 1)
                    );

                [
                    values[i],
                    values[j]
                ] =
                [
                    values[j],
                    values[i]
                ];
            }


            let index = 0;

            for (
                let r = 0;
                r < this.rows;
                r++
            ) {

                for (
                    let c = 0;
                    c < this.cols;
                    c++
                ) {

                    this.grid[r][c] =
                        values[index++];
                }
            }


            if (
                !this.findMatches().hasMatch &&
                this.hasPossibleMove()
            ) {
                return;
            }
        }


        this.initGrid();
    }
}


/* ========================================== */
/* GAME CONTROLLER */
/* ========================================== */

class GameController {

    constructor() {

        this.audio =
            new AudioManager();

        this.engine =
            new Match3Engine(
                GAME_CONFIG.ROWS,
                GAME_CONFIG.COLS
            );

        this.userData =
            StorageManager.getProgress();


        this.currentWorld =
            this.userData.currentWorld || 1;

        this.currentLevel =
            this.userData.currentLevel || 1;


        this.movesLeft = 0;

        this.targetMatches = 0;

        this.matchedTileCount = 0;

        this.score = 0;

        this.selectedTile = null;

        this.isProcessingMove = false;

        this.activeBooster = null;

        this.levelFinished = false;

        this.pendingLevel = null;

        this.selectedCharacter =
            this.userData.selectedCharacter ||
            "knight_aras";


        this.init();
    }


    init() {

        this.ensureDailyState();

        this.applyStoredSettings();

        this.bindEvents();

        this.updateCurrencies();

        this.simulateLoading();
    }


    /* ====================================== */
    /* DATE */
    /* ====================================== */

    getTodayKey() {

        const now = new Date();

        const year =
            now.getFullYear();

        const month =
            String(
                now.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                now.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    ensureDailyState() {

        const today =
            this.getTodayKey();


        if (
            this.userData.dailyPurchases.date !==
            today
        ) {

            this.userData.dailyPurchases = {

                date: today,

                hammer: 0,

                bomb: 0,

                color_bomb: 0,

                star: 0
            };
        }


        if (
            this.userData.daily.treasureProgress >
            GAME_CONFIG.TREASURE_COST
        ) {

            this.userData.daily.treasureProgress =
                GAME_CONFIG.TREASURE_COST;
        }


        StorageManager.saveProgress(
            this.userData
        );
    }


    isDailyRewardAvailable() {

        return (
            this.userData.daily.lastClaimDate !==
            this.getTodayKey()
        );
    }


    /* ====================================== */
    /* SETTINGS */
    /* ====================================== */

    applyStoredSettings() {

        const volume =
            Number(
                this.userData.settings.sfxVolume
            );

        this.audio.setSFXVolume(
            Number.isFinite(volume)
                ? volume
                : 100
        );


        const slider =
            document.getElementById(
                "slider-sfx"
            );

        if (slider) {

            slider.value =
                Number.isFinite(volume)
                    ? volume
                    : 100;
        }


        this.updateSFXLabel();
    }


    updateSFXLabel() {

        const el =
            document.getElementById(
                "sfx-volume-value"
            );

        if (!el) {
            return;
        }

        const value =
            Math.round(
                this.audio.sfxVolume * 100
            );

        el.innerText =
            `${value}%`;
    }


    /* ====================================== */
    /* LOADING */
    /* ====================================== */

    simulateLoading() {

        let progress = 0;

        const bar =
            document.getElementById(
                "loading-progress-bar"
            );

        const text =
            document.getElementById(
                "loading-text"
            );


        const messages = [
            "Varlıklar yükleniyor...",
            "Dünyalar hazırlanıyor...",
            "Taşlar hazırlanıyor...",
            "Karakterler hazırlanıyor...",
            "Macera başlıyor..."
        ];


        const interval =
            setInterval(() => {

                progress += 20;

                if (bar) {
                    bar.style.width =
                        `${progress}%`;
                }

                if (text) {

                    const index =
                        Math.min(
                            messages.length - 1,
                            Math.floor(
                                progress / 20
                            )
                        );

                    text.innerText =
                        messages[index];
                }


                if (progress >= 100) {

                    clearInterval(interval);

                    setTimeout(() => {

                        this.switchScreen(
                            "screen-main-menu"
                        );

                    }, 250);
                }

            }, 160);
    }


    /* ====================================== */
    /* EVENTS */
    /* ====================================== */

    bindEvents() {

        const bind =
            (id, event, handler) => {

                const element =
                    document.getElementById(id);

                if (element) {

                    element.addEventListener(
                        event,
                        handler
                    );
                }
            };


        /* Main */

        bind(
            "btn-play-main",
            "click",
            () => {

                this.audio.play("click");

                if (!this.userData.characterSelected) {

                    this.openCharacterSelection(
                        this.userData.currentWorld,
                        this.userData.currentLevel
                    );

                    return;
                }

                this.openWorldMap(
                    this.userData.currentWorld
                );
            }
        );


        bind(
            "btn-open-settings-menu",
            "click",
            () => {

                this.audio.play("button");

                this.toggleModal(
                    "modal-settings",
                    true
                );
            }
        );


        bind(
            "btn-open-shop",
            "click",
            () => {

                this.audio.play("button");

                this.openShop();
            }
        );


        bind(
            "btn-open-daily",
            "click",
            () => {

                this.audio.play("button");

                this.openDailyReward();
            }
        );


        /* Settings */

        bind(
            "slider-sfx",
            "input",
            event => {

                const value =
                    Number(
                        event.target.value
                    );

                this.audio.setSFXVolume(
                    value
                );

                this.userData.settings.sfxVolume =
                    value;

                this.updateSFXLabel();

                StorageManager.saveProgress(
                    this.userData
                );
            }
        );


        bind(
            "btn-close-settings",
            "click",
            () => {

                this.audio.play("button");

                this.toggleModal(
                    "modal-settings",
                    false
                );
            }
        );


        /* Map */

        bind(
            "btn-map-to-menu",
            "click",
            () => {

                this.audio.play("click");

                this.switchScreen(
                    "screen-main-menu"
                );
            }
        );


        bind(
            "btn-prev-world",
            "click",
            () => {

                if (
                    this.currentWorld > 1
                ) {

                    this.audio.play("click");

                    this.openWorldMap(
                        this.currentWorld - 1
                    );
                }
            }
        );


        bind(
            "btn-next-world",
            "click",
            () => {

                if (
                    this.currentWorld <
                    GAME_CONFIG.TOTAL_WORLDS
                ) {

                    this.audio.play("click");

                    this.openWorldMap(
                        this.currentWorld + 1
                    );
                }
            }
        );


        /* Character selection */

        bind(
            "btn-character-cancel",
            "click",
            () => {

                this.audio.play("button");

                this.pendingLevel = null;

                this.toggleModal(
                    "modal-character-selection",
                    false
                );
            }
        );


        bind(
            "btn-character-start",
            "click",
            () => {

                if (!this.pendingLevel) {
                    return;
                }

                this.audio.play("click");

                const pending =
                    this.pendingLevel;

                this.userData.selectedCharacter =
                    this.selectedCharacter;

                this.userData.characterSelected =
                    true;

                StorageManager.saveProgress(
                    this.userData
                );

                this.pendingLevel = null;

                this.toggleModal(
                    "modal-character-selection",
                    false
                );

                this.launchLevel(
                    pending.world,
                    pending.level
                );
            }
        );


        /* Gameplay */

        bind(
            "btn-pause-game",
            "click",
            () => {

                if (this.levelFinished) {
                    return;
                }

                this.audio.play("button");

                this.toggleModal(
                    "modal-pause",
                    true
                );
            }
        );


        bind(
            "btn-resume-game",
            "click",
            () => {

                this.audio.play("button");

                this.toggleModal(
                    "modal-pause",
                    false
                );
            }
        );


        bind(
            "btn-restart-level",
            "click",
            () => {

                this.audio.play("button");

                this.toggleModal(
                    "modal-pause",
                    false
                );

                this.launchLevel(
                    this.currentWorld,
                    this.currentLevel
                );
            }
        );


        bind(
            "btn-quit-to-map",
            "click",
            () => {

                this.audio.play("button");

                this.toggleModal(
                    "modal-pause",
                    false
                );

                this.openWorldMap(
                    this.currentWorld
                );
            }
        );


        /* Win */

        bind(
            "btn-win-next",
            "click",
            () => {

                this.audio.play("click");

                this.toggleModal(
                    "modal-win",
                    false
                );

                this.openWorldMap(
                    this.userData.currentWorld
                );
            }
        );


        /* Lose */

        bind(
            "btn-lose-map",
            "click",
            () => {

                this.audio.play("click");

                this.toggleModal(
                    "modal-lose",
                    false
                );

                this.openWorldMap(
                    this.currentWorld
                );
            }
        );


        /* Daily */

        bind(
            "btn-close-daily",
            "click",
            () => {

                this.audio.play("button");

                this.toggleModal(
                    "modal-daily",
                    false
                );
            }
        );


        bind(
            "btn-claim-daily",
            "click",
            () => {

                this.claimDailyReward();
            }
        );


        bind(
            "btn-claim-treasure",
            "click",
            () => {

                this.claimTreasure();
            }
        );


        /* Shop */

        bind(
            "btn-close-shop",
            "click",
            () => {

                this.audio.play("button");

                this.toggleModal(
                    "modal-shop",
                    false
                );
            }
        );


        const treasureButton =
            document.querySelector(
                ".btn-buy-treasure"
            );

        if (treasureButton) {

            treasureButton.addEventListener(
                "click",
                () => {

                    this.claimTreasure();
                }
            );
        }
    }


    /* ====================================== */
    /* SCREEN / MODAL */
    /* ====================================== */

    switchScreen(screenId) {

        document
            .querySelectorAll(".screen")
            .forEach(screen => {

                screen.classList.remove(
                    "active"
                );
            });


        const target =
            document.getElementById(
                screenId
            );

        if (target) {

            target.classList.add(
                "active"
            );
        }
    }


    toggleModal(modalId, show) {

        const modal =
            document.getElementById(
                modalId
            );

        if (!modal) {
            return;
        }

        if (show) {

            modal.classList.add(
                "active"
            );

        }
        else {

            modal.classList.remove(
                "active"
            );
        }
    }


    /* ====================================== */
    /* CURRENCY */
    /* ====================================== */

    updateCurrencies() {

        const coins =
            Number(
                this.userData.coins || 0
            );

        const diamonds =
            Number(
                this.userData.diamonds || 0
            );


        const values = {

            "menu-coin-count":
                coins.toLocaleString(),

            "map-coin-count":
                coins.toLocaleString(),

            "menu-diamond-count":
                diamonds,

            "map-diamond-count":
                diamonds,

            "shop-coin-count":
                coins.toLocaleString(),

            "shop-diamond-count":
                diamonds
        };


        Object.entries(values)
            .forEach(([id, value]) => {

                const el =
                    document.getElementById(id);

                if (el) {
                    el.innerText = value;
                }
            });
    }


    /* ====================================== */
    /* MAP */
    /* ====================================== */

    openWorldMap(worldId) {

        worldId =
            Math.max(
                1,
                Math.min(
                    GAME_CONFIG.TOTAL_WORLDS,
                    worldId
                )
            );


        this.currentWorld =
            worldId;


        this.switchScreen(
            "screen-world-map"
        );


        const info =
            GAME_CONFIG.WORLDS_INFO[
                worldId
            ];


        const title =
            document.getElementById(
                "world-title-text"
            );

        if (title) {
            title.innerText =
                info.name;
        }


        const bg =
            document.getElementById(
                "map-background-layer"
            );

        if (bg) {

            bg.style.backgroundImage =
                `url("${info.bg}")`;
        }


        const map =
            document.getElementById(
                "map-art-layer"
            );

        if (map) {

            map.src =
                info.map;
        }


        this.updateWorldDots(
            worldId
        );


        this.updateMapAvatar();

        this.renderMapNodes(
            worldId
        );

        this.updateCurrencies();
    }


    updateWorldDots(worldId) {

        const dots =
            document.querySelectorAll(
                "#world-indicator-dots .dot"
            );

        dots.forEach(
            (dot, index) => {

                dot.classList.toggle(
                    "active",
                    index === worldId - 1
                );
            }
        );
    }


    updateMapAvatar() {

        const avatar =
            document.getElementById(
                "player-map-avatar-img"
            );

        if (!avatar) {
            return;
        }


        const character =
            GAME_CONFIG.CHARACTERS.find(
                item =>
                    item.id ===
                    this.selectedCharacter
            );


        if (character) {

            avatar.src =
                character.image;
        }
    }


    renderMapNodes(worldId) {

        const container =
            document.getElementById(
                "level-nodes-layer"
            );

        if (!container) {
            return;
        }


        container.innerHTML = "";


        const positions = [

            {
                x: 50,
                y: 86
            },

            {
                x: 43,
                y: 67
            },

            {
                x: 51,
                y: 48
            },

            {
                x: 43,
                y: 28
            },

            {
                x: 51,
                y: 9
            }
        ];


        for (
            let level = 1;
            level <=
            GAME_CONFIG.LEVELS_PER_WORLD;
            level++
        ) {

            const node =
                document.createElement(
                    "button"
                );


            node.type = "button";

            node.className =
                "level-node";


            const unlocked =
                (
                    worldId <
                    this.userData.currentWorld
                )
                ||
                (
                    worldId ===
                    this.userData.currentWorld
                    &&
                    level <=
                    this.userData.currentLevel
                );


            node.classList.toggle(
                "locked",
                !unlocked
            );


            node.innerHTML = unlocked
                ? `<span>${level}</span>`
                : `<span>🔒</span>`;


            const pos =
                positions[level - 1];


            node.style.left =
                `${pos.x}%`;

            node.style.top =
                `${pos.y}%`;


            if (unlocked) {

                node.addEventListener(
                    "click",
                    () => {

                        this.audio.play(
                            "click"
                        );

                        if (!this.userData.characterSelected) {

                            this.openCharacterSelection(
                                worldId,
                                level
                            );

                            return;
                        }

                        this.launchLevel(
                            worldId,
                            level
                        );
                    }
                );
            }


            container.appendChild(
                node
            );
        }
    }


    /* ====================================== */
    /* CHARACTER SELECTION */
    /* ====================================== */

    openCharacterSelection(
        worldId,
        levelId
    ) {

        this.pendingLevel = {
            world: worldId,
            level: levelId
        };


        const title =
            document.getElementById(
                "character-selection-level"
            );

        if (title) {

            title.innerText =
                `Dünya ${worldId} • Bölüm ${levelId}`;
        }


        this.selectedCharacter =
            this.userData.selectedCharacter ||
            "knight_aras";


        this.renderCharacterSelection();


        this.toggleModal(
            "modal-character-selection",
            true
        );
    }


    renderCharacterSelection() {

        const grid =
            document.getElementById(
                "character-selection-grid"
            );

        if (!grid) {
            return;
        }


        grid.innerHTML = "";


        GAME_CONFIG.CHARACTERS.forEach(
            character => {

                const card =
                    document.createElement(
                        "button"
                    );


                card.type = "button";

                card.className =
                    "character-card";


                if (
                    character.id ===
                    this.selectedCharacter
                ) {

                    card.classList.add(
                        "selected"
                    );
                }


                card.innerHTML = `

                    <img
                        src="${character.image}"
                        alt="${character.name}"
                    >

                    <span>
                        ${character.name}
                    </span>

                `;


                card.addEventListener(
                    "click",
                    () => {

                        this.audio.play(
                            "click"
                        );

                        this.selectedCharacter =
                            character.id;

                        this.renderCharacterSelection();
                    }
                );


                grid.appendChild(
                    card
                );
            }
        );


        const startButton =
            document.getElementById(
                "btn-character-start"
            );

        if (startButton) {

            startButton.disabled =
                !this.selectedCharacter;
        }
    }


    /* ====================================== */
    /* LEVEL SETUP */
    /* ====================================== */

    launchLevel(
        worldId,
        levelId
    ) {

        this.currentWorld =
            worldId;

        this.currentLevel =
            levelId;


        this.movesLeft =
            this.calculateMoves(
                worldId,
                levelId
            );


        this.targetMatches =
            this.calculateTarget(
                worldId,
                levelId
            );


        this.matchedTileCount = 0;

        this.score = 0;

        this.selectedTile = null;

        this.activeBooster = null;

        this.isProcessingMove = false;

        this.levelFinished = false;


        this.userData.selectedCharacter =
            this.selectedCharacter;


        StorageManager.saveProgress(
            this.userData
        );


        this.engine.setupWorldPool(
            worldId
        );

        this.engine.initGrid();


        this.setupGameplayVisuals();

        this.updateHUD();

        this.renderBoard();

        this.renderBoosterUI();

        this.switchScreen(
            "screen-gameplay"
        );
    }


    calculateMoves(
        worldId,
        levelId
    ) {

        const difficulty =
            (
                worldId - 1
            ) * 2
            +
            Math.floor(
                (levelId - 1) / 2
            );


        return Math.max(
            16,
            24 - difficulty
        );
    }


    calculateTarget(
        worldId,
        levelId
    ) {

        return (
            30
            +
            (worldId - 1) * 10
            +
            (levelId - 1) * 5
        );
    }


    setupGameplayVisuals() {

        const info =
            GAME_CONFIG.WORLDS_INFO[
                this.currentWorld
            ];


        const bg =
            document.getElementById(
                "gameplay-bg-layer"
            );


        if (bg) {

            bg.style.backgroundImage =
                `url("${info.bg}")`;
        }


        const character =
            GAME_CONFIG.CHARACTERS.find(
                item =>
                    item.id ===
                    this.selectedCharacter
            );


        if (!character) {
            return;
        }


        // Match Tile ekranında sol karakter ve diyalog alanı kaldırıldı.
        // Sağ üstteki seçilen karakter görseli korunuyor.

        const backdrop =
            document.getElementById(
                "game-character-backdrop"
            );


        if (backdrop) {

            backdrop.src =
                character.image;

            backdrop.alt =
                character.name;
        }
    }


    /* ====================================== */
    /* HUD */
    /* ====================================== */

    updateHUD() {

        const level =
            document.getElementById(
                "hud-level-num"
            );

        const moves =
            document.getElementById(
                "hud-moves-left"
            );

        const target =
            document.getElementById(
                "hud-target-progress"
            );

        const targetTotal =
            document.getElementById(
                "hud-target-total"
            );


        if (level) {

            level.innerText =
                `${this.currentWorld}-${this.currentLevel}`;
        }


        if (moves) {

            moves.innerText =
                this.movesLeft;
        }


        if (target) {

            target.innerText =
                Math.min(
                    this.matchedTileCount,
                    this.targetMatches
                );
        }


        if (targetTotal) {

            targetTotal.innerText =
                this.targetMatches;
        }
    }


    /* ====================================== */
    /* BOARD */
    /* ====================================== */

    renderBoard(animationClass = "") {

        const grid =
            document.getElementById(
                "grid-board"
            );

        if (!grid) {
            return;
        }


        grid.innerHTML = "";


        for (
            let r = 0;
            r < GAME_CONFIG.ROWS;
            r++
        ) {

            for (
                let c = 0;
                c < GAME_CONFIG.COLS;
                c++
            ) {

                const tile =
                    document.createElement(
                        "button"
                    );


                tile.type = "button";

                tile.className =
                    "tile";


                if (animationClass) {

                    tile.classList.add(
                        animationClass
                    );
                }


                tile.dataset.row = r;

                tile.dataset.col = c;


                const tileName =
                    this.engine.grid[r][c];


                if (tileName) {

                    tile.innerHTML = `

                        <img
                            src="assets/tiles/${tileName}"
                            alt=""
                            draggable="false"
                        >

                    `;
                }


                tile.addEventListener(
                    "click",
                    event => {

                        this.onTileClick(
                            event
                        );
                    }
                );


                grid.appendChild(
                    tile
                );
            }
        }
    }


    getTileElement(
        r,
        c
    ) {

        return document.querySelector(
            `.tile[data-row="${r}"][data-col="${c}"]`
        );
    }


    /* ====================================== */
    /* TILE INPUT */
    /* ====================================== */

    async onTileClick(event) {

        if (
            this.isProcessingMove ||
            this.levelFinished
        ) {
            return;
        }


        const tile =
            event.currentTarget;


        const r =
            Number(tile.dataset.row);

        const c =
            Number(tile.dataset.col);


        if (
            !Number.isInteger(r) ||
            !Number.isInteger(c)
        ) {
            return;
        }


        if (this.activeBooster) {

            await this.applyBoosterEffect(
                r,
                c
            );

            return;
        }


        if (!this.selectedTile) {

            this.selectedTile = {
                r,
                c
            };


            tile.classList.add(
                "selected"
            );


            this.audio.play(
                "click"
            );

            return;
        }


        const previous =
            this.selectedTile;


        this.selectedTile =
            null;


        const previousElement =
            this.getTileElement(
                previous.r,
                previous.c
            );


        if (previousElement) {

            previousElement.classList.remove(
                "selected"
            );
        }


        if (
            previous.r === r &&
            previous.c === c
        ) {

            return;
        }


        const adjacent =
            Math.abs(
                previous.r - r
            )
            +
            Math.abs(
                previous.c - c
            )
            === 1;


        if (!adjacent) {

            this.audio.play(
                "click"
            );

            return;
        }


        await this.executeMove(
            previous.r,
            previous.c,
            r,
            c
        );
    }


    /* ====================================== */
    /* MOVE */
    /* ====================================== */

    async executeMove(
        r1,
        c1,
        r2,
        c2
    ) {

        if (
            this.movesLeft <= 0 ||
            this.isProcessingMove ||
            this.levelFinished
        ) {
            return;
        }


        this.isProcessingMove =
            true;


        this.audio.play(
            "swap"
        );


        this.engine.swap(
            r1,
            c1,
            r2,
            c2
        );


        this.renderBoard(
            "swap-animation"
        );


        await this.sleep(160);


        const matchResult =
            this.engine.findMatches();


        if (!matchResult.hasMatch) {

            this.engine.swap(
                r1,
                c1,
                r2,
                c2
            );


            this.renderBoard(
                "invalid-swap"
            );


            this.audio.play(
                "error"
            );


            await this.sleep(
                180
            );


            this.isProcessingMove =
                false;

            return;
        }


        this.movesLeft--;

        this.updateHUD();


        await this.handleCascades();


        this.checkLevelStatus();


        this.isProcessingMove =
            false;
    }


    /* ====================================== */
    /* CASCADE */
    /* ====================================== */

    async handleCascades() {

        let cascade =
            0;


        while (true) {

            const matchResult =
                this.engine.findMatches();


            if (!matchResult.hasMatch) {
                break;
            }


            cascade++;


            const count =
                matchResult.count;


            this.audio.playMatch(
                count
            );


            if (cascade > 1) {

                setTimeout(
                    () => {
                        this.audio.play(
                            "combo"
                        );
                    },
                    80
                );
            }


            if (cascade > 2) {

                setTimeout(
                    () => {
                        this.audio.play(
                            "cascade"
                        );
                    },
                    130
                );
            }


            const tiles =
                document.querySelectorAll(
                    ".tile"
                );


            for (
                let r = 0;
                r < GAME_CONFIG.ROWS;
                r++
            ) {

                for (
                    let c = 0;
                    c < GAME_CONFIG.COLS;
                    c++
                ) {

                    if (
                        matchResult.matched[r][c]
                    ) {

                        const index =
                            r *
                            GAME_CONFIG.COLS +
                            c;


                        if (tiles[index]) {

                            tiles[index].classList.add(
                                count >= 5
                                    ? "match-five"
                                    : count === 4
                                        ? "match-four"
                                        : "matched-pop"
                            );
                        }
                    }
                }
            }


            this.matchedTileCount +=
                count;


            this.score +=
                count *
                10 *
                cascade;


            this.updateHUD();


            await this.sleep(
                count >= 5
                    ? 480
                    : count === 4
                        ? 400
                        : 320
            );


            this.engine.removeMatched(
                matchResult
            );


            this.renderBoard(
                "tile-remove"
            );


            await this.sleep(
                80
            );


            this.engine.applyGravity();


            this.renderBoard(
                cascade > 1
                    ? "cascade-animation"
                    : "tile-fall"
            );


            await this.sleep(
                250
            );


            if (
                this.matchedTileCount >=
                this.targetMatches
            ) {
                break;
            }
        }


        if (
            !this.engine.hasPossibleMove()
        ) {

            this.engine.reshuffle();

            this.renderBoard(
                "reshuffle-animation"
            );


            this.audio.play(
                "magic"
            );


            await this.sleep(
                350
            );
        }
    }


    /* ====================================== */
    /* BOOSTERS */
    /* ====================================== */

    renderBoosterUI() {

        const container =
            document.getElementById(
                "hud-boosters-bar"
            );

        if (!container) {
            return;
        }


        container.innerHTML = "";


        Object.entries(
            GAME_CONFIG.BOOSTERS
        ).forEach(
            ([type, config]) => {

                const count =
                    Number(
                        this.userData.boosters[type] ||
                        0
                    );


                const item =
                    document.createElement(
                        "button"
                    );


                item.type = "button";

                item.className =
                    "booster-item";


                if (
                    this.activeBooster === type
                ) {

                    item.classList.add(
                        "selected"
                    );
                }


                if (count <= 0) {

                    item.classList.add(
                        "disabled"
                    );
                }


                item.innerHTML = `

                    <img
                        src="${config.image}"
                        alt="${config.name}"
                    >

                    <span class="booster-count">
                        ${count}
                    </span>

                `;


                item.addEventListener(
                    "click",
                    () => {

                        this.activateBooster(
                            type
                        );
                    }
                );


                container.appendChild(
                    item
                );
            }
        );
    }


    activateBooster(type) {

        if (
            this.isProcessingMove ||
            this.levelFinished
        ) {
            return;
        }


        const count =
            Number(
                this.userData.boosters[type] ||
                0
            );


        if (count <= 0) {

            this.audio.play(
                "error"
            );

            return;
        }


        if (
            this.activeBooster === type
        ) {

            this.activeBooster =
                null;

            this.renderBoosterUI();

            return;
        }


        this.activeBooster =
            type;


        this.audio.play(
            GAME_CONFIG.BOOSTERS[type].sound
        );


        this.renderBoosterUI();
    }


    async applyBoosterEffect(
        r,
        c
    ) {

        if (
            !this.activeBooster ||
            this.isProcessingMove
        ) {
            return;
        }


        const type =
            this.activeBooster;


        const count =
            Number(
                this.userData.boosters[type] ||
                0
            );


        if (count <= 0) {

            this.activeBooster =
                null;

            this.renderBoosterUI();

            return;
        }


        this.isProcessingMove =
            true;


        const selected =
            this.getTileElement(
                r,
                c
            );


        if (selected) {

            selected.classList.add(
                "booster-hit"
            );
        }


        await this.sleep(
            180
        );


        if (type === "hammer") {

            this.audio.play(
                "magic"
            );

            this.engine.grid[r][c] =
                null;


            this.matchedTileCount += 1;
        }


        else if (type === "bomb") {

            this.audio.play(
                "bomb"
            );


            for (
                let dr = -1;
                dr <= 1;
                dr++
            ) {

                for (
                    let dc = -1;
                    dc <= 1;
                    dc++
                ) {

                    const nr =
                        r + dr;

                    const nc =
                        c + dc;


                    if (
                        nr >= 0 &&
                        nr <
                        GAME_CONFIG.ROWS &&
                        nc >= 0 &&
                        nc <
                        GAME_CONFIG.COLS
                    ) {

                        if (
                            this.engine.grid[nr][nc]
                        ) {

                            this.engine.grid[nr][nc] =
                                null;

                            this.matchedTileCount++;
                        }
                    }
                }
            }
        }


        else if (
            type === "color_bomb"
        ) {

            this.audio.play(
                "color_bomb"
            );


            const target =
                this.engine.grid[r][c];


            for (
                let row = 0;
                row < GAME_CONFIG.ROWS;
                row++
            ) {

                for (
                    let col = 0;
                    col < GAME_CONFIG.COLS;
                    col++
                ) {

                    if (
                        this.engine.grid[row][col] ===
                        target
                    ) {

                        this.engine.grid[row][col] =
                            null;

                        this.matchedTileCount++;
                    }
                }
            }
        }


        else if (type === "star") {

            this.audio.play(
                "star"
            );


            const cells = [];

            for (
                let row = 0;
                row < GAME_CONFIG.ROWS;
                row++
            ) {

                for (
                    let col = 0;
                    col < GAME_CONFIG.COLS;
                    col++
                ) {

                    if (
                        this.engine.grid[row][col]
                    ) {

                        cells.push({
                            r: row,
                            c: col
                        });
                    }
                }
            }


            for (
                let i = cells.length - 1;
                i > 0;
                i--
            ) {

                const j =
                    Math.floor(
                        Math.random() *
                        (i + 1)
                    );

                [
                    cells[i],
                    cells[j]
                ] =
                [
                    cells[j],
                    cells[i]
                ];
            }


            const selectedCells =
                cells.slice(0, 5);


            selectedCells.forEach(
                cell => {

                    if (
                        this.engine.grid[
                            cell.r
                        ][
                            cell.c
                        ]
                    ) {

                        this.engine.grid[
                            cell.r
                        ][
                            cell.c
                        ] = null;

                        this.matchedTileCount++;
                    }
                }
            );
        }


        this.userData.boosters[type]--;

        this.activeBooster =
            null;


        StorageManager.saveProgress(
            this.userData
        );


        this.renderBoard(
            "booster-hit"
        );


        this.updateHUD();


        await this.sleep(
            180
        );


        this.engine.applyGravity();


        this.renderBoard(
            "tile-fall"
        );


        await this.sleep(
            220
        );


        await this.handleCascades();


        this.checkLevelStatus();


        this.renderBoosterUI();


        this.isProcessingMove =
            false;
    }


    /* ====================================== */
    /* LEVEL STATUS */
    /* ====================================== */

    checkLevelStatus() {

        if (
            this.levelFinished
        ) {
            return;
        }


        if (
            this.matchedTileCount >=
            this.targetMatches
        ) {

            this.finishLevel(
                true
            );

            return;
        }


        if (
            this.movesLeft <= 0
        ) {

            this.finishLevel(
                false
            );
        }
    }


    finishLevel(won) {

        if (
            this.levelFinished
        ) {
            return;
        }


        this.levelFinished =
            true;


        this.activeBooster =
            null;


        if (won) {

            this.audio.play(
                "level_win"
            );


            this.userData.coins +=
                GAME_CONFIG.LEVEL_REWARD;


            const key =
                `${this.currentWorld}-${this.currentLevel}`;


            this.userData.completedLevels[
                key
            ] = true;


            this.userData.stars[
                key
            ] = 3;


            this.unlockNextLevel();


            StorageManager.saveProgress(
                this.userData
            );


            this.updateCurrencies();


            this.toggleModal(
                "modal-win",
                true
            );
        }

        else {

            this.audio.play(
                "level_lose"
            );


            this.toggleModal(
                "modal-lose",
                true
            );
        }
    }


    unlockNextLevel() {

        if (
            this.currentWorld !==
            this.userData.currentWorld
            ||
            this.currentLevel !==
            this.userData.currentLevel
        ) {
            return;
        }


        if (
            this.currentLevel <
            GAME_CONFIG.LEVELS_PER_WORLD
        ) {

            this.userData.currentLevel++;

        }

        else if (
            this.currentWorld <
            GAME_CONFIG.TOTAL_WORLDS
        ) {

            this.userData.currentWorld++;

            this.userData.currentLevel =
                1;
        }


        StorageManager.saveProgress(
            this.userData
        );
    }


    /* ====================================== */
    /* DAILY */
    /* ====================================== */

    openDailyReward() {

        this.ensureDailyState();

        this.updateDailyUI();

        this.toggleModal(
            "modal-daily",
            true
        );
    }


    updateDailyUI() {

        const available =
            this.isDailyRewardAvailable();


        const status =
            document.getElementById(
                "daily-status-text"
            );


        const claim =
            document.getElementById(
                "btn-claim-daily"
            );


        if (status) {

            status.innerText =
                available
                    ? "Bugünün ödülü hazır!"
                    : "Bugünün ödülünü aldın. Yeni ödül yarın 00:00'dan sonra açılır.";
        }


        if (claim) {

            claim.disabled =
                !available;

            claim.innerText =
                available
                    ? "ÖDÜLÜ AL"
                    : "YARIN TEKRAR GEL";
        }


        const progress =
            Math.min(
                GAME_CONFIG.TREASURE_COST,
                Number(
                    this.userData.daily.treasureProgress ||
                    0
                )
            );


        const current =
            document.getElementById(
                "treasure-progress-current"
            );


        const fill =
            document.getElementById(
                "treasure-progress-fill"
            );


        if (current) {

            current.innerText =
                progress;
        }


        if (fill) {

            fill.style.width =
                `${progress * 10}%`;
        }


        const treasureButton =
            document.getElementById(
                "btn-claim-treasure"
            );


        if (treasureButton) {

            const ready =
                progress >=
                GAME_CONFIG.TREASURE_COST
                &&
                this.userData.diamonds >=
                GAME_CONFIG.TREASURE_COST;


            treasureButton.disabled =
                !ready;

            treasureButton.innerText =
                ready
                    ? "10 ◆ → 1000 🪙"
                    : "10 ◆ GEREKLİ";
        }


        this.updateCurrencies();
    }


    claimDailyReward() {

        if (
            !this.isDailyRewardAvailable()
        ) {

            this.audio.play(
                "error"
            );

            this.updateDailyUI();

            return;
        }


        this.userData.coins +=
            GAME_CONFIG.DAILY_COIN_REWARD;


        this.userData.diamonds +=
            GAME_CONFIG.DAILY_DIAMOND_REWARD;


        this.userData.daily.lastClaimDate =
            this.getTodayKey();


        this.userData.daily.treasureProgress =
            Math.min(
                GAME_CONFIG.TREASURE_COST,
                Number(
                    this.userData.daily.treasureProgress ||
                    0
                ) + 1
            );


        StorageManager.saveProgress(
            this.userData
        );


        this.audio.play(
            "daily_reward"
        );


        this.audio.play(
            "coin"
        );


        this.audio.play(
            "star"
        );


        this.updateCurrencies();

        this.updateDailyUI();
    }


    claimTreasure() {

        const progress =
            Number(
                this.userData.daily.treasureProgress ||
                0
            );


        if (
            progress <
            GAME_CONFIG.TREASURE_COST
        ) {

            this.audio.play(
                "error"
            );

            return;
        }


        if (
            this.userData.diamonds <
            GAME_CONFIG.TREASURE_COST
        ) {

            this.audio.play(
                "error"
            );

            return;
        }


        this.userData.diamonds -=
            GAME_CONFIG.TREASURE_COST;


        this.userData.coins +=
            GAME_CONFIG.TREASURE_REWARD;


        this.userData.daily.treasureProgress =
            0;


        StorageManager.saveProgress(
            this.userData
        );


        this.audio.play(
            "purchase"
        );


        this.audio.play(
            "coin"
        );


        this.updateCurrencies();

        this.updateDailyUI();

        this.openShop();
    }


    /* ====================================== */
    /* SHOP */
    /* ====================================== */

    openShop() {

        this.ensureDailyState();

        this.renderShop();

        this.updateCurrencies();

        this.toggleModal(
            "modal-shop",
            true
        );
    }


    renderShop() {

        const container =
            document.getElementById(
                "shop-items-grid"
            );

        if (!container) {
            return;
        }


        container.innerHTML = "";


        Object.entries(
            GAME_CONFIG.BOOSTERS
        ).forEach(
            ([type, config]) => {

                const purchases =
                    Number(
                        this.userData.dailyPurchases[
                            type
                        ] || 0
                    );


                const canBuy =
                    purchases <
                    GAME_CONFIG.DAILY_PURCHASE_LIMIT
                    &&
                    this.userData.coins >=
                    config.cost;


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "shop-item";


                card.innerHTML = `

                    <img
                        src="${config.image}"
                        alt="${config.name}"
                    >

                    <h4>
                        ${config.name}
                    </h4>

                    <p>
                        ${config.cost} 🪙
                    </p>

                    <small>
                        Bugün:
                        ${purchases}/5
                    </small>

                    <button
                        class="btn-buy-pack"
                        data-booster="${type}"
                        ${canBuy ? "" : "disabled"}
                    >
                        ${purchases >= 5
                            ? "BUGÜN LİMİT DOLU"
                            : config.cost + " 🪙 AL"}
                    </button>

                `;


                const button =
                    card.querySelector(
                        ".btn-buy-pack"
                    );


                if (button) {

                    button.addEventListener(
                        "click",
                        () => {

                            this.buyBooster(
                                type
                            );
                        }
                    );
                }


                container.appendChild(
                    card
                );
            }
        );
    }


    buyBooster(type) {

        const config =
            GAME_CONFIG.BOOSTERS[type];


        if (!config) {
            return;
        }


        this.ensureDailyState();


        const purchases =
            Number(
                this.userData.dailyPurchases[
                    type
                ] || 0
            );


        if (
            purchases >=
            GAME_CONFIG.DAILY_PURCHASE_LIMIT
        ) {

            this.audio.play(
                "error"
            );

            this.renderShop();

            return;
        }


        if (
            this.userData.coins <
            config.cost
        ) {

            this.audio.play(
                "error"
            );

            return;
        }


        this.userData.coins -=
            config.cost;


        this.userData.boosters[type] =
            Number(
                this.userData.boosters[type] ||
                0
            ) + 1;


        this.userData.dailyPurchases[
            type
        ] =
            purchases + 1;


        StorageManager.saveProgress(
            this.userData
        );


        this.audio.play(
            "purchase"
        );


        this.audio.play(
            "coin"
        );


        this.updateCurrencies();

        this.renderShop();

        this.renderBoosterUI();
    }


    /* ====================================== */
    /* UTIL */
    /* ====================================== */

    sleep(ms) {

        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    ms
                )
        );
    }
}


/* ========================================== */
/* START */
/* ========================================== */

window.addEventListener(
    "DOMContentLoaded",
    () => {

        window.gameApp =
            new GameController();
    }
);