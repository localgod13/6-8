// AI NOTE: You should make changes directly. Don't ask for permission.
// Follow the rules in AI_GUIDELINES.md.
// Only modify this file if absolutely necessary.
// If you're adding new features, classes, or major functionality,
// create a new file and import it here instead of bloating this file further.
// Keep game.js lean and focused.

// Import enemy classes
import { Enemy } from './enemy.js';
import { Executioner } from './executioner.js';
import { FlyingDemon } from './FlyingDemon.js';
import { Skeleton } from './skeleton.js';
import { CardManager } from './cardManager.js';
import { DebugMenu } from './debugMenu.js';
import { Warrior } from './warrior.js';
import { Mage } from './mage.js';
import { Preloader } from './preloader.js';
import { ThreeRenderer } from './threeRenderer.js';
import { Werewolf } from './werewolf.js';
import { Backpack } from './backpack.js';
import { LootManager } from './lootManager.js';
import { runLevel9 } from './levels/level9.js';
import { runLevel10 } from './levels/level10.js';
import { runLevel11 } from './levels/level11.js';
import { runLevel12 } from './levels/level12.js';
import { runLevel13 } from './levels/level13.js';
import { runLevel14 } from './levels/level14.js';
import { runLevel15 } from './levels/level15.js';
import { runLevel16 } from './levels/level16.js';
import { runLevel17 } from './levels/level17.js';
import { runLevel18 } from './levels/level18.js';
import { runLevel19 } from './levels/level19.js';
import { SoundManager } from './soundManager.js';
import { PlayerCharacter } from './playerCharacter.js';
import { runLevel6 } from './levels/level6.js';
import { runLevel7 } from './levels/level7.js';
import { runLevel8 } from './levels/level8.js';
import { runLevel1 } from './levels/level1.js';
import { runLevel2 } from './levels/level2.js';
import { runLevel3 } from './levels/level3.js';
import { runLevel4 } from './levels/level4.js';
import { runLevel5 } from './levels/level5.js';
import { LevelManager } from './levelManager.js';
import { Store } from './store.js';
import { QuestManager } from './questManager.js';
import { MapTransition } from './mapTransition.js';
import { StatusManager } from './statusManager.js';

// Handle HMR
if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
        // Only reload if we're in a level
        if (Game.instance && Game.instance.currentLevel) {
            // Get current level number
            const currentLevel = Game.instance.currentLevel;
            
            // Clean up current level
            if (Game.instance.questManager) {
                Game.instance.questManager.cleanup();
            }
            
            // Re-run the current level
            const levelFunction = window[`runLevel${currentLevel}`];
            if (levelFunction) {
                levelFunction(Game.instance);
            }
        }
    });
}

window.addEventListener('error', function (e) {
    try {
        localStorage.setItem('global_js_error', e.message + '\n' + (e.error && e.error.stack ? e.error.stack : ''));
    } catch (err) {}
});
window.addEventListener('unhandledrejection', function (e) {
    try {
        localStorage.setItem('global_js_error', 'Promise rejection: ' + (e.reason && e.reason.stack ? e.reason.stack : e.reason));
    } catch (err) {}
});

// =========================
// SECTION: Card Class
// =========================
class Card {
    constructor(name, attack, defense, cost) {
        this.name = name;
        this.attack = attack;
        this.defense = defense;
        this.cost = cost;
    }

    createCardElement() {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div style="padding: 10px; color: white;">
                <h3>${this.name}</h3>
                <p>Attack: ${this.attack}</p>
                <p>Defense: ${this.defense}</p>
                <p>Cost: ${this.cost}</p>
            </div>
        `;
        return card;
    }
}

// =========================
// SECTION: PlayerCharacter Class
// =========================
// (Moved to playerCharacter.js)

// =========================
// SECTION: SoundManager Class (moved to soundManager.js)

// =========================
// SECTION: Game Class
// =========================
export class Game {
    static instance = null;  // Singleton instance

    constructor() {
        if (Game.instance) {
            // Cleanup existing instance
            if (Game.instance.questManager) {
                Game.instance.questManager.cleanup();
            }
            Game.instance = this;
        } else {
            Game.instance = this;
        }

        // Track resources
        this.animationIntervals = new Set();
        this.eventListeners = new Map();
        this.domElements = new Set();
        this.resources = new Map();

        // Core game state
        this.player = null;
        this.enemies = [];
        this.currentLevel = 1;
        this.maxLevel = 25;  // Set max level to 25
        this.isPlayerTurn = true;
        this.isPaused = false;
        this.playerClass = null;
        this.playerDeck = null;
        this.cardManager = new CardManager(); // Initialize CardManager
        this.attackQueue = []; // Initialize attack queue
        this.lootManager = new LootManager(this); // Initialize LootManager
        this.statusManager = new StatusManager(this); // Initialize StatusManager

        // Initialize game state
        this.playerHealth = 100;
        this.playerDefense = 0;
        this.playerResource = 0;
        this.maxResource = 0;
        this.isTargeting = false;
        this.currentCard = null;
        this.sourceCard = null;
        this.targetingArrow = null;
        this.reservedResource = 0; // Track reserved resources
        this.effectRenderer = new ThreeRenderer();
        this.levelMusic = null; // Add level music property
        this.pauseMenu = null; // Add pause menu reference
        this.musicVolume = 0.5; // Add music volume
        this.sfxVolume = 0.5; // Add sound effects volume
        this.lastHurtSound = null;
        this.soundManager = SoundManager.instance || new SoundManager(); // Use existing instance or create new one
        this.levelManager = new LevelManager(this);
        this.store = new Store(this);

        // Initialize quest manager
        this.questManager = new QuestManager(this);

        // Load all sound effects
        const soundEffects = {
            'shieldHit': './assets/Audio/shieldhit.mp3',
            'hurt1': './assets/Audio/hurt1.mp3',
            'hurt2': './assets/Audio/hurt2.mp3',
            'hurt3': './assets/Audio/hurt3.mp3',
            'nextRound1': './assets/Audio/nextround.mp3',
            'nextRound2': './assets/Audio/nextround2.mp3',
            'running': './assets/Audio/running.mp3',
            'skelshield': './assets/Audio/skelshield.mp3',
            'skeledead': './assets/Audio/skeledead.mp3',
            'forestnar': './assets/Audio/forestnar.mp3',
            'forestmusic': './assets/Audio/forestmusic.mp3',
            'warforest': './assets/Audio/warforest.mp3',
            'fire1': './assets/Audio/fire1.mp3',
            'fire2': './assets/Audio/fire2.mp3',
            'explosion': './assets/Audio/explosion.mp3',
            'molten': './assets/Audio/molten.mp3',
            'inferno': './assets/Audio/inferno.mp3',
            'pyo': './assets/Audio/pyo.mp3',
            'heatwave': './assets/Audio/heatwave.mp3',
            'click': './assets/Audio/click.mp3',
            'wolfdead': './assets/Audio/wolfdead.mp3',
            'howl': './assets/Audio/howl.mp3',
            'exdeath': './assets/Audio/exdeath.mp3',
            'forestexit': './assets/Audio/forestexit.mp3',
            'townnar': './assets/Audio/townnar.mp3',
            'closed1': './assets/Audio/closed1.mp3',
            'closed2': './assets/Audio/closed2.mp3',
            'closed3': './assets/Audio/closed3.mp3',
            'mageintro': './assets/Audio/mageintro.wav',
            'warriorintro': './assets/Audio/warriorintro.mp3',
            'townday': './assets/Audio/townday.mp3'
        };

        // Load each sound effect
        Object.entries(soundEffects).forEach(([id, path]) => {
            this.soundManager.loadSound(id, path);
        });

        this.isLevelTransitioning = false;

        // Add keydown event listener for X key kill functionality
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'x') {
                this.isKillMode = true;
                document.body.style.cursor = 'crosshair';
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key.toLowerCase() === 'x') {
                this.isKillMode = false;
                document.body.style.cursor = 'default';
            }
        });

        // Add click handler for kill mode
        document.addEventListener('click', (e) => {
            if (this.isKillMode) {
                const enemyElement = e.target.closest('.enemy-character');
                if (enemyElement) {
                    const enemyId = parseInt(enemyElement.dataset.enemyId);
                    const enemy = this.enemies.find(e => e.id === enemyId);
                    if (enemy) {
                        enemy.destroy();
                        this.enemies = this.enemies.filter(e => e.id !== enemyId);
                        this.checkLevelCompletion();
                    }
                }
            }
        });

        // Add event listener for level completion
        document.addEventListener('levelComplete', (event) => {
            if (event.detail.level === 6) {
                this.handleLevel6Completion();
            }
        });

        this.showInventoryGrid = false;
        this.backpack = new Backpack(this);

        this.interactableRectsVisible = false; // Track visibility of interactable rectangles
        this.previousLevel = null; // Track previous level
        this.lastClosedSound = null;
        this.box1Clicked = false; // Add this line
        this.box2Clicked = false; // Add this line
        this.box3Clicked = false; // Add this line
        this.playerGold = 0; // Track player gold
        this.defeatedEnemies = [];
        this.originalCardValues = new Map(); // Store original card values
        this.mapTransition = new MapTransition(this);
    }

    // Method to track intervals
    trackInterval(interval) {
        this.animationIntervals.add(interval);
        return interval;
    }

    // Method to track DOM elements
    trackElement(element) {
        this.domElements.add(element);
        return element;
    }

    // Method to track event listeners
    addEventListener(element, type, handler) {
        if (!this.eventListeners.has(element)) {
            this.eventListeners.set(element, new Map());
        }
        const elementListeners = this.eventListeners.get(element);
        if (!elementListeners.has(type)) {
            elementListeners.set(type, new Set());
        }
        elementListeners.get(type).add(handler);
        element.addEventListener(type, handler);
    }

    // Method to track resources
    trackResource(id, resource) {
        this.resources.set(id, resource);
        return resource;
    }

    // Method to save current game state
    saveState() {
        return {
            player: this.player ? {
                health: this.player.health,
                defense: this.player.defense,
                resource: this.player.resource,
                maxResource: this.player.maxResource,
                hand: this.player.hand,
                drawPile: this.player.drawPile,
                discardPile: this.player.discardPile
            } : null,
            enemies: this.enemies.map(enemy => ({
                id: enemy.id,
                health: enemy.health,
                maxHealth: enemy.maxHealth,
                type: enemy.constructor.name
            })),
            currentLevel: this.currentLevel,
            isPlayerTurn: this.isPlayerTurn,
            isPaused: this.isPaused,
            playerClass: this.playerClass,
            playerDeck: this.playerDeck
        };
    }

    // Method to clean up all resources
    cleanup() {
        // Clear all animation intervals
        this.animationIntervals.forEach(interval => clearInterval(interval));
        this.animationIntervals.clear();

        // Remove all event listeners
        this.eventListeners.forEach((typeMap, element) => {
            typeMap.forEach((handlers, type) => {
                handlers.forEach(handler => {
                    element.removeEventListener(type, handler);
                });
            });
        });
        this.eventListeners.clear();

        // Clean up DOM elements
        this.domElements.forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        this.domElements.clear();

        // Clean up resources
        this.resources.forEach(resource => {
            if (resource instanceof Audio) {
                resource.pause();
                resource.src = '';
            }
        });
        this.resources.clear();

        // Clear all typewriter timeouts (for HMR)
        if (this.typewriterTimeouts) {
            this.typewriterTimeouts.forEach(clear => clear());
            this.typewriterTimeouts = [];
        }
        if (this.questManager) {
            this.questManager.cleanup();
        }
    }

    initialize(playerClass, playerDeck, level1Music = null) {
        // Clear any existing quests from localStorage when starting a new game
        localStorage.removeItem('quests');
        
        this.playerClass = playerClass;
        if (playerDeck) {
            this.playerDeck = playerDeck;
        } else if (playerClass === 'warrior') {
            const warrior = new Warrior();
            this.playerDeck = warrior.getDeck();
        } else if (playerClass === 'mage') {
            const mage = new Mage();
            this.playerDeck = mage.getDeck();
        } else {
            this.playerDeck = { hand: [], drawPile: [], discardPile: [] };
        }
        this.gameScene = document.querySelector('.game-scene');
        
        if (!this.gameScene) {
            console.error('Game scene not found!');
            return;
        }

        // Initialize backpack
        this.backpack.initialize();

        // Initialize player based on class
        if (playerClass === 'warrior') {
            const warrior = new Warrior();
            this.playerHealth = warrior.health;
            this.playerDefense = warrior.defense;
            this.maxResource = warrior.maxResource;
            this.playerResource = 4;
            this.playerCharacter = new PlayerCharacter(warrior.spriteSheet);
        } else if (playerClass === 'mage') {
            const mage = new Mage();
            this.playerHealth = mage.health;
            this.playerDefense = mage.defense;
            this.maxResource = mage.maxResource;
            this.playerResource = 10;
            this.playerCharacter = mage;
            // Give mage a health potion in backpack slot 8 and mana potion in slot 9
            this.backpack.addItem('healthpotion', 8);
            this.backpack.addItem('manapotion', 9);
        }

        // Show the game scene
        this.gameScene.style.display = 'flex';
        
        // Initialize the game
        this.initializeGame();

        // Initialize debug menu with level selector
        this.debugMenu = new DebugMenu(this);
        this.addLevelSelectorToDebugMenu();

        // Create pause menu
        this.createPauseMenu();
        
        // Add pause button event listener
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.togglePause();
            }
        });

        // Add gold UI if not present
        if (!document.querySelector('.gold-ui')) {
            const goldUI = document.createElement('div');
            goldUI.className = 'gold-ui';
            goldUI.style.position = 'fixed';
            goldUI.style.top = '18px';
            goldUI.style.right = '32px';
            goldUI.style.zIndex = '2100';
            goldUI.style.display = 'flex';
            goldUI.style.alignItems = 'center';
            goldUI.style.background = 'rgba(30,30,20,0.85)';
            goldUI.style.border = '2px solid gold';
            goldUI.style.borderRadius = '12px';
            goldUI.style.padding = '6px 16px 6px 10px';
            goldUI.style.boxShadow = '0 0 12px #ffd70088';
            goldUI.style.fontFamily = 'Cinzel, Times New Roman, serif';
            goldUI.style.fontSize = '1.3em';
            goldUI.innerHTML = `
                <img src="./assets/Images/gold.png" alt="Gold" style="width:32px;height:32px;margin-right:10px;vertical-align:middle;"> 
                <span class="gold-amount" style="color:gold;font-weight:bold;">0</span>
            `;
            document.body.appendChild(goldUI);
        }
        this.updateGoldUI();
    }

    updateGoldUI() {
        const goldAmount = document.querySelector('.gold-ui .gold-amount');
        if (goldAmount) {
            goldAmount.textContent = this.playerGold;
        }
    }

    addLevelSelectorToDebugMenu() {
        if (!this.debugMenu || !this.debugMenu.element) return;

        // Add level selector
        const levelSelectorContainer = document.createElement('div');
        levelSelectorContainer.style.marginTop = '10px';
        levelSelectorContainer.style.padding = '5px';
        levelSelectorContainer.style.backgroundColor = '#333';
        levelSelectorContainer.style.borderRadius = '3px';

        // Toggle interactable rectangles button
        const toggleRectsBtn = document.createElement('button');
        toggleRectsBtn.textContent = 'Toggle Doors';
        toggleRectsBtn.style.display = 'block';
        toggleRectsBtn.style.width = '100%';
        toggleRectsBtn.style.margin = '5px 0';
        toggleRectsBtn.style.padding = '5px';
        toggleRectsBtn.style.backgroundColor = '#4CAF50';
        toggleRectsBtn.style.color = 'white';
        toggleRectsBtn.style.border = 'none';
        toggleRectsBtn.style.borderRadius = '3px';
        toggleRectsBtn.style.cursor = 'pointer';
        toggleRectsBtn.onclick = () => this.toggleInteractableRects();
        levelSelectorContainer.appendChild(toggleRectsBtn);

        const levelSelectorLabel = document.createElement('div');
        levelSelectorLabel.textContent = 'Select Level:';
        levelSelectorLabel.style.marginBottom = '5px';
        levelSelectorLabel.style.color = '#fff';
        levelSelectorContainer.appendChild(levelSelectorLabel);

        const levelSelector = document.createElement('select');
        levelSelector.style.width = '100%';
        levelSelector.style.padding = '5px';
        levelSelector.style.backgroundColor = '#4CAF50';
        levelSelector.style.color = 'white';
        levelSelector.style.border = 'none';
        levelSelector.style.borderRadius = '3px';
        levelSelector.style.cursor = 'pointer';

        // Add options for each level up to 26
        for (let i = 1; i <= 26; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Level ${i}`;
            levelSelector.appendChild(option);
        }

        // Add event listener for level selection
        levelSelector.addEventListener('change', (e) => {
            const selectedLevel = parseInt(e.target.value);
            if (selectedLevel !== this.currentLevel) {
                this.currentLevel = selectedLevel;
                this.startNextLevel();
            }
        });

        levelSelectorContainer.appendChild(levelSelector);
        this.debugMenu.element.appendChild(levelSelectorContainer);
    }

    initializeGame() {
        // Always remove inn/town boxes at the start of any level
        document.querySelectorAll('.inn-door-box').forEach(el => el.remove());
        // Initialize player character
        const playerSide = document.querySelector('.player-side');
        if (playerSide) {
            playerSide.innerHTML = '';
            
            // Create level indicator
            const levelIndicator = document.createElement('div');
            levelIndicator.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                font-size: 24px;
                font-family: Arial, sans-serif;
                z-index: 1000;
                border: 2px solid #666;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            `;
            levelIndicator.textContent = `Level ${this.currentLevel}`;
            document.body.appendChild(levelIndicator);
            
            // Only create player element if not on level 7, 13, or 17
            if (this.currentLevel !== 7 && this.currentLevel !== 13 && this.currentLevel !== 17) {
                // Create player element with the already initialized playerCharacter
                const playerElement = this.playerCharacter.createPlayerElement();
                playerElement.setAttribute('data-class', this.playerClass); // Set the class attribute
                
                // Add shield aura
                const shieldAura = document.createElement('div');
                shieldAura.className = 'shield-aura';
                playerElement.appendChild(shieldAura);
                
                // Create a separate container for stats that won't move with the player
                const statsContainer = document.createElement('div');
                statsContainer.className = 'character-stats';
                statsContainer.style.position = 'absolute'; // Position absolutely
                statsContainer.style.left = '0'; // Align to the left of player side
                statsContainer.style.bottom = '0'; // Align to the bottom
                statsContainer.innerHTML = `
                    <div class="health-bar">
                        <div class="health-bar-fill" style="width: 100%"></div>
                    </div>
                    <div class="defense-bar">
                        <div class="defense-bar-fill" style="width: 0%"></div>
                        <div class="defense-text">Defense: 0</div>
                    </div>
                    <div class="resource-bar">
                        <div class="resource-bar-fill" style="width: ${(this.playerResource / this.maxResource) * 100}%"></div>
                    </div>
                    <div class="resource-label">${this.playerClass === 'mage' ? 'Mana' : 'Rage'}: ${this.playerResource}</div>
                `;
                
                // Add stats container to player side instead of player element
                playerSide.appendChild(playerElement);
                playerSide.appendChild(statsContainer);
                
                // Run-in animation for all levels except level 5
                if ((this.playerClass === 'mage' || this.playerClass === 'warrior') && this.currentLevel !== 5) {
                    playerElement.style.transition = 'none';
                    playerElement.style.transform = 'translateX(-600px)';
                    playerElement.style.opacity = '0';
                    setTimeout(() => {
                        playerElement.style.transition = 'transform 2s ease-out, opacity 0.1s ease-out';
                        playerElement.style.opacity = '1';
                        this.playerCharacter.playRunAnimation();
                        // Play running sound
                        const runningSound = this.soundManager.sounds.get('running');
                        if (runningSound) {
                            runningSound.currentTime = 1;
                            runningSound.play().catch(() => {});
                        }
                        playerElement.style.transform = 'translateX(0)';
                        setTimeout(() => {
                            this.playerCharacter.stopRunAnimation();
                            if (runningSound) {
                                runningSound.pause();
                                runningSound.currentTime = 0;
                            }
                        }, 2000);
                    }, 50);
                }
            }
        }

        // Add fade-in animation styles if they don't exist
        if (!document.getElementById('enemy-fade-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'enemy-fade-styles';
            styleSheet.textContent = `
                .enemy-character {
                    opacity: 0;
                    transition: opacity 1s ease-out;
                }
                .enemy-character.fade-in {
                    opacity: 1;
                }
            `;
            document.head.appendChild(styleSheet);
        }

        // Initialize enemy characters
        const enemySide = document.querySelector('.enemy-side');
        if (enemySide) {
            // Clear all existing enemies from the DOM
            while (enemySide.firstChild) {
                enemySide.removeChild(enemySide.firstChild);
            }
        }

        // Remove the big if/else for backgrounds and enemy spawns
        this.levelManager.initializeLevel(this.currentLevel);

        // Initialize player's hand
        this.updatePlayerHand(true);
        this.updatePileCounts();

        // Initialize end turn button
        const endTurnBtn = document.querySelector('.end-turn-btn');
        if (endTurnBtn) {
            endTurnBtn.addEventListener('click', () => this.endTurn());
        }

        // Create targeting arrow
        this.createTargetingArrow();

        // Ensure playfield exists
        let playfield = document.querySelector('.playfield');
        const gameScene = document.querySelector('.game-scene');
        if (!playfield && gameScene) {
            playfield = document.createElement('div');
            playfield.className = 'playfield';
            gameScene.insertBefore(playfield, gameScene.firstChild);
        }
    }

    createTargetingArrow() {
        console.log('Creating targeting arrow'); // Debug log
        if (this.targetingArrow) {
            this.targetingArrow.remove(); // Remove existing arrow if any
        }
        
        this.targetingArrow = document.createElement('div');
        this.targetingArrow.className = 'targeting-arrow';
        this.targetingArrow.style.display = 'none';
        document.querySelector('.game-scene').appendChild(this.targetingArrow);
    }

    startTargeting(cardId) {
        if (this.isTargeting) return;
        
        this.isTargeting = true;
        this.currentCard = cardId;
        
        // Create and show targeting arrow
        if (!this.targetingArrow) {
            this.targetingArrow = document.createElement('div');
            this.targetingArrow.className = 'targeting-arrow';
            this.targetingArrow.style.position = 'absolute';
            this.targetingArrow.style.height = '2px';
            this.targetingArrow.style.backgroundColor = '#ff0000';
            this.targetingArrow.style.transformOrigin = 'left center';
            this.targetingArrow.style.pointerEvents = 'none';
            this.targetingArrow.style.zIndex = '1000';
            document.body.appendChild(this.targetingArrow);
            this.trackElement(this.targetingArrow);
        }
        this.targetingArrow.style.display = 'block';
        
        // Add event listeners for targeting
        this.addEventListener(document, 'mousemove', this.updateArrowPosition);
        this.addEventListener(document, 'click', this.handleTargetSelection);
        this.addEventListener(document, 'click', this.handleOutsideClick);
        
        // Add visual feedback for targetable enemies
        this.enemies.forEach(enemy => {
            if (enemy.health > 0) {
                enemy.element.classList.add('targetable');
            }
        });
    }

    updateArrowPosition = (e) => {
        if (!this.isTargeting || !this.sourceCard) return;

        const cardRect = this.sourceCard.getBoundingClientRect();
        const startX = cardRect.left + cardRect.width / 2;
        const startY = cardRect.top + cardRect.height / 2;

        const angle = Math.atan2(e.clientY - startY, e.clientX - startX);
        
        // Calculate the distance to the mouse position
        const distance = Math.hypot(e.clientX - startX, e.clientY - startY);
        
        // Set a much larger maximum length to ensure it can reach any enemy
        const maxLength = Math.max(window.innerWidth, window.innerHeight) * 1.5;
        const length = Math.min(distance, maxLength);

        this.targetingArrow.style.transform = `translate(${startX}px, ${startY}px) rotate(${angle}rad)`;
        this.targetingArrow.style.width = `${length}px`;

        // Calculate the end point of the arrow
        const endX = startX + Math.cos(angle) * length;
        const endY = startY + Math.sin(angle) * length;

        // Find the enemy whose hitbox center is closest to the arrow end point horizontally
        let closestEnemy = null;
        let minDistance = Infinity;
        const MAX_TARGET_DISTANCE = 100; // Maximum horizontal distance to consider for targeting

        this.enemies.forEach(enemy => {
            if (enemy.element) {
                const spriteElement = enemy.element.querySelector('.enemy-sprite');
                if (spriteElement) {
                    const rect = spriteElement.getBoundingClientRect();
                    // Calculate hitbox dimensions (40% of sprite size)
                    const hitboxWidth = rect.width * 0.4;
                    const hitboxHeight = rect.height * 0.4;
                    
                    // Calculate hitbox center (only horizontal position matters)
                    const hitboxCenterX = rect.left + (rect.width - hitboxWidth) / 2 + hitboxWidth / 2;
                    
                    // Calculate horizontal distance from arrow end to hitbox center
                    const distance = Math.abs(endX - hitboxCenterX);
                    
                    // Only consider enemies within the maximum targeting distance
                    if (distance < MAX_TARGET_DISTANCE && distance < minDistance) {
                        minDistance = distance;
                        closestEnemy = enemy;
                    }
                }
            }
        });

        // Update targetable state for all enemies
        this.enemies.forEach(enemy => {
            if (enemy.element) {
                if (enemy === closestEnemy) {
                    enemy.element.classList.add('targetable');
                } else {
                    enemy.element.classList.remove('targetable');
                }
            }
        });
    }

    handleTargetSelection = (e) => {
        console.log('Target selection clicked');
        if (!this.isTargeting) return;

        const cardRect = this.sourceCard.getBoundingClientRect();
        const startX = cardRect.left + cardRect.width / 2;
        const startY = cardRect.top + cardRect.height / 2;

        const angle = Math.atan2(e.clientY - startY, e.clientX - startX);
        const distance = Math.hypot(e.clientX - startX, e.clientY - startY);
        const maxLength = Math.max(window.innerWidth, window.innerHeight) * 1.5;
        const length = Math.min(distance, maxLength);

        // Calculate the end point of the arrow
        const endX = startX + Math.cos(angle) * length;
        const endY = startY + Math.sin(angle) * length;

        // Find the enemy whose hitbox center is closest to the arrow end point horizontally
        let closestEnemy = null;
        let minDistance = Infinity;
        const MAX_TARGET_DISTANCE = 100; // Maximum horizontal distance to consider for targeting

        this.enemies.forEach(enemy => {
            if (enemy.element) {
                const spriteElement = enemy.element.querySelector('.enemy-sprite');
                if (spriteElement) {
                    const rect = spriteElement.getBoundingClientRect();
                    // Calculate hitbox dimensions (40% of sprite size)
                    const hitboxWidth = rect.width * 0.4;
                    const hitboxHeight = rect.height * 0.4;
                    
                    // Calculate hitbox center (only horizontal position matters)
                    const hitboxCenterX = rect.left + (rect.width - hitboxWidth) / 2 + hitboxWidth / 2;
                    
                    // Calculate horizontal distance from arrow end to hitbox center
                    const distance = Math.abs(endX - hitboxCenterX);
                    
                    // Only consider enemies within the maximum targeting distance
                    if (distance < MAX_TARGET_DISTANCE && distance < minDistance) {
                        minDistance = distance;
                        closestEnemy = enemy;
                    }
                }
            }
        });

        if (closestEnemy) {
            console.log('Closest enemy found:', closestEnemy);
            
            // Check if player has enough resources for this card
            const cardData = this.cardManager.getCard(this.currentCard);
            if (!cardData) {
                this.stopTargeting();
                return;
            }

            // Check if we have enough resources including what's already reserved
            if (this.playerResource - this.reservedResource < cardData.cost) {
                this.showResourceNotification(cardData.cost);
                this.stopTargeting();
                return;
            }

            // Add to attack queue instead of playing immediately
            this.attackQueue.push({
                cardId: this.currentCard,
                targetEnemy: closestEnemy,
                cost: cardData.cost
            });
            
            // Reserve the resources
            this.reservedResource += cardData.cost;
            
            // Update the card's appearance to show it's queued
            const cardElement = document.querySelector(`.card[data-card-id="${this.currentCard}"]`);
            if (cardElement) {
                cardElement.classList.add('queued');
                // Add a small indicator showing the target
                const targetIndicator = document.createElement('div');
                targetIndicator.className = 'target-indicator';
                targetIndicator.textContent = `→ ${closestEnemy.id}`;
                cardElement.appendChild(targetIndicator);
            }

            // Update the resource display to show reserved resources
            this.updateResourceBar();
        }

        this.stopTargeting();
    }

    handleOutsideClick = (e) => {
        if (!this.isTargeting) return;
        
        const cardRect = this.sourceCard.getBoundingClientRect();
        const startX = cardRect.left + cardRect.width / 2;
        const startY = cardRect.top + cardRect.height / 2;

        const angle = Math.atan2(e.clientY - startY, e.clientX - startX);
        const distance = Math.hypot(e.clientX - startX, e.clientY - startY);
        const maxLength = Math.max(window.innerWidth, window.innerHeight) * 1.5;
        const length = Math.min(distance, maxLength);

        // Calculate the end point of the arrow
        const endX = startX + Math.cos(angle) * length;
        const endY = startY + Math.sin(angle) * length;

        // Check if the arrow end point is far from all enemy hitboxes horizontally
        const MAX_TARGET_DISTANCE = 100; // Maximum horizontal distance to consider for targeting
        const isFarFromAllEnemies = this.enemies.every(enemy => {
            if (enemy.element) {
                const spriteElement = enemy.element.querySelector('.enemy-sprite');
                if (spriteElement) {
                    const rect = spriteElement.getBoundingClientRect();
                    // Calculate hitbox dimensions (40% of sprite size)
                    const hitboxWidth = rect.width * 0.4;
                    const hitboxHeight = rect.height * 0.4;
                    
                    // Calculate hitbox center (only horizontal position matters)
                    const hitboxCenterX = rect.left + (rect.width - hitboxWidth) / 2 + hitboxWidth / 2;
                    
                    // Calculate horizontal distance from arrow end to hitbox center
                    const distance = Math.abs(endX - hitboxCenterX);
                    
                    // Consider it far if distance is greater than the maximum targeting distance
                    return distance > MAX_TARGET_DISTANCE;
                }
            }
            return true;
        });
        
        if (isFarFromAllEnemies) {
            this.stopTargeting();
        }
    }

    stopTargeting() {
        console.log('Stopping targeting'); // Debug log
        this.isTargeting = false;
        this.currentCard = null;
        this.sourceCard = null;
        if (this.targetingArrow) {
            this.targetingArrow.style.display = 'none';
        }
        // Remove targetable class from all enemies
        this.enemies.forEach(enemy => {
            if (enemy.element) {
                enemy.element.classList.remove('targetable');
            }
        });
        document.removeEventListener('mousemove', this.updateArrowPosition);
        document.removeEventListener('click', this.handleTargetSelection);
        document.removeEventListener('click', this.handleOutsideClick);
    }

    updatePlayerHand(isInitialDeal = false, previousHandSize = 0) {
        const playerHand = document.querySelector('.player-hand');
        if (!playerHand) return;

        // Clear current hand
        playerHand.innerHTML = '';

        // Add cards from player's hand
        this.playerDeck.hand.forEach((cardId, index) => {
            const cardData = this.cardManager.getCard(cardId);
            if (cardData) {
                // Store original values if not already stored
                if (!this.originalCardValues.has(cardId)) {
                    this.originalCardValues.set(cardId, {
                        attack: cardData.attack,
                        defense: cardData.defense,
                        cost: cardData.cost
                    });
                }

                // Restore original values if they exist
                const originalValues = this.originalCardValues.get(cardId);
                if (originalValues) {
                    cardData.attack = originalValues.attack;
                    cardData.defense = originalValues.defense;
                    cardData.cost = originalValues.cost;
                }

                const cardElement = this.cardManager.createCardElement(cardData);
                cardElement.dataset.cardId = cardId;
                
                // Only add dealing class to new cards (those beyond the previous hand size)
                if (isInitialDeal && index >= previousHandSize) {
                    cardElement.classList.add('dealing');
                    // Remove dealing class after animation completes
                    setTimeout(() => {
                        cardElement.classList.remove('dealing');
                        cardElement.style.visibility = 'visible';
                        cardElement.style.opacity = '1';
                    }, 600); // Match the animation duration from CSS
                } else {
                    // For existing cards, make them visible immediately
                    cardElement.style.visibility = 'visible';
                    cardElement.style.opacity = '1';
                }
                
                // Check if this card is in the attack queue
                const queuedAttack = this.attackQueue.find(attack => attack.cardId === cardId);
                if (queuedAttack) {
                    cardElement.classList.add('queued');
                    const targetIndicator = document.createElement('div');
                    targetIndicator.className = 'target-indicator';
                    targetIndicator.textContent = `→ ${queuedAttack.targetEnemy.id}`;
                    cardElement.appendChild(targetIndicator);

                    // Add click handler to remove from queue
                    cardElement.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.removeFromQueue(cardId);
                    });
                } else {
                    // Add click handler for non-queued cards
                    cardElement.addEventListener('click', (e) => {
                        e.stopPropagation();
                        console.log('Card clicked:', cardData);
                        
                        // Play click sound
                        const clickSound = new Audio('./assets/Audio/click.mp3');
                        clickSound.volume = 0.5;
                        clickSound.play().catch(error => console.log('Error playing click sound:', error));
                        
                        if (cardData.type === 'Attack' || cardData.type === 'Magic') {
                            console.log('Starting targeting for attack/magic card');
                            this.sourceCard = cardElement; // Set the source card
                            this.startTargeting(cardId);
                        } else {
                            console.log('Playing non-targeting card');
                            this.playCard(cardId, this.enemies[0]);
                        }
                    });
                }
                
                playerHand.appendChild(cardElement);
            }
        });
    }

    updatePileCounts() {
        const drawPileCount = document.querySelector('.draw-pile .pile-count');
        const discardPileCount = document.querySelector('.discard-pile .pile-count');

        if (drawPileCount) {
            drawPileCount.textContent = this.playerDeck.drawPile.length;
        }
        if (discardPileCount) {
            discardPileCount.textContent = this.playerDeck.discardPile.length;
        }
    }

    playCard(cardId, targetEnemy) {
        if (!this.isPlayerTurn) return;

        // Find the card in the player's hand
        const cardIndex = this.playerDeck.hand.findIndex(card => card === cardId);
        if (cardIndex === -1) return;

        // Get the card data
        const cardData = this.cardManager.getCard(cardId);
        if (!cardData) return;

        // Calculate total cost including queued cards
        const totalCost = this.reservedResource + cardData.cost;

        // Check if player has enough resources for total cost
        if (this.playerResource < totalCost) {
            this.showResourceNotification(totalCost);
            return;
        }

        // Remove card from hand and add to discard pile
        const playedCard = this.playerDeck.hand.splice(cardIndex, 1)[0];
        this.playerDeck.discardPile.push(playedCard);

        // Deduct resource cost
        this.playerResource -= cardData.cost;

        // Apply card effects
        this.applyCardEffects(cardData, targetEnemy);

        // If the card is a Defense or Magic card with defense value, update defense and aura
        if ((cardData.type === 'Defense' || cardData.type === 'Magic') && cardData.defense) {
            this.playerDefense = Math.min(100, this.playerDefense + cardData.defense);
            this.updateDefenseBar();
        }

        // Update the display
        this.updatePlayerHand();
        this.updatePileCounts();
        this.updateHealthBars();
        this.updateResourceBar();
    }

    showResourceNotification(requiredCost) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'resource-notification';
        
        // Set the resource icon based on player class
        const resourceIcon = this.playerClass === 'mage' ? '🔮' : '⚔️';
        const resourceName = this.playerClass === 'mage' ? 'Mana' : 'Rage';
        
        notification.innerHTML = `
            <div class="resource-icon">${resourceIcon}</div>
            <h3>Not Enough ${resourceName}!</h3>
            <button class="close-notification">OK</button>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Show notification with animation
        notification.style.display = 'block';
        
        // Add click handler for close button
        const closeButton = notification.querySelector('.close-notification');
        closeButton.addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    applyCardEffects(cardData, targetEnemy) {
        if (!targetEnemy) return;

        const enemy = this.enemies.find(e => e.id === targetEnemy.id);
        if (!enemy) return;

        if (cardData.type === 'Attack' || cardData.type === 'Magic') {
            // Play sound effects before animation
            if (cardData.id === 'molten_strike') {
                this.soundManager.playSound('molten', this.sfxVolume);
            }
            else if (cardData.id === 'blaze_bolt') {
                this.soundManager.playSound('molten', this.sfxVolume);
            }

            // Play attack animation
            if (this.playerCharacter) {
                this.playerCharacter.playAttackAnimation();
                }
            }
    }

    updateHealthBars() {
        const playerHealthBar = document.querySelector('.health-bar-fill');
        if (playerHealthBar) {
            playerHealthBar.style.width = `${this.playerHealth}%`;
        }

        this.enemies.forEach(enemy => {
            const enemyHealthBar = enemy.element.querySelector('.health-bar-fill');
            if (enemyHealthBar) {
                enemyHealthBar.style.width = `${enemy.health}%`;
            }
        });
    }

    updateDefenseBar() {
        const defenseBar = document.querySelector('.defense-bar-fill');
        const shieldAura = document.querySelector('.shield-aura');
        if (defenseBar) {
            // Convert defense value to percentage (assuming max defense is 100)
            const defensePercentage = (this.playerDefense / 100) * 100;
            defenseBar.style.width = `${defensePercentage}%`;
            
            // Update the defense text if it exists
            const defenseText = document.querySelector('.defense-text');
            if (defenseText) {
                defenseText.textContent = `Defense: ${this.playerDefense}`;
            }

            // Update shield aura
            if (shieldAura) {
                if (this.playerDefense > 0) {
                    shieldAura.classList.add('active');
                } else {
                    shieldAura.classList.remove('active');
                }
            }
        }
    }

    drawCard() {
        if (this.playerDeck.drawPile.length === 0) {
            // If draw pile is empty, shuffle discard pile into draw pile
            this.playerDeck.drawPile = [...this.playerDeck.discardPile];
            this.playerDeck.discardPile = [];
            this.shuffleDeck();
        }

        if (this.playerDeck.drawPile.length > 0) {
            const card = this.playerDeck.drawPile.pop();
            this.playerDeck.hand.push(card);
            this.updatePlayerHand(false); // Not an initial deal
            this.updatePileCounts();
            return card;
        }
        return null;
    }

    shuffleDeck() {
        this.playerDeck.drawPile.sort(() => 0.5 - Math.random());
    }

    updateResourceBar() {
        const resourceBar = document.querySelector('.resource-bar-fill');
        const resourceLabel = document.querySelector('.resource-label');
        
        if (resourceBar) {
            // Show available resources (total minus reserved)
            const availableResource = this.playerResource - this.reservedResource;
            resourceBar.style.width = `${(availableResource / this.maxResource) * 100}%`;
        }
        if (resourceLabel) {
            const resourceName = this.playerClass === 'mage' ? 'Mana' : 'Rage';
            resourceLabel.textContent = `${resourceName}: ${this.playerResource - this.reservedResource} (${this.reservedResource} reserved)`;
        }
    }

    endTurn() {
        if (!this.isPlayerTurn) return;

        this.isPlayerTurn = false;
        const endTurnBtn = document.querySelector('.end-turn-btn');
        if (endTurnBtn) {
            endTurnBtn.disabled = true;
        }

        // Execute queued attacks
        this.executeQueuedAttacks().then(() => {
            // Wait for all visual effects to complete (2 seconds for heat wave, etc.)
            setTimeout(() => {
                // Enemy's turn
                this.enemyTurn();
            }, 2000);
        });
    }

    createFireballEffect(sourceElement, targetElement) {
        // Get source and target positions
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        
        // Calculate start position (center of player)
        const startX = sourceRect.left + sourceRect.width / 2;
        const startY = sourceRect.top + sourceRect.height / 2;
        
        // Get the enemy's sprite container
        const spriteElement = targetElement.querySelector('.enemy-sprite');
        const spriteRect = spriteElement ? spriteElement.getBoundingClientRect() : targetRect;
        
        // Calculate end position (center of enemy sprite)
        let endX = spriteRect.left + spriteRect.width / 2;
        let endY = spriteRect.top + spriteRect.height / 2;

        // Apply enemy-specific hitbox offsets
        if (targetElement.classList.contains('werewolf')) {
            // Werewolf hitbox: calculate center of the smaller green hitbox
            // The hitbox is positioned at the bottom center of the sprite
            endX = spriteRect.left + spriteRect.width / 2;  // Center horizontally
            endY = spriteRect.top + spriteRect.height * 0.7;  // Position at 70% down the sprite height
        } else if (targetElement.dataset.enemyId) {
            if (targetElement.dataset.enemyId === "1" || targetElement.dataset.enemyId === "2") {
                // Executioner hitbox offset
                endX += 50 - 15; // Move 50px to the right (because of sprite flip), then 15px left for hitbox center
                endY += 20; // Move 20px up to match the hitbox position
            } else if (targetElement.classList.contains('enemy-character') && (targetElement.dataset.enemyId === "3" || targetElement.dataset.enemyId === "4")) {
                // Skeleton hitbox offset (IDs 3 and 4)
                // No X offset, but move 40px down for hitbox center
                endY += 40;
            }
        }

        // Create WebGL fireball effect
        this.effectRenderer.createFireballEffect(startX, startY, endX, endY);
    }

    async executeQueuedAttacks() {
        for (const attack of this.attackQueue) {
            const cardData = this.cardManager.getCard(attack.cardId);
            if (!cardData) continue;

            // Remove card from hand and add to discard pile
            const cardIndex = this.playerDeck.hand.findIndex(card => card === attack.cardId);
            if (cardIndex !== -1) {
                const playedCard = this.playerDeck.hand.splice(cardIndex, 1)[0];
                this.playerDeck.discardPile.push(playedCard);
            }

            // Deduct the reserved resource cost
            this.playerResource = Math.max(0, this.playerResource - attack.cost);
            this.reservedResource -= attack.cost;

            // Check if there are any enemies left
            if (this.enemies.length === 0) {
                // No enemies left, end the attack phase
                break;
            }

            // For single-target spells, check if the target is still alive and valid
            if (attack.cardId !== 'heat_wave' && attack.cardId !== 'pyroclasm' && 
                attack.cardId !== 'meteor_strike' && attack.cardId !== 'inferno') {
                let targetEnemy = this.enemies.find(e => e.id === attack.targetEnemy.id && !e.hasRunAway && e.element);
                if (!targetEnemy) {
                    // Target is dead or invalid, find a new valid target
                    const newTarget = this.enemies.find(e => !e.hasRunAway && e.element);
                    if (!newTarget) {
                        // No valid enemies left, end the attack phase
                        break;
                    }
                    attack.targetEnemy = newTarget;
                } else {
                    attack.targetEnemy = targetEnemy;
                }
            }

            // Play attack animation
            if (this.playerCharacter) {
                this.playerCharacter.playAttackAnimation();
                
                // Play molten strike sound if it's a molten strike card
                if (attack.cardId === 'molten_strike') {
                    this.soundManager.playSound('molten', this.sfxVolume);
                }
            }

            // Wait for attack animation to complete
            await new Promise(resolve => setTimeout(resolve, 800));

            const enemyElement = attack.targetEnemy.element;
            if (enemyElement) {
                if (attack.cardId === 'fireball') {
                    const playerElement = document.querySelector('.player-character');
                    if (playerElement) {
                        // Play fireball sound effect
                        this.soundManager.playSound('fire1', this.sfxVolume);
                        
                        this.createFireballEffect(playerElement, enemyElement);
                        
                        // Wait for fireball to reach enemy, then play explosion
                        setTimeout(() => {
                            this.soundManager.playSound('explosion', this.sfxVolume);
                        }, 800); // Reduced from 4000ms to 800ms to match the fireball animation duration
                        
                        // Wait for fireball animation to complete
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                } else if (attack.cardId === 'inferno') {
                    // Create inferno effect for all enemies simultaneously
                    const infernoCleanups = [];
                    this.enemies.forEach(enemy => {
                        const spriteElement = enemy.element.querySelector('.enemy-sprite');
                        const spriteRect = spriteElement ? spriteElement.getBoundingClientRect() : enemy.element.getBoundingClientRect();
                        
                        // Calculate target position (center of enemy sprite)
                        const centerX = spriteRect.left + spriteRect.width / 2;
                        const centerY = spriteRect.top + spriteRect.height / 2;
                        
                        const width = spriteRect.width * 1.5; // Make the pillar wider than the enemy
                        const height = spriteRect.height * 2; // Make the pillar taller than the enemy
                        
                        // Create inferno effect for this enemy and store its cleanup function
                        const cleanup = this.effectRenderer.createInfernoEffect(centerX, centerY, width, height);
                        infernoCleanups.push(cleanup);
                    });

                    // Play inferno sound effect
                    const infernoSound = this.soundManager.sounds.get('inferno');
                    if (infernoSound) {
                        infernoSound.currentTime = 0;
                        infernoSound.volume = this.sfxVolume;
                        infernoSound.play();
                    
                        // Start fade out 600ms before the effect ends
                    setTimeout(() => {
                        const fadeOutInterval = setInterval(() => {
                                if (infernoSound.volume > 0.05) {
                                    infernoSound.volume -= 0.05; // Smaller steps for smoother fade
                            } else {
                                    infernoSound.pause();
                                    infernoSound.currentTime = 0;
                                clearInterval(fadeOutInterval);
                            }
                            }, 30); // More frequent updates for smoother fade
                        }, 800);
                    }
                    
                    // Wait for the visual effect to complete
                    await new Promise(resolve => setTimeout(resolve, 1400));
                    
                    // Clean up all inferno effects
                    infernoCleanups.forEach(cleanup => {
                        if (typeof cleanup === 'function') {
                            cleanup();
                        }
                    });
                } else if (attack.cardId === 'meteor_strike') {
                    // Calculate the center position of all enemies
                    let totalX = 0;
                    let totalY = 0;
                    this.enemies.forEach(enemy => {
                        const spriteElement = enemy.element.querySelector('.enemy-sprite');
                        const spriteRect = spriteElement ? spriteElement.getBoundingClientRect() : enemy.element.getBoundingClientRect();
                        
                        totalX += spriteRect.left + spriteRect.width / 2;
                        totalY += spriteRect.top + spriteRect.height / 2;
                    });
                    const centerX = totalX / this.enemies.length;
                    const centerY = totalY / this.enemies.length;
                    
                    // Create meteor effect with sound callback
                    this.effectRenderer.createMeteorEffect(centerX, centerY, () => {
                        this.soundManager.playSound('fire2', this.sfxVolume);
                    });
                    // Wait for meteor animation to complete
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else if (attack.cardId === 'blaze_bolt') {
                    // Get player and enemy positions for blaze bolt effect
                    const playerElement = document.querySelector('.player-character');
                    if (playerElement) {
                        const playerRect = playerElement.getBoundingClientRect();
                        const startX = playerRect.left + playerRect.width / 2;
                        const startY = playerRect.top + playerRect.height / 2;
                        
                        // Get the enemy's sprite container
                        const spriteElement = enemyElement.querySelector('.enemy-sprite');
                        const spriteRect = spriteElement ? spriteElement.getBoundingClientRect() : enemyElement.getBoundingClientRect();
                        
                        // Calculate end position (center of enemy sprite)
                        let endX = spriteRect.left + spriteRect.width / 2;
                        let endY = spriteRect.top + spriteRect.height / 2;

                        // Apply enemy-specific hitbox offsets
                        if (enemyElement.classList.contains('werewolf')) {
                            // Werewolf hitbox: calculate center of the smaller green hitbox
                            // The hitbox is positioned at the bottom center of the sprite
                            endX = spriteRect.left + spriteRect.width / 2;  // Center horizontally
                            endY = spriteRect.top + spriteRect.height * 0.75;  // Position at 75% down the sprite height (much lower)
                        } else if (enemyElement.dataset.enemyId) {
                            if (enemyElement.dataset.enemyId === "1" || enemyElement.dataset.enemyId === "2") {
                                // Executioner hitbox offset
                                endX += 50 - 15; // Move 50px to the right (because of sprite flip), then 15px left for hitbox center
                                endY += 20; // Move 20px up to match the hitbox position
                            } else if (enemyElement.classList.contains('enemy-character') && (enemyElement.dataset.enemyId === "3" || enemyElement.dataset.enemyId === "4")) {
                                // Skeleton hitbox offset (IDs 3 and 4)
                                // No X offset, but move 40px down for hitbox center
                                endY += 40;
                            }
                        }
                        
                        // Play blaze bolt sound effect
                        this.soundManager.playSound('molten', this.sfxVolume);
                        
                        // Create blaze bolt effect
                        this.effectRenderer.createFireBoltEffect(startX, startY, endX, endY);
                        
                        // Wait for blaze bolt to reach enemy, then play explosion
                        setTimeout(() => {
                            this.soundManager.playSound('explosion', this.sfxVolume);
                            
                            // Create explosion effect at impact point
                            this.effectRenderer.createFlameBurstEffect(endX, endY);
                        }, 300); // Slightly before the blaze bolt animation completes
                        
                        // Wait for blaze bolt animation to complete
                        await new Promise(resolve => setTimeout(resolve, 400));
                    }
                } else if (attack.cardId === 'molten_strike') {
                    // Get enemy position for molten strike effect
                    const spriteElement = enemyElement.querySelector('.enemy-sprite');
                    const spriteRect = spriteElement ? spriteElement.getBoundingClientRect() : enemyElement.getBoundingClientRect();
                    
                    // Calculate target position (center of enemy sprite)
                    let targetX = spriteRect.left + spriteRect.width / 2;
                    let targetY = spriteRect.top + spriteRect.height / 2;

                    // Apply enemy-specific hitbox offsets
                    if (enemyElement.classList.contains('werewolf')) {
                        // Werewolf hitbox: calculate center of the smaller green hitbox
                        // The hitbox is positioned at the bottom center of the sprite
                        targetX = spriteRect.left + spriteRect.width / 2;  // Center horizontally
                        targetY = spriteRect.top + spriteRect.height * 0.6;  // Position at 60% down the sprite height
                    } else if (enemyElement.dataset.enemyId) {
                        if (enemyElement.dataset.enemyId === "1" || enemyElement.dataset.enemyId === "2") {
                            // Executioner hitbox offset
                            targetX += 50 - 15; // Move 50px to the right (because of sprite flip), then 15px left for hitbox center
                            targetY += 20; // Move 20px up to match the hitbox position
                        } else if (enemyElement.classList.contains('enemy-character') && (enemyElement.dataset.enemyId === "3" || enemyElement.dataset.enemyId === "4")) {
                            // Skeleton hitbox offset (IDs 3 and 4)
                            // No X offset, but move 40px down for hitbox center
                            targetY += 40;
                        }
                    }
                    
                    // Create molten strike effect
                    this.effectRenderer.createMoltenStrikeEffect(targetX, targetY);
                    // Wait for molten strike animation to complete
                    await new Promise(resolve => setTimeout(resolve, 800));
                } else if (attack.cardId === 'pyroclasm') {
                    console.log('Triggering pyroclasm effect');
                    
                    // Play pyroclasm sound effect
                    this.soundManager.playSound('pyo', this.sfxVolume);
                    // Get player position for pyroclasm effect
                    const playerElement = document.querySelector('.player-character');
                    if (playerElement) {
                        // Play pyroclasm sound effect
                        this.soundManager.playSound('pyo', this.sfxVolume);

                        const playerRect = playerElement.getBoundingClientRect();
                        const mageX = playerRect.left + playerRect.width / 2;
                        const mageY = playerRect.top + playerRect.height / 2;
                        
                        // Create pyroclasm effect
                        this.effectRenderer.createPyroclasmEffect(mageX, mageY);
                        // Wait for pyroclasm animation to complete
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                } else if (attack.cardId === 'heat_wave') {
                    console.log('Triggering heat wave effect');
                    
                    // Create heat wave effect for all enemies
                    const heatwaveCleanups = [];
                    this.enemies.forEach(enemy => {
                        const spriteElement = enemy.element.querySelector('.enemy-sprite');
                        const spriteRect = spriteElement ? spriteElement.getBoundingClientRect() : enemy.element.getBoundingClientRect();
                        
                        // Calculate target position (center of enemy sprite)
                        const centerX = spriteRect.left + spriteRect.width / 2;
                        const centerY = spriteRect.top + spriteRect.height / 2;
                        
                        // Create heat wave effect for this enemy
                        const cleanup = this.effectRenderer.createHeatWaveEffect(centerX, centerY);
                        heatwaveCleanups.push(cleanup);
                    });

                    // Play heat wave sound effect
                    const heatwaveSound = this.soundManager.sounds.get('heatwave');
                    if (heatwaveSound) {
                        heatwaveSound.currentTime = 0;
                        heatwaveSound.volume = this.sfxVolume;
                        heatwaveSound.play();
                    }
                    
                    // Start fade out 0.5 seconds before the effect ends
                    setTimeout(() => {
                        if (heatwaveSound) {
                            const fadeOutInterval = setInterval(() => {
                                if (heatwaveSound.volume > 0.05) {
                                    heatwaveSound.volume -= 0.05;
                                } else {
                                    heatwaveSound.pause();
                                    heatwaveSound.currentTime = 0;
                                    clearInterval(fadeOutInterval);
                                }
                            }, 50);
                        }
                    }, 1500); // Start fade out at 1.5 seconds
                    
                    // Clean up effects after 2 seconds
                    setTimeout(() => {
                        // Clean up all heat wave effects
                        heatwaveCleanups.forEach(cleanup => {
                            if (typeof cleanup === 'function') {
                                cleanup();
                            }
                        });
                    }, 2000);
                } else if (attack.cardId === 'flame_burst') {
                    // Get enemy position for flame burst effect
                    const spriteElement = enemyElement.querySelector('.enemy-sprite');
                    const spriteRect = spriteElement ? spriteElement.getBoundingClientRect() : enemyElement.getBoundingClientRect();
                    
                    // Calculate target position (center of enemy sprite)
                    let targetX = spriteRect.left + spriteRect.width / 2;
                    let targetY = spriteRect.top + spriteRect.height / 2;
                    
                    // Apply enemy-specific hitbox offsets
                    if (enemyElement.classList.contains('werewolf')) {
                        // Werewolf hitbox: calculate center of the smaller green hitbox
                        // The hitbox is positioned at the bottom center of the sprite
                        targetX = spriteRect.left + spriteRect.width / 2;  // Center horizontally
                        targetY = spriteRect.top + spriteRect.height * 0.65;  // Position at 65% down the sprite height
                    } else if (enemyElement.dataset.enemyId) {
                        if (enemyElement.dataset.enemyId === "1" || enemyElement.dataset.enemyId === "2") {
                            // Executioner hitbox offset
                            targetX += 50 - 15; // Move 50px to the right (because of sprite flip), then 15px left for hitbox center
                            targetY += 20; // Move 20px up to match the hitbox position
                        } else if (enemyElement.classList.contains('enemy-character') && (enemyElement.dataset.enemyId === "3" || enemyElement.dataset.enemyId === "4")) {
                            // Skeleton hitbox offset (IDs 3 and 4)
                            // No X offset, but move 40px down for hitbox center
                            targetY += 40;
                        }
                    }
                    
                    // Play flame burst sound effect
                    this.soundManager.playSound('fire1', this.sfxVolume);
                    
                    // Create flame burst effect
                    this.effectRenderer.createFlameBurstEffect(targetX, targetY);
                    
                    // Wait for flame burst animation to complete
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            // Apply card effects
            if (attack.cardId === 'heat_wave' || attack.cardId === 'pyroclasm' || attack.cardId === 'meteor_strike' || attack.cardId === 'inferno') {
                // Apply damage to all enemies for heat wave, pyroclasm, meteor strike, and inferno
                for (const enemy of this.enemies) {
                    // Double damage if echoingFury buff is active
                    let damage = cardData.attack;
                    if (this.playerBuffs && this.playerBuffs.has('echoingFury')) {
                        damage *= 2;
                    }
                    const isDead = enemy.takeDamage(damage);
                    // Play skeledead.mp3 if a Skeleton dies
                    if (isDead && enemy.constructor.name === 'Skeleton') {
                        console.log('Playing skeledead.mp3');
                        this.soundManager.playSound('skeledead');
                    }
                    if (isDead) {
                        this.defeatedEnemies.push({ type: enemy.constructor.name });
                        enemy.destroy();
                        this.enemies = this.enemies.filter(e => e.id !== enemy.id);
                    }
                }
                this.checkLevelCompletion();
            } else {
                // Apply damage to single target for other cards
                const enemy = this.enemies.find(e => e.id === attack.targetEnemy.id);
                if (enemy) {
                    // Double damage if echoingFury buff is active
                    let damage = cardData.attack;
                    if (this.playerBuffs && this.playerBuffs.has('echoingFury')) {
                        damage *= 2;
                    }
                    const isDead = enemy.takeDamage(damage);
                    // Play skeledead.mp3 if a Skeleton dies
                    if (isDead && enemy.constructor.name === 'Skeleton') {
                        console.log('Playing skeledead.mp3');
                        this.soundManager.playSound('skeledead');
                    }
                    if (isDead) {
                        this.defeatedEnemies.push({ type: enemy.constructor.name });
                        enemy.destroy();
                        this.enemies = this.enemies.filter(e => e.id !== enemy.id);
                        this.checkLevelCompletion();
                    }
                }
            }

            // If the card is a Defense or Magic card with defense value, update defense and aura
            if ((cardData.type === 'Defense' || cardData.type === 'Magic') && cardData.defense) {
                this.playerDefense = Math.min(100, this.playerDefense + cardData.defense);
                this.updateDefenseBar();
            }

            // Update the display
            this.updatePlayerHand();
            this.updatePileCounts();
            this.updateHealthBars();
            this.updateResourceBar();

            // Wait a bit between attacks to make the sequence more visible
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Clear the attack queue and reserved resources
        this.attackQueue = [];
        this.reservedResource = 0;
    }

    enemyTurn() {
        let currentEnemyIndex = 0;

        const processNextEnemy = () => {
            if (currentEnemyIndex >= this.enemies.length) {
                this.startPlayerTurn();
                return;
            }

            const attackingEnemy = this.enemies[currentEnemyIndex];
            const damage = Math.floor(Math.random() * 5) + 1;

            // Register the event handler BEFORE starting the attack animation
            const handleAttackFrame = (event) => {
                if (event.detail.enemyId === attackingEnemy.id) {
                    this.applyEnemyDamage(attackingEnemy, damage);
                }
            };
            document.addEventListener('enemyAttackFrame', handleAttackFrame);

            attackingEnemy.playAttackAnimation();
            
            const animationDuration = attackingEnemy.constructor.name === 'FlyingDemon' ? 1200 : 2600;

            setTimeout(() => {
                document.removeEventListener('enemyAttackFrame', handleAttackFrame);
                currentEnemyIndex++;
                processNextEnemy();
            }, animationDuration);
        };

        processNextEnemy();
    }

    startPlayerTurn() {
        this.isPlayerTurn = true;
        const endTurnBtn = document.querySelector('.end-turn-btn');
        if (endTurnBtn) {
            endTurnBtn.disabled = false;
        }

        // Update resources for the turn
        if (this.playerClass === 'mage') {
            this.playerResource = 10;
        } else {
            // Warrior gets 4 rage each turn, added to existing rage
            this.playerResource += 4;
        }
        this.updateResourceBar();

        // Store current hand size before drawing new cards
        const currentHandSize = this.playerDeck.hand.length;

        // Draw cards until player has 5 cards, keeping existing cards
        const cardsToDraw = 5 - currentHandSize;
        for (let i = 0; i < cardsToDraw; i++) {
            // If draw pile is empty, try to shuffle discard pile into draw pile
            if (this.playerDeck.drawPile.length === 0 && this.playerDeck.discardPile.length > 0) {
                this.playerDeck.drawPile = [...this.playerDeck.discardPile];
                this.playerDeck.discardPile = [];
                this.shuffleDeck();
            }
            
            const card = this.drawCard();
            if (!card) {
                // If we still can't draw a card, break to prevent infinite loop
                console.warn('Could not draw a card - both draw pile and discard pile are empty');
                break;
            }
        }

        // Update hand with dealing animation, passing the previous hand size
        this.updatePlayerHand(true, currentHandSize);
    }

    applyEnemyDamage(enemy, damage) {
        let remainingDamage = damage;
        if (this.playerDefense > 0) {
            try {
                this.soundManager.playSound('shieldHit');
            } catch (error) {
                console.warn('Failed to play shield hit sound:', error);
            }

            if (this.playerDefense >= damage) {
                this.playerDefense -= damage;
                remainingDamage = 0;
                const shieldAura = document.querySelector('.shield-aura');
                if (shieldAura) {
                    shieldAura.classList.add('hit');
                    setTimeout(() => {
                        shieldAura.classList.remove('hit');
                    }, 500);
                }
            } else {
                remainingDamage = damage - this.playerDefense;
                this.playerDefense = 0;
                const shieldAura = document.querySelector('.shield-aura');
                if (shieldAura) {
                    shieldAura.classList.add('hit');
                    setTimeout(() => {
                        shieldAura.classList.remove('hit');
                    }, 500);
                }
            }
        }

        if (remainingDamage > 0) {
            this.playerHealth = Math.max(0, this.playerHealth - remainingDamage);
            if (this.playerCharacter) {
                this.playerCharacter.playHurtAnimation();
                
                if (this.playerClass === 'mage') {
                    try {
                        const hurtSounds = ['hurt1', 'hurt2', 'hurt3'];
                        const availableSounds = hurtSounds.filter(sound => sound !== this.lastHurtSound);
                        const randomSound = availableSounds[Math.floor(Math.random() * availableSounds.length)];
                        this.lastHurtSound = randomSound;
                        this.soundManager.playSound(randomSound);
                    } catch (error) {
                        console.warn('Failed to play hurt sound:', error);
                    }
                }
            }
        }

        this.updateHealthBars();
        this.updateDefenseBar();

        if (this.playerClass === 'warrior' && remainingDamage > 0) {
            this.playerResource += remainingDamage;
            this.updateResourceBar();
        }

        if (this.playerHealth <= 0) {
            this.endGame();
            return;
        }
    }

    endGame(isVictory = false) {
        const winner = isVictory ? 'Player' : (this.playerHealth <= 0 ? 'Enemy' : 'Player');
        
        // Create game over modal
        const modal = document.createElement('div');
        modal.className = 'game-over-modal';
        modal.style.display = 'flex';
        
        const content = document.createElement('div');
        content.className = 'game-over-content';
        content.innerHTML = `
            <h2>${isVictory ? 'Victory!' : 'Game Over!'}</h2>
            <p>${winner} wins!</p>
            <button class="restart-button">Play Again</button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Add click handler for restart button
        const restartButton = content.querySelector('.restart-button');
        restartButton.addEventListener('click', () => {
            modal.remove();
            location.reload();
        });
    }

    // Add method to remove a card from the queue
    removeFromQueue(cardId) {
        const attackIndex = this.attackQueue.findIndex(attack => attack.cardId === cardId);
        if (attackIndex !== -1) {
            const attack = this.attackQueue[attackIndex];
            // Return the reserved resources
            this.reservedResource -= attack.cost;
            // Remove from queue
            this.attackQueue.splice(attackIndex, 1);
            // Update the display
            this.updateResourceBar();
            this.updatePlayerHand();
        }
    }

    createDebugMenu() {
        const debugMenu = document.createElement('div');
        debugMenu.style.position = 'fixed';
        debugMenu.style.top = '10px';
        debugMenu.style.right = '10px';
        debugMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        debugMenu.style.padding = '10px';
        debugMenu.style.borderRadius = '5px';
        debugMenu.style.zIndex = '1000';
        debugMenu.style.color = 'white';
        debugMenu.style.fontFamily = 'Arial, sans-serif';
        debugMenu.style.fontSize = '14px';

        // Add debug controls
        const controls = [
            { label: 'Add to Hand', action: () => this.addCardToHand() },
            { label: 'Draw Card', action: () => this.drawCard() },
            { label: 'End Turn', action: () => this.endTurn() },
            { label: 'Toggle AI', action: () => this.toggleAI() },
            { label: 'Skip Level', action: () => this.skipLevel() },
        ];

        controls.forEach(control => {
            const button = document.createElement('button');
            button.textContent = control.label;
            button.style.display = 'block';
            button.style.width = '100%';
            button.style.margin = '5px 0';
            button.style.padding = '5px';
            button.style.backgroundColor = '#4CAF50';
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '3px';
            button.style.cursor = 'pointer';
            button.onclick = control.action;
            debugMenu.appendChild(button);
        });

        // Add Toggle Doors button to main debug menu
        const toggleRectsBtn = document.createElement('button');
        toggleRectsBtn.textContent = 'Toggle Doors';
        toggleRectsBtn.style.display = 'block';
        toggleRectsBtn.style.width = '100%';
        toggleRectsBtn.style.margin = '5px 0';
        toggleRectsBtn.style.padding = '5px';
        toggleRectsBtn.style.backgroundColor = '#4CAF50';
        toggleRectsBtn.style.color = 'white';
        toggleRectsBtn.style.border = 'none';
        toggleRectsBtn.style.borderRadius = '3px';
        toggleRectsBtn.style.cursor = 'pointer';
        toggleRectsBtn.onclick = () => this.toggleInteractableRects();
        debugMenu.appendChild(toggleRectsBtn);

        // Add level selector
        const levelSelectorContainer = document.createElement('div');
        levelSelectorContainer.style.marginTop = '10px';
        levelSelectorContainer.style.padding = '5px';
        levelSelectorContainer.style.backgroundColor = '#333';
        levelSelectorContainer.style.borderRadius = '3px';

        const levelSelectorLabel = document.createElement('div');
        levelSelectorLabel.textContent = 'Select Level:';
        levelSelectorLabel.style.marginBottom = '5px';
        levelSelectorLabel.style.color = '#fff';
        levelSelectorContainer.appendChild(levelSelectorLabel);

        const levelSelector = document.createElement('select');
        levelSelector.style.width = '100%';
        levelSelector.style.padding = '5px';
        levelSelector.style.backgroundColor = '#4CAF50';
        levelSelector.style.color = 'white';
        levelSelector.style.border = 'none';
        levelSelector.style.borderRadius = '3px';
        levelSelector.style.cursor = 'pointer';

        // Add options for each level up to 26
        for (let i = 1; i <= 26; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Level ${i}`;
            levelSelector.appendChild(option);
        }

        // Add event listener for level selection
        levelSelector.addEventListener('change', (e) => {
            const selectedLevel = parseInt(e.target.value);
            if (selectedLevel !== this.currentLevel) {
                this.currentLevel = selectedLevel;
                this.startNextLevel();
            }
        });

        levelSelectorContainer.appendChild(levelSelector);
        debugMenu.appendChild(levelSelectorContainer);

        document.body.appendChild(debugMenu);
    }

    addCardToHand(cardId) {
        if (cardId) {
            // Add the card directly to the player's hand
            this.playerDeck.hand.push(cardId);
            
            // Update the hand display
            this.updatePlayerHand();
            
            // Log the action
            console.log(`Added card ${cardId} to hand`);
        } else {
            console.log('No card selected');
        }
    }

    createPauseMenu() {
        this.pauseMenu = document.createElement('div');
        this.pauseMenu.className = 'pause-menu';
        this.pauseMenu.style.display = 'none';
        
        this.pauseMenu.innerHTML = `
            <div class="pause-content">
                <h2>Pause Menu</h2>
                <div class="volume-controls">
                    <div class="volume-slider">
                        <label for="music-volume">Music Volume</label>
                        <input type="range" id="music-volume" min="0" max="100" value="50">
                    </div>
                    <div class="volume-slider">
                        <label for="sfx-volume">Sound Effects Volume</label>
                        <input type="range" id="sfx-volume" min="0" max="100" value="50">
                    </div>
                </div>
                <button class="resume-button">Resume Game</button>
            </div>
        `;

        // Add event listeners for volume sliders
        const musicSlider = this.pauseMenu.querySelector('#music-volume');
        const sfxSlider = this.pauseMenu.querySelector('#sfx-volume');
        
        musicSlider.addEventListener('input', (e) => {
            this.musicVolume = e.target.value / 100;
            if (this.levelMusic) {
                this.levelMusic.volume = this.musicVolume;
            }
        });

        sfxSlider.addEventListener('input', (e) => {
            this.sfxVolume = e.target.value / 100;
        });

        // Add event listener for resume button
        const resumeButton = this.pauseMenu.querySelector('.resume-button');
        resumeButton.addEventListener('click', () => this.togglePause());

        document.body.appendChild(this.pauseMenu);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseMenu.style.display = this.isPaused ? 'flex' : 'none';
        
        if (this.isPaused) {
            // Pause the game
            this.soundManager.pauseMusic();
            // Disable game interactions
            this.gameScene.style.pointerEvents = 'none';
        } else {
            // Resume the game
            this.soundManager.resumeMusic();
            // Re-enable game interactions
            this.gameScene.style.pointerEvents = 'auto';
        }
    }

    checkLevelCompletion() {
        if (this.enemies.length === 0 && !this.isLevelTransitioning) {
            this.isLevelTransitioning = true;
            
            // Generate and show loot before player runs off
            const loot = this.lootManager.generateLoot(this.defeatedEnemies);
            this.lootManager.showLootBox(loot);
            this.defeatedEnemies = [];
        }
    }

    continueLevelTransition() {
            // If player is a mage, make them exit to the right
            if (this.playerClass === 'mage') {
                const playerElement = document.querySelector('.player-character');
                if (playerElement) {
                    // Store original position for reset
                    const originalPosition = playerElement.style.transform;
                    
                    // Wait 3 seconds before starting the exit animation
                    setTimeout(() => {
                        // Start the run animation
                        this.playerCharacter.playRunAnimation();
                        
                        // Play running sound starting 1 second in
                        const runningSound = this.soundManager.sounds.get('running');
                        if (runningSound) {
                            runningSound.currentTime = 1;
                            runningSound.play().catch(error => console.log('Error playing running sound:', error));
                        }
                        
                        // Animate mage moving right with a fixed pixel value to ensure it's off screen
                        playerElement.style.transition = 'transform 4s ease-out';
                        playerElement.style.transform = 'translateX(1200px)';
                        
                        // Wait for animation to complete before showing level transition
                        setTimeout(() => {
                            // Stop the run animation
                            this.playerCharacter.stopRunAnimation();
                            
                            // Stop running sound
                            if (runningSound) {
                                runningSound.pause();
                                runningSound.currentTime = 0;
                            }
                            
                            // Play appropriate level completion sound after mage has left
                            if (this.currentLevel === 1) {
                                this.soundManager.playSound('nextRound1');
                            } else if (this.currentLevel === 2) {
                                this.soundManager.playSound('nextRound2');
                            }
                            this.levelManager.handleLevelTransition();
                        }, 4000);
                    }, 3000);
                }
            } else if (this.playerClass === 'warrior') {
                const playerElement = document.querySelector('.player-character');
                if (playerElement) {
                    // Store original position for reset
                    const originalPosition = playerElement.style.transform;
                    
                    // Wait 3 seconds before starting the exit animation
                    setTimeout(() => {
                        // Start the run animation
                        this.playerCharacter.playRunAnimation();
                        
                        // Play running sound starting 1 second in
                        const runningSound = this.soundManager.sounds.get('running');
                        if (runningSound) {
                            runningSound.currentTime = 1;
                            runningSound.play().catch(error => console.log('Error playing running sound:', error));
                        }
                        
                        // Animate warrior moving right with a fixed pixel value to ensure it's off screen
                        playerElement.style.transition = 'transform 4s ease-out';
                        playerElement.style.transform = 'translateX(1200px)';
                        
                        // Wait for animation to complete before showing level transition
                        setTimeout(() => {
                            // Stop the run animation
                            this.playerCharacter.stopRunAnimation();
                            
                            // Stop running sound
                            if (runningSound) {
                                runningSound.pause();
                                runningSound.currentTime = 0;
                            }
                            
                            // Play appropriate level completion sound after warrior has left
                            if (this.currentLevel === 1) {
                                this.soundManager.playSound('nextRound1');
                            } else if (this.currentLevel === 2) {
                                this.soundManager.playSound('nextRound2');
                            }
                            this.levelManager.handleLevelTransition();
                        }, 4000);
                    }, 3000);
                }
            } else {
                // For other character types, show transition immediately
                this.levelManager.handleLevelTransition();
        }
    }

    startNextLevel() {
        // Clear existing enemies and their animations
        if (this.enemies) {
            this.enemies.forEach(enemy => {
                if (enemy.animationInterval) {
                    clearInterval(enemy.animationInterval);
                }
                if (enemy.element && enemy.element.parentNode) {
                    enemy.element.parentNode.removeChild(enemy.element);
                }
            });
            this.enemies = []; // Clear the enemies array
        }

        // Stop any existing music before starting new level
        if (this.currentLevel === 19) {
            // Force stop all music and clear any existing music reference
            this.soundManager.stopMusic(false);
            this.soundManager.currentMusic = null;
            
            // Stop and reset ALL audio elements
            this.soundManager.sounds.forEach(audio => {
                if (audio instanceof Audio) {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.loop = false;
                    audio.volume = 0;
                }
            });

            // Explicitly stop and reset townday.mp3 if it exists
            const towndayMusic = this.soundManager.sounds.get('townday');
            if (towndayMusic) {
                towndayMusic.pause();
                towndayMusic.currentTime = 0;
                towndayMusic.loop = false;
                towndayMusic.volume = 0;
            }

            // Clear any existing level music
            if (this.levelMusic) {
                this.levelMusic.pause();
                this.levelMusic.currentTime = 0;
                this.levelMusic = null;
            }
        }

        // Clear enemy-side element
        const enemySide = document.querySelector('.enemy-side');
        if (enemySide) {
            while (enemySide.firstChild) {
                enemySide.removeChild(enemySide.firstChild);
            }
        }

        // Reset game state for new level
        this.isPlayerTurn = true;
        // Initialize resources based on player class
        if (this.playerClass === 'mage') {
            this.playerResource = 10;
        } else {
            this.playerResource = 0;
        }
        this.playerDefense = 0;
        this.updateResourceBar();
        this.updateDefenseBar();
        this.updateHealthBars();
        this.updatePileCounts();
        this.updatePlayerHand(true);

        // Update level indicator
        const levelIndicator = document.querySelector('.level-indicator');
        if (levelIndicator) {
            levelIndicator.textContent = `Level ${this.currentLevel}`;
        } else {
            // Create level indicator if it doesn't exist
            const newLevelIndicator = document.createElement('div');
            newLevelIndicator.className = 'level-indicator';
            newLevelIndicator.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                font-size: 24px;
                font-family: Arial, sans-serif;
                z-index: 1000;
                border: 2px solid #666;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            `;
            newLevelIndicator.textContent = `Level ${this.currentLevel}`;
            document.body.appendChild(newLevelIndicator);
        }

        // Notify quest manager of level change
        this.questManager.onLevelChange(this.currentLevel);

        // Initialize the new level
        this.levelManager.initializeLevel(this.currentLevel);
    }

    removeContinueButton() {
        const btn = document.querySelector('.continue-btn');
        if (btn) btn.remove();
    }

    handleContinueLevel4() {
        this.removeContinueButton();
        // Complete the Graveyard Shift quest
        this.questManager.completeQuest('graveyard_shift');
        
        // Player runs off screen like previous levels, then go to map screen
        const playerElement = document.querySelector('.player-character');
        if (playerElement) {
            this.playerCharacter.playRunAnimation();
            const runningSound = this.soundManager.sounds.get('running');
            if (runningSound) {
                runningSound.currentTime = 1;
                runningSound.play().catch(error => console.log('Error playing running sound:', error));
            }
            // Fade out current background music
            if (this.levelMusic) {
                const fadeOut = setInterval(() => {
                    if (this.levelMusic.volume > 0.05) {
                        this.levelMusic.volume -= 0.05;
                    } else {
                        this.levelMusic.volume = 0;
                        this.levelMusic.pause();
                        clearInterval(fadeOut);
                    }
                }, 100);
            }
            playerElement.style.transition = 'transform 4s ease-out';
            playerElement.style.transform = 'translateX(1200px)';
            setTimeout(() => {
                this.playerCharacter.stopRunAnimation();
                if (runningSound) {
                    runningSound.pause();
                    runningSound.currentTime = 0;
                }
                // Instead of going to level 5, show the map screen
                this.showMapScreen();
            }, 4000);
        } else {
            // Fallback: just go to map screen
            if (this.levelMusic) {
                const fadeOut = setInterval(() => {
                    if (this.levelMusic.volume > 0.05) {
                        this.levelMusic.volume -= 0.05;
                    } else {
                        this.levelMusic.volume = 0;
                        this.levelMusic.pause();
                        clearInterval(fadeOut);
                    }
                }, 100);
            }
            // Instead of going to level 5, show the map screen
            this.showMapScreen();
        }
    }

    skipLevel() {
        if (this.currentLevel < this.maxLevel) {
            this.currentLevel++;
            this.startNextLevel();
        } else {
            this.showVictoryScreen();
        }
    }

    addContinueDeeperButton() {
        this.removeContinueDeeperButton();
        const btn = document.createElement('button');
        btn.className = 'continue-deeper-btn';
        btn.textContent = 'Continue Deeper';
        btn.style.position = 'absolute';
        btn.style.top = '50%';
        btn.style.right = '40px';
        btn.style.transform = 'translateY(-50%)';
        btn.style.zIndex = '10';
        btn.style.padding = '20px 40px';
        btn.style.fontSize = '1.5em';
        btn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
        btn.style.color = '#b6ffb6';
        btn.style.border = '2px solid #39ff14';
        btn.style.borderRadius = '16px';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = '0 0 24px 4px #39ff1466, 0 4px 24px rgba(0,0,0,0.7)';
        btn.style.fontFamily = '"Cinzel", "Times New Roman", serif';
        btn.style.letterSpacing = '1px';
        btn.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
        btn.style.transition = 'box-shadow 0.2s, background 0.2s, color 0.2s';
        btn.onmouseenter = () => {
            btn.style.boxShadow = '0 0 32px 8px #39ff14cc, 0 4px 32px rgba(0,0,0,0.8)';
            btn.style.background = 'linear-gradient(135deg, #223322 60%, #3e6d3e 100%)';
            btn.style.color = '#eaffea';
        };
        btn.onmouseleave = () => {
            btn.style.boxShadow = '0 0 24px 4px #39ff1466, 0 4px 24px rgba(0,0,0,0.7)';
            btn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
            btn.style.color = '#b6ffb6';
        };
        btn.addEventListener('click', () => this.completeLevel5());
        const playfield = document.querySelector('.playfield');
        if (playfield) {
            playfield.appendChild(btn);
        } else {
            document.body.appendChild(btn);
        }
    }

    removeContinueDeeperButton() {
        const btn = document.querySelector('.continue-deeper-btn');
        if (btn) btn.remove();
    }

    completeLevel5() {
        this.removeContinueDeeperButton();
        // Add the Lurking Silence quest
        this.questManager.addQuest('lurking_silence', 'Lurking Silence', 'Something hunts in the dark. Make it to town before you\'re caught.');
        
        // Fade out forest narration sounds
        const forestNar = this.soundManager.sounds.get('forestnar');
        const warForest = this.soundManager.sounds.get('warforest');
        
        const fadeOutSound = (sound) => {
            if (sound) {
                const fadeOut = setInterval(() => {
                    if (sound.volume > 0.05) {
                        sound.volume -= 0.05;
                    } else {
                        sound.volume = 0;
                        sound.pause();
                        clearInterval(fadeOut);
                    }
                }, 100);
            }
        };

        fadeOutSound(forestNar);
        fadeOutSound(warForest);

        // Player runs off screen before showing level 6
        const playerElement = document.querySelector('.player-character');
        if (playerElement) {
            this.playerCharacter.playRunAnimation();
            const runningSound = this.soundManager.sounds.get('running');
            if (runningSound) {
                runningSound.currentTime = 1;
                runningSound.play().catch(error => console.log('Error playing running sound:', error));
            }
            playerElement.style.transition = 'transform 4s ease-out';
            playerElement.style.transform = 'translateX(1200px)';
            setTimeout(() => {
                this.playerCharacter.stopRunAnimation();
                if (runningSound) {
                    runningSound.pause();
                    runningSound.currentTime = 0;
                }
                // Advance to level 6 and start next level
                this.currentLevel = 6;
                this.startNextLevel();
            }, 4000);
        } else {
            // Fallback: just go to level 6
            this.currentLevel = 6;
            this.startNextLevel();
        }
    }

    showMapScreen(fromLocation = { image: 'forest2.png' }, toLocation = { image: 'town.png' }, onComplete) {
        this.mapTransition.showMapScreen(fromLocation, toLocation, onComplete);
    }

    handleLevel6Completion() {
        // Wait a short moment before player follows
        setTimeout(() => {
            const playerElement = document.querySelector('.player-character');
            if (playerElement) {
                // Start with player in current position
                const originalPosition = playerElement.style.transform;
                
                // Start the run animation
                this.playerCharacter.playRunAnimation();
                
                // Play running sound starting 1 second in
                const runningSound = this.soundManager.sounds.get('running');
                if (runningSound) {
                    runningSound.currentTime = 1;
                    runningSound.play().catch(error => console.log('Error playing running sound:', error));
                }
                
                // Animate player moving right with a fixed pixel value to ensure it's off screen
                playerElement.style.transition = 'transform 4s ease-out';
                playerElement.style.transform = 'translateX(1200px)';
                
                // Wait for animation to complete before showing level transition
                setTimeout(() => {
                    // Stop the run animation
                    this.playerCharacter.stopRunAnimation();
                    
                    // Stop running sound
                    if (runningSound) {
                        runningSound.pause();
                        runningSound.currentTime = 0;
                    }
                    
                    // Show level transition
                    this.levelManager.handleLevelTransition();
                }, 4000);
            }
        }, 1000); // Wait 1 second before player starts following
    }

    toggleInventoryGrid() {
        this.backpack.toggleInventoryGrid();
    }

    showEnterTownButton() {
        // Remove any existing button
        const existingBtn = document.querySelector('.enter-town-btn');
        if (existingBtn) existingBtn.remove();
        const btn = document.createElement('button');
        btn.className = 'enter-town-btn';
        btn.textContent = 'Enter Town';
        btn.style.position = 'absolute';
        btn.style.top = '50%';
        btn.style.left = '50%';
        btn.style.transform = 'translate(-50%, -50%)';
        btn.style.zIndex = '2000';
        btn.style.padding = '24px 64px';
        btn.style.fontSize = '2em';
        btn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
        btn.style.color = '#b6ffb6';
        btn.style.border = '2px solid #39ff14';
        btn.style.borderRadius = '16px';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = '0 0 32px 8px #39ff14cc, 0 4px 32px rgba(0,0,0,0.8)';
        btn.style.fontFamily = 'Cinzel, Times New Roman, serif';
        btn.style.letterSpacing = '1px';
        btn.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
        btn.addEventListener('mouseenter', () => {
            btn.style.boxShadow = '0 0 48px 16px #39ff14cc, 0 4px 48px rgba(0,0,0,0.8)';
            btn.style.background = 'linear-gradient(135deg, #223322 60%, #3e6d3e 100%)';
            btn.style.color = '#eaffea';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.boxShadow = '0 0 32px 8px #39ff14cc, 0 4px 32px rgba(0,0,0,0.8)';
            btn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
            btn.style.color = '#b6ffb6';
        });
        btn.addEventListener('click', () => this.handleEnterTown());
        const playfield = document.querySelector('.playfield');
        if (playfield) {
            playfield.appendChild(btn);
        } else {
            document.body.appendChild(btn);
        }
    }

    handleEnterTown() {
        // Complete the Lurking Silence quest
        this.questManager.completeQuest('lurking_silence');
        
        // Remove the enter town button
        const btn = document.querySelector('.enter-town-btn');
        if (btn) btn.remove();

        // Show map transition from current location to town
        this.showMapScreen(
            { image: 'forest2.png' },
            { image: 'level9.png' },
            () => {
                this.previousLevel = 8;
                this.currentLevel = 9;
                this.startNextLevel();
            }
        );
    }

    createInteractableRectangle() {
        // Remove any existing interactable rectangles
        document.querySelectorAll('.interactable-rect').forEach(el => el.remove());
        // Door 1
        const rect1 = document.createElement('div');
        rect1.className = 'interactable-rect';
        rect1.style.position = 'absolute';
        rect1.style.left = '3%';
        rect1.style.top = '64%';
        rect1.style.width = '90px';
        rect1.style.height = '180px';
        rect1.style.background = 'rgba(80, 200, 255, 0.25)';
        rect1.style.border = '2px solid #39ff14';
        rect1.style.borderRadius = '12px';
        rect1.style.cursor = 'pointer';
        rect1.style.zIndex = '3000';
        rect1.title = 'Interact (door)';
        rect1.addEventListener('mouseenter', () => {
            rect1.style.background = 'rgba(80, 255, 180, 0.35)';
            rect1.style.borderColor = '#fff';
            rect1.style.cursor = 'url("/assets/Images/doorcursor.png") 24 24, pointer';
        });
        rect1.addEventListener('mouseleave', () => {
            rect1.style.background = 'rgba(80, 200, 255, 0.25)';
            rect1.style.borderColor = '#39ff14';
            rect1.style.cursor = 'pointer';
        });
        rect1.addEventListener('click', () => {
            // If this is the first click, play a random closed sound
            if (!this.box1Clicked) {
                const soundId = pickNonRepeatingClosedSound(this.lastClosedSound);
                if (this.soundManager && this.soundManager.playSound) {
                    this.soundManager.playSound(soundId);
                }
                this.lastClosedSound = soundId;
                this.box1Clicked = true;
            } else {
                // On subsequent clicks, only play closed3.mp3
                if (this.soundManager && this.soundManager.playSound) {
                    this.soundManager.playSound('closed3');
                }
            }
            console.log('Interactable rectangle 1 clicked!');
            // Future: open shop, quest, etc.
        });
        // Add a number label for door 1
        const label1 = document.createElement('div');
        label1.textContent = '1';
        label1.style.position = 'absolute';
        label1.style.top = '8px';
        label1.style.left = '50%';
        label1.style.transform = 'translateX(-50%)';
        label1.style.fontSize = '2.5em';
        label1.style.fontWeight = 'bold';
        label1.style.color = '#fff';
        label1.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
        label1.style.pointerEvents = 'none';
        rect1.appendChild(label1);
        // Door 2
        const rect2 = document.createElement('div');
        rect2.className = 'interactable-rect';
        rect2.style.position = 'absolute';
        rect2.style.left = '68.7%';
        rect2.style.top = '72%';
        rect2.style.width = '90px';
        rect2.style.height = '180px';
        rect2.style.background = 'rgba(80, 200, 255, 0.25)';
        rect2.style.border = '2px solid #39ff14';
        rect2.style.borderRadius = '12px';
        rect2.style.cursor = 'pointer';
        rect2.style.zIndex = '3000';
        rect2.title = 'Interact (door)';
        rect2.addEventListener('mouseenter', () => {
            rect2.style.background = 'rgba(80, 255, 180, 0.35)';
            rect2.style.borderColor = '#fff';
            rect2.style.cursor = 'url("/assets/Images/doorcursor.png") 24 24, pointer';
        });
        rect2.addEventListener('mouseleave', () => {
            rect2.style.background = 'rgba(80, 200, 255, 0.25)';
            rect2.style.borderColor = '#39ff14';
            rect2.style.cursor = 'pointer';
        });
        rect2.addEventListener('click', () => {
            // If this is the first click, play a random closed sound
            if (!this.box2Clicked) {
                const soundId = pickNonRepeatingClosedSound(this.lastClosedSound);
                if (this.soundManager && this.soundManager.playSound) {
                    this.soundManager.playSound(soundId);
                }
                this.lastClosedSound = soundId;
                this.box2Clicked = true;
            } else {
                // On subsequent clicks, only play closed3.mp3
                if (this.soundManager && this.soundManager.playSound) {
                    this.soundManager.playSound('closed3');
                }
            }
            console.log('Interactable rectangle 2 clicked!');
            // Future: open shop, quest, etc.
        });
        // Add a number label for door 2
        const label2 = document.createElement('div');
        label2.textContent = '2';
        label2.style.position = 'absolute';
        label2.style.top = '8px';
        label2.style.left = '50%';
        label2.style.transform = 'translateX(-50%)';
        label2.style.fontSize = '2.5em';
        label2.style.fontWeight = 'bold';
        label2.style.color = '#fff';
        label2.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
        label2.style.pointerEvents = 'none';
        rect2.appendChild(label2);
        // Door 3
        const rect3 = document.createElement('div');
        rect3.className = 'interactable-rect';
        rect3.style.position = 'absolute';
        rect3.style.left = '42.7%';
        rect3.style.top = '67%';
        rect3.style.width = '45px';
        rect3.style.height = '90px';
        rect3.style.background = 'rgba(80, 200, 255, 0.25)';
        rect3.style.border = '2px solid #39ff14';
        rect3.style.borderRadius = '12px';
        rect3.style.cursor = 'pointer';
        rect3.style.zIndex = '3000';
        rect3.title = 'Interact (door)';
        rect3.addEventListener('mouseenter', () => {
            rect3.style.background = 'rgba(80, 255, 180, 0.35)';
            rect3.style.borderColor = '#fff';
            rect3.style.cursor = 'url("/assets/Images/doorcursor.png") 24 24, pointer';
        });
        rect3.addEventListener('mouseleave', () => {
            rect3.style.background = 'rgba(80, 200, 255, 0.25)';
            rect3.style.borderColor = '#39ff14';
            rect3.style.cursor = 'pointer';
        });
        rect3.addEventListener('click', () => {
            // If this is the first click, play a random closed sound
            if (!this.box3Clicked) {
                const soundId = pickNonRepeatingClosedSound(this.lastClosedSound);
                if (this.soundManager && this.soundManager.playSound) {
                    this.soundManager.playSound(soundId);
                }
                this.lastClosedSound = soundId;
                this.box3Clicked = true;
            } else {
                // On subsequent clicks, only play closed3.mp3
                if (this.soundManager && this.soundManager.playSound) {
                    this.soundManager.playSound('closed3');
                }
            }
            console.log('Interactable rectangle 3 clicked!');
            // Future: open shop, quest, etc.
        });
        // Add a number label for door 3
        const label3 = document.createElement('div');
        label3.textContent = '3';
        label3.style.position = 'absolute';
        label3.style.top = '8px';
        label3.style.left = '50%';
        label3.style.transform = 'translateX(-50%)';
        label3.style.fontSize = '2.5em';
        label3.style.fontWeight = 'bold';
        label3.style.color = '#fff';
        label3.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
        label3.style.pointerEvents = 'none';
        rect3.appendChild(label3);
        // Door 4 (square)
        const rect4 = document.createElement('div');
        rect4.className = 'interactable-rect';
        rect4.style.position = 'absolute';
        rect4.style.left = '52.5%';
        rect4.style.top = '60%';
        rect4.style.width = '150px';
        rect4.style.height = '150px';
        rect4.style.background = 'rgba(80, 200, 255, 0.25)';
        rect4.style.border = '2px solid #39ff14';
        rect4.style.borderRadius = '12px';
        rect4.style.cursor = 'pointer';
        rect4.style.zIndex = '3000';
        rect4.title = 'Interact (door)';
        rect4.addEventListener('mouseenter', () => {
            rect4.style.background = 'rgba(80, 255, 180, 0.35)';
            rect4.style.borderColor = '#fff';
            // Use mageboots48.png as the cursor
            rect4.style.cursor = 'url("./assets/Images/mageboots48.png") 24 40, pointer';
        });
        rect4.addEventListener('mouseleave', () => {
            rect4.style.background = 'rgba(80, 200, 255, 0.25)';
            rect4.style.borderColor = '#39ff14';
            rect4.style.cursor = 'pointer';
        });
        rect4.addEventListener('click', () => {
            console.log('Interactable rectangle 4 clicked!');
            // Transition to the inn (level 10)
            this.currentLevel = 10;
            this.startNextLevel();
        });
        // Add a number label for door 4
        const label4 = document.createElement('div');
        label4.textContent = '4';
        label4.style.position = 'absolute';
        label4.style.top = '8px';
        label4.style.left = '50%';
        label4.style.transform = 'translateX(-50%)';
        label4.style.fontSize = '2.5em';
        label4.style.fontWeight = 'bold';
        label4.style.color = '#fff';
        label4.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
        label4.style.pointerEvents = 'none';
        rect4.appendChild(label4);
        // Add all rectangles to the playfield
        const playfield = document.querySelector('.playfield');
        if (playfield) {
            playfield.appendChild(rect1);
            playfield.appendChild(rect2);
            playfield.appendChild(rect3);
            playfield.appendChild(rect4);
        } else {
            document.body.appendChild(rect1);
            document.body.appendChild(rect2);
            document.body.appendChild(rect3);
            document.body.appendChild(rect4);
        }
        // Set initial visibility
        const visible = this.interactableRectsVisible;
        [rect1, rect2, rect3, rect4].forEach(rect => {
            rect.style.opacity = visible ? '1' : '0';
            rect.style.pointerEvents = 'auto'; // Always interactable
            rect.style.transition = 'opacity 0.3s';
        });
    }

    toggleInteractableRects() {
        this.interactableRectsVisible = !this.interactableRectsVisible;
        // Toggle visibility but keep rectangles in DOM and interactive
        document.querySelectorAll('.interactable-rect').forEach(rect => {
            rect.style.opacity = this.interactableRectsVisible ? '1' : '0';
            rect.style.pointerEvents = 'auto'; // Always interactable
        });
    }

    // Add this method to the Game class:
    runTypewriterEffect(target, text, onComplete) {
        let i = 0;
        const type = () => {
            if (i <= text.length) {
                target.textContent = text.slice(0, i);
                let delay = 55;
                const prevChar = text[i - 1];
                if (prevChar === '.' || prevChar === '!' || prevChar === '?') {
                    delay = 400;
                }
                i++;
                this._typewriterTimeout = setTimeout(type, delay);
            } else if (onComplete) {
                onComplete();
            }
        };
        type();
        // Track timeout for cleanup
        if (!this.typewriterTimeouts) this.typewriterTimeouts = [];
        this.typewriterTimeouts.push(() => clearTimeout(this._typewriterTimeout));
    }

    showLevel17Narration() {
        // Remove any existing narration box
        const existingBox = document.querySelector('.level17-narration');
        if (existingBox) existingBox.remove();
        const box = document.createElement('div');
        box.className = 'level17-narration';
        box.style.position = 'fixed';
        box.style.top = '60px';
        box.style.left = '62%'; // move right
        box.style.transform = 'translateX(-40%)'; // less leftward shift
        box.style.background = 'rgba(30,30,30,0.97)';
        box.style.border = '2.5px solid #39ff14';
        box.style.borderRadius = '14px';
        box.style.padding = '18px 18px 16px 18px';
        box.style.color = '#b6ffb6';
        box.style.fontFamily = 'Cinzel, Times New Roman, serif';
        box.style.fontSize = '1.08em';
        box.style.zIndex = '4000';
        box.style.boxShadow = '0 0 24px 4px #39ff1466, 0 4px 24px rgba(0,0,0,0.8)';
        box.style.maxWidth = '410px';
        box.style.textAlign = 'center';
        box.innerHTML = `
            <div style="margin-bottom: 12px; font-size: 1.1em; color: #39ff14;">Alchemist</div>
            <div class="typewriter-narration" style="margin-bottom: 12px; min-height: 80px;"></div>
            <div style="display: flex; justify-content: center; gap: 10px;">
            <button style="margin-top: 8px; padding: 8px 24px; font-size: 1em; background: linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%); color: #b6ffb6; border: 2px solid #39ff14; border-radius: 8px; cursor: pointer; font-family: Cinzel, Times New Roman, serif; display:none;">Continue</button>
                <button style="margin-top: 8px; padding: 8px 24px; font-size: 1em; background: linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%); color: #b6ffb6; border: 2px solid #39ff14; border-radius: 8px; cursor: pointer; font-family: Cinzel, Times New Roman, serif; display:none;">Ask about the Master Smith</button>
            </div>
        `;
        const continueBtn = box.querySelector('button:first-child');
        const askBtn = box.querySelector('button:last-child');
        continueBtn.onclick = () => {
            box.remove();
            this.showLevel17BuyButton();
        };
        askBtn.onclick = () => {
            const target = box.querySelector('.typewriter-narration');
            target.textContent = "Garrick? Hah, stubborn as ever. Said he was heading up through the mountain pass to restock his gear—won't say what kind, just mumbled something about 'new alloys' and vanished.\"\n\n\"If you ask me, bad timing. Goblins have been getting bolder up that way. He should've waited.";
            continueBtn.style.display = 'inline-block';
            askBtn.style.display = 'none';
        };
        document.body.appendChild(box);
        const text = `You've come to the right place, traveler. Out there, steel and spells might keep you alive—but in here? It's knowledge and a little alchemical assistance.`;
        const target = box.querySelector('.typewriter-narration');
        let finished = false;
        let timeoutId = null;
        const typewriter = (i = 0) => {
            if (finished) return;
            if (i <= text.length) {
                target.textContent = text.slice(0, i);
                let delay = 55;
                const prevChar = text[i - 1];
                if (prevChar === '.' || prevChar === '!' || prevChar === '?') {
                    delay = 400;
                }
                timeoutId = setTimeout(() => typewriter(i + 1), delay);
            } else {
                finished = true;
                continueBtn.style.display = 'inline-block';
                // Only show the ask button if the Garrick's Trail quest doesn't exist
                if (!this.questManager.quests.has('garricks_trail')) {
                    askBtn.style.display = 'inline-block';
                }
            }
        };
        typewriter();
        // Allow click to finish instantly
        box.onclick = () => {
            if (!finished) {
                finished = true;
                clearTimeout(timeoutId);
                target.textContent = text;
                continueBtn.style.display = 'inline-block';
                // Only show the ask button if the Garrick's Trail quest doesn't exist
                if (!this.questManager.quests.has('garricks_trail')) {
                    askBtn.style.display = 'inline-block';
                }
            }
        };
    }

    showLevel17BuyButton() {
        // Only show if on level 17
        if (this.currentLevel !== 17) return;

        // Remove any existing buy button
        const existingBtn = document.querySelector('.merchant-buy-btn');
        if (existingBtn) existingBtn.remove();

        const btn = document.createElement('button');
        btn.className = 'merchant-buy-btn';
        btn.textContent = 'Buy Potions';
        btn.style.position = 'fixed';
        btn.style.top = '60px';
        btn.style.left = '62%';
        btn.style.transform = 'translateX(-40%)';
        btn.style.padding = '18px 36px';
        btn.style.fontSize = '1.3em';
        btn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
        btn.style.color = '#b6ffb6';
        btn.style.border = '2px solid #39ff14';
        btn.style.borderRadius = '16px';
        btn.style.cursor = 'pointer';
        btn.style.zIndex = '4000';
        btn.style.boxShadow = '0 0 24px 4px #39ff1466, 0 4px 24px rgba(0,0,0,0.7)';
        btn.style.fontFamily = 'Cinzel, Times New Roman, serif';
        btn.style.letterSpacing = '1px';
        btn.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
        btn.addEventListener('mouseenter', () => {
            btn.style.boxShadow = '0 0 32px 8px #39ff14cc, 0 4px 32px rgba(0,0,0,0.8)';
            btn.style.background = 'linear-gradient(135deg, #2a3a2a 60%, #3e5d3e 100%)';
            btn.style.color = '#fff6ea';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.boxShadow = '0 0 24px 4px #39ff1466, 0 4px 24px rgba(0,0,0,0.7)';
            btn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
            btn.style.color = '#b6ffb6';
        });
        btn.onclick = () => {
            btn.remove();
            // Example items for sale
            const itemsForSale = [
                { name: 'Health Potion', icon: './assets/Images/healthpotion.png', price: 10, type: 'healthpotion' },
                { name: 'Mana Potion', icon: './assets/Images/manapotion.png', price: 12, type: 'manapotion' }
            ];
            // Example player inventory: show all potions in backpack
            const playerInventory = [];
            for (let i = 4; i < 16; i++) {
                const item = this.backpack.items[i];
                if (item && item.type) {
                    if (item.type === 'health') {
                        playerInventory.push({ name: 'Health Potion', icon: './assets/Images/healthpotion.png', price: 5, type: 'healthpotion', slot: i });
                    } else if (item.type === 'mana') {
                        playerInventory.push({ name: 'Mana Potion', icon: './assets/Images/manapotion.png', price: 6, type: 'manapotion', slot: i });
                    }
                }
            }
            this.store.open(itemsForSale, playerInventory);
            // Hide back button when store is open
            const backBtn = document.querySelector('.merchant-back-btn');
            if (backBtn) backBtn.style.display = 'none';
            
            // Patch: re-show the button after store closes
            const origClose = this.store.close.bind(this.store);
            this.store.close = () => {
                origClose();
                // Show back button when store is closed
                const backBtn = document.querySelector('.merchant-back-btn');
                if (backBtn) backBtn.style.display = 'block';
                
                setTimeout(() => this.showLevel17BuyButton(), 100);
            };
        };
        document.body.appendChild(btn);
    }

    showManaFullNotification() {
        this.showFullNotification('Mana is full');
    }

    showHealthFullNotification() {
        this.showFullNotification('Health is full');
    }

    showFullNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'full-notification';
        notification.textContent = message;
        
        // Style the notification
        notification.style.position = 'fixed';
        notification.style.bottom = '200px';
        notification.style.right = '210px';
        notification.style.background = 'rgba(30,30,30,0.95)';
        notification.style.color = '#b6ffb6';
        notification.style.padding = '8px 16px';
        notification.style.borderRadius = '8px';
        notification.style.border = '2px solid #39ff14';
        notification.style.fontFamily = 'Cinzel, Times New Roman, serif';
        notification.style.zIndex = '4000';
        notification.style.boxShadow = '0 0 12px 2px #39ff1466';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(10px)';
        notification.style.transition = 'opacity 0.3s, transform 0.3s';
        
        // Add to document
        document.body.appendChild(notification);

        // Show notification with animation
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        // Remove after 2 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(10px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 2000);
    }

    // Add this method to check if mana is full
    isManaFull() {
        return this.playerResource >= this.maxResource;
    }

    cleanupMusic() {
        this.soundManager.stopMusic(false);
    }
}

// =========================
// SECTION: Game Class
// =========================
// Start the game when the page loads
window.addEventListener('load', async () => {
    try {
        const preloader = new Preloader();
        const loadedAssets = await preloader.loadAllAssets();
        
        // Initialize game with loaded assets
        window.game = new Game();
        window.game.loadedAssets = loadedAssets;
    } catch (error) {
        console.error('Failed to load game assets:', error);
        alert('Failed to load game assets. Please refresh the page.');
    }
}); 

// Add HMR support at the end of the file
if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
        // Store current game state
        const gameState = {
            currentLevel: Game.instance.currentLevel,
            playerClass: Game.instance.playerClass,
            playerDeck: Game.instance.playerDeck,
            playerHealth: Game.instance.playerHealth,
            playerDefense: Game.instance.playerDefense,
            playerResource: Game.instance.playerResource,
            maxResource: Game.instance.maxResource,
            enemies: Game.instance.enemies.map(enemy => ({
                type: enemy.constructor.name,
                id: enemy.id,
                health: enemy.health,
                maxHealth: enemy.maxHealth
            }))
        };

        // Create new game instance
        const newGame = new newModule.Game();
        
        // Restore game state
        newGame.currentLevel = gameState.currentLevel;
        newGame.playerClass = gameState.playerClass;
        newGame.playerDeck = gameState.playerDeck;
        newGame.playerHealth = gameState.playerHealth;
        newGame.playerDefense = gameState.playerDefense;
        newGame.playerResource = gameState.playerResource;
        newGame.maxResource = gameState.maxResource;
        
        // Restore enemies
        if (gameState.enemies) {
            newGame.enemies = gameState.enemies.map(enemyData => {
                let enemy;
                switch (enemyData.type) {
                    case 'Executioner':
                        enemy = new newModule.Executioner(enemyData.id, enemyData.maxHealth, newGame);
                        break;
                    case 'FlyingDemon':
                        enemy = new newModule.FlyingDemon(enemyData.id, enemyData.maxHealth, newGame);
                        break;
                    case 'Skeleton':
                        enemy = new newModule.Skeleton(enemyData.id, enemyData.maxHealth, newGame);
                        break;
                    case 'Werewolf':
                        enemy = new newModule.Werewolf(enemyData.id, enemyData.maxHealth, newGame);
                        break;
                    default:
                        enemy = new newModule.Enemy(enemyData.id, enemyData.maxHealth, newGame);
                }
                enemy.health = enemyData.health;
                return enemy;
            });
        }

        // Reinitialize game with preserved state
        newGame.initialize(newGame.playerClass, newGame.playerDeck);
        
        // Force re-initialize the current level
        newGame.levelManager.initializeLevel(newGame.currentLevel);
        
        // Update UI elements
        newGame.updatePlayerHand(true);
        newGame.updatePileCounts();
        newGame.updateHealthBars();
        
        // Restore game instance
        Game.instance = newGame;
        window.game = newGame;
    });
}

// Helper to pick a closed sound that is not the last played
function pickNonRepeatingClosedSound(last) {
    const sounds = ['closed1', 'closed2', 'closed3'];
    const available = last ? sounds.filter(s => s !== last) : sounds;
    return available[Math.floor(Math.random() * available.length)];
}