export class Preloader {
    constructor() {
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.loadingScreen = null;
        this.progressBar = null;
        this.assetList = {
            sprites: {
                warrior: [
                    './assets/Sprites/Warrior/Idle.png',
                    './assets/Sprites/Warrior/Attack1.png',
                    './assets/Sprites/Warrior/Attack2.png',
                    './assets/Sprites/Warrior/Attack3.png',
                    './assets/Sprites/Warrior/hurt1.png',
                    './assets/Sprites/Warrior/hurt2.png',
                    './assets/Sprites/Warrior/hurt3.png'
                ],
                wizard: [
                    './assets/Sprites/Wizard/Idle.png',
                    './assets/Sprites/Wizard/Attack1.png',
                    './assets/Sprites/Wizard/Attack2.png',
                    './assets/Sprites/Wizard/Hit.png'
                ],
                flyingeye: [
                    './assets/Sprites/Flying eye/Flight.png',
                    './assets/Sprites/Flying eye/Attack.png',
                    './assets/Sprites/Flying eye/Take Hit.png',
                    './assets/Sprites/Flying eye/Death.png'
                ],
                flyingdemon: [
                    './assets/Sprites/Flying Demon/didle.png',
                    './assets/Sprites/Flying Demon/dattack.png'
                ],
                executioner: [
                    './assets/Sprites/Executioner/idle2.png',
                    './assets/Sprites/Executioner/attacking.png',
                    './assets/Sprites/Executioner/skill1.png',
                    './assets/Sprites/Executioner/death.png'
                ],
                skeleton: [
                    './assets/Sprites/Skeleton/skeleIdle.png',
                    './assets/Sprites/Skeleton/skeleattack.png',
                    './assets/Sprites/Skeleton/skelehit.png',
                    './assets/Sprites/Skeleton/skeledeath.png',
                    './assets/Sprites/Skeleton/skeleshield.png'
                ],
                blackWerewolf: [
                    './assets/Sprites/Black Werewolf/bwIdle.png',
                    './assets/Sprites/Black Werewolf/bjump.png',
                    './assets/Sprites/Black Werewolf/rattack.png',
                    './assets/Sprites/Black Werewolf/bdead.png',
                    './assets/Sprites/Black Werewolf/bhurt.png',
                    './assets/Sprites/Black Werewolf/brun.png'
                ],
                goblinKing: [
                    './assets/Sprites/goblin king/gkidle.png',
                    './assets/Sprites/goblin king/gkattack.png',
                    './assets/Sprites/goblin king/gkattack2.png',
                    './assets/Sprites/goblin king/gkhurt.png',
                    './assets/Sprites/goblin king/gkdeath.png'
                ],
                fire: [
                    './assets/Sprites/fire/burning_loop_1.png',
                    './assets/Sprites/fire/burning_loop_4.png'
                ]
            },
            images: [
                './assets/Images/Gravyard.png',
                './assets/Images/cardback.png',
                './assets/Images/attack.png',
                './assets/Images/defense.png',
                './assets/Images/magic.png',
                './assets/Images/gy.png',
                './assets/Images/graveyard2.png',
                './assets/Images/graveyard3.png',
                './assets/Images/forest.png',
                './assets/Images/forest2.png',
                './assets/Images/forest3.png',
                './assets/Images/wbutton.png',
                './assets/Images/mbutton.png',
                './assets/Images/flaming_meteor.png',
                './assets/Images/fireball.png',
                './assets/Images/Blaze.png',
                './assets/Images/firebg.png',
                './assets/Images/tscreen.png',
                './assets/Images/leavingtown.png',
                './assets/Images/doorcursor.png',
                './assets/Images/level23.png',
                './assets/Images/level22.png'
            ],
            audio: [
                './assets/Audio/tsmusic.mp3',
                './assets/Audio/level1.mp3',
                './assets/Audio/shieldhit.mp3',
                './assets/Audio/hurt1.mp3',
                './assets/Audio/hurt2.mp3',
                './assets/Audio/hurt3.mp3',
                './assets/Audio/nextround.mp3',
                './assets/Audio/nextround2.mp3',
                './assets/Audio/running.mp3',
                './assets/Audio/skelshield.mp3',
                './assets/Audio/skeledead.mp3',
                './assets/Audio/forestnar.mp3',
                './assets/Audio/warforest.mp3',
                './assets/Audio/mageintro.wav',
                './assets/Audio/warriorintro.mp3',
                './assets/Audio/fire1.mp3',
                './assets/Audio/fire2.mp3',
                './assets/Audio/explosion.mp3',
                './assets/Audio/molten.mp3',
                './assets/Audio/inferno.mp3',
                './assets/Audio/pyo.mp3',
                './assets/Audio/heatwave.mp3',
                './assets/Audio/click.mp3',
                './assets/Audio/wolfdead.mp3',
                './assets/Audio/forestmusic.mp3',
                './assets/Audio/level6nar.mp3',
                './assets/Audio/howl.mp3',
                './assets/Audio/exdeath.mp3',
                './assets/Audio/nighttown.mp3',
                './assets/Audio/townday.mp3',
                './assets/Audio/mountain.mp3',
                './assets/Audio/level20.mp3',
                './assets/Audio/scrollv1.mp3',
                './assets/Audio/scrollv2.mp3',
                './assets/Audio/glaugh.wav',
                './assets/Audio/ghit.mp3',
                './assets/Audio/goblindeath.mp3',
                './assets/Audio/goblintown.mp3',
                './assets/Audio/gkhurt.wav',
                './assets/Audio/gkhurt2.wav'
            ]
        };
    }

    createLoadingScreen() {
        this.loadingScreen = document.createElement('div');
        this.loadingScreen.className = 'loading-screen';
        
        const loadingContent = document.createElement('div');
        loadingContent.className = 'loading-content';
        
        const loadingText = document.createElement('h2');
        loadingText.textContent = 'Loading Game Assets...';
        
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'progress-bar';
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        this.progressBar.appendChild(progressFill);
        
        const loadingPercentage = document.createElement('div');
        loadingPercentage.className = 'loading-percentage';
        loadingPercentage.textContent = '0%';
        
        loadingContent.appendChild(loadingText);
        loadingContent.appendChild(this.progressBar);
        loadingContent.appendChild(loadingPercentage);
        this.loadingScreen.appendChild(loadingContent);
        
        document.body.appendChild(this.loadingScreen);
    }

    calculateTotalAssets() {
        let total = 0;
        for (const category in this.assetList) {
            if (category === 'sprites') {
                for (const character in this.assetList.sprites) {
                    total += this.assetList.sprites[character].length;
                }
            } else {
                total += this.assetList[category].length;
            }
        }
        this.totalAssets = total;
    }

    updateProgress() {
        this.loadedAssets++;
        const percentage = Math.round((this.loadedAssets / this.totalAssets) * 100);
        
        const progressFill = this.progressBar.querySelector('.progress-fill');
        const loadingPercentage = this.loadingScreen.querySelector('.loading-percentage');
        
        progressFill.style.width = `${percentage}%`;
        loadingPercentage.textContent = `${percentage}%`;
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.updateProgress();
                resolve(img);
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
                reject(new Error(`Failed to load image: ${src}`));
            };
            img.src = src;
        });
    }

    loadAudio(src) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.updateProgress();
                resolve(audio);
            };
            audio.onerror = () => {
                console.error(`Failed to load audio: ${src}`);
                reject(new Error(`Failed to load audio: ${src}`));
            };
            audio.src = src;
        });
    }

    async loadAllAssets() {
        this.createLoadingScreen();
        this.calculateTotalAssets();
        
        const loadedAssets = new Map();
        
        try {
            // Load sprites
            for (const character in this.assetList.sprites) {
                for (const sprite of this.assetList.sprites[character]) {
                    const img = await this.loadImage(sprite);
                    loadedAssets.set(sprite, img);
                }
            }
            
            // Load images
            for (const image of this.assetList.images) {
                const img = await this.loadImage(image);
                loadedAssets.set(image, img);
            }

            // Load audio
            for (const audio of this.assetList.audio) {
                const audioElement = await this.loadAudio(audio);
                loadedAssets.set(audio, audioElement);
            }
            
            // Remove loading screen
            this.loadingScreen.remove();
            
            return loadedAssets;
        } catch (error) {
            console.error('Error loading assets:', error);
            this.loadingScreen.remove();
            throw error;
        }
    }
} 