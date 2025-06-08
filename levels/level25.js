import { Goblin } from '../goblin.js';
import { FlyingDemon } from '../FlyingDemon.js';
import { GoblinKing } from '../goblinKing.js';

let currentWave = 1;
let isSecondWaveSpawned = false;
let isThirdWaveSpawned = false;
let isGoblinKingSpawned = false;

function spawnSecondWave(game, enemySide) {
    isSecondWaveSpawned = true;
    // Clear existing enemies
    while (enemySide.firstChild) {
        enemySide.removeChild(enemySide.firstChild);
    }
    game.enemies = [];

    // Create 4 goblins
    setTimeout(() => {
        const goblin1 = new Goblin(1, 100, game);
        const goblinElement1 = goblin1.createEnemyElement();
        goblinElement1.classList.add('enemy-character');
        goblinElement1.style.position = 'absolute';
        goblinElement1.style.left = '25%';
        goblinElement1.style.bottom = '10%';
        enemySide.appendChild(goblinElement1);
        game.enemies.push(goblin1);
        
        requestAnimationFrame(() => {
            goblinElement1.classList.add('fade-in');
        });
    }, 1000);

    setTimeout(() => {
        const goblin2 = new Goblin(2, 100, game);
        const goblinElement2 = goblin2.createEnemyElement();
        goblinElement2.classList.add('enemy-character');
        goblinElement2.style.position = 'absolute';
        goblinElement2.style.left = '45%';
        goblinElement2.style.bottom = '10%';
        enemySide.appendChild(goblinElement2);
        game.enemies.push(goblin2);
        
        requestAnimationFrame(() => {
            goblinElement2.classList.add('fade-in');
        });
    }, 1500);

    setTimeout(() => {
        const goblin3 = new Goblin(3, 100, game);
        const goblinElement3 = goblin3.createEnemyElement();
        goblinElement3.classList.add('enemy-character');
        goblinElement3.style.position = 'absolute';
        goblinElement3.style.left = '65%';
        goblinElement3.style.bottom = '10%';
        enemySide.appendChild(goblinElement3);
        game.enemies.push(goblin3);
        
        requestAnimationFrame(() => {
            goblinElement3.classList.add('fade-in');
        });
    }, 2000);

    setTimeout(() => {
        const goblin4 = new Goblin(4, 100, game);
        const goblinElement4 = goblin4.createEnemyElement();
        goblinElement4.classList.add('enemy-character');
        goblinElement4.style.position = 'absolute';
        goblinElement4.style.left = '85%';
        goblinElement4.style.bottom = '10%';
        enemySide.appendChild(goblinElement4);
        game.enemies.push(goblin4);
        
        requestAnimationFrame(() => {
            goblinElement4.classList.add('fade-in');
        });
    }, 2500);
}

function spawnThirdWave(game, enemySide) {
    isThirdWaveSpawned = true;
    // Clear existing enemies
    while (enemySide.firstChild) {
        enemySide.removeChild(enemySide.firstChild);
    }
    game.enemies = [];

    // Create first goblin
    setTimeout(() => {
        const goblin1 = new Goblin(1, 100, game);
        const goblinElement1 = goblin1.createEnemyElement();
        goblinElement1.classList.add('enemy-character');
        goblinElement1.style.position = 'absolute';
        goblinElement1.style.left = '25%';
        goblinElement1.style.bottom = '10%';
        enemySide.appendChild(goblinElement1);
        game.enemies.push(goblin1);
        
        requestAnimationFrame(() => {
            goblinElement1.classList.add('fade-in');
        });
    }, 1000);

    // Create second goblin
    setTimeout(() => {
        const goblin2 = new Goblin(2, 100, game);
        const goblinElement2 = goblin2.createEnemyElement();
        goblinElement2.classList.add('enemy-character');
        goblinElement2.style.position = 'absolute';
        goblinElement2.style.left = '45%';
        goblinElement2.style.bottom = '10%';
        enemySide.appendChild(goblinElement2);
        game.enemies.push(goblin2);
        
        requestAnimationFrame(() => {
            goblinElement2.classList.add('fade-in');
        });
    }, 1500);

    // Create first flying demon
    setTimeout(() => {
        const flyingDemon1 = new FlyingDemon(3, 120, game);
        const flyingDemonElement1 = flyingDemon1.createEnemyElement();
        flyingDemonElement1.classList.add('enemy-character');
        flyingDemonElement1.style.position = 'absolute';
        flyingDemonElement1.style.left = '60%';
        flyingDemonElement1.style.bottom = '40%';
        enemySide.appendChild(flyingDemonElement1);
        game.enemies.push(flyingDemon1);
        
        requestAnimationFrame(() => {
            flyingDemonElement1.classList.add('fade-in');
        });
    }, 2000);

    // Create second flying demon
    setTimeout(() => {
        const flyingDemon2 = new FlyingDemon(4, 120, game);
        const flyingDemonElement2 = flyingDemon2.createEnemyElement();
        flyingDemonElement2.classList.add('enemy-character');
        flyingDemonElement2.style.position = 'absolute';
        flyingDemonElement2.style.left = '80%';
        flyingDemonElement2.style.bottom = '40%';
        enemySide.appendChild(flyingDemonElement2);
        game.enemies.push(flyingDemon2);
        
        requestAnimationFrame(() => {
            flyingDemonElement2.classList.add('fade-in');
        });
    }, 3000);
}

export function runLevel25(game) {
    // Reset wave counter and flags
    currentWave = 1;
    isSecondWaveSpawned = false;
    isThirdWaveSpawned = false;
    isGoblinKingSpawned = false;

    // Stop any existing music and play town day music
    game.soundManager.stopMusic(false);
    const townDayMusic = game.soundManager.sounds.get('townday');
    if (townDayMusic) {
        townDayMusic.loop = true;
        townDayMusic.volume = 0.5;
        townDayMusic.play().catch(() => {});
        game.soundManager.currentMusic = townDayMusic;
    }

    // Create player-side element if it doesn't exist
    let playerSide = document.querySelector('.player-side');
    if (!playerSide) {
        playerSide = document.createElement('div');
        playerSide.className = 'player-side';
        playerSide.style.position = 'absolute';
        playerSide.style.right = '0';
        playerSide.style.top = '0';
        playerSide.style.width = '50%';
        playerSide.style.height = '100%';
        playerSide.style.pointerEvents = 'none';
        playerSide.style.zIndex = '1000';
        const gameScene = document.querySelector('.game-scene');
        if (gameScene) {
            gameScene.appendChild(playerSide);
        } else {
            console.error('Game scene not found!');
            return;
        }
    }

    // Create player character with entrance animation
    if (game.playerCharacter) {
        playerSide.innerHTML = ''; // Clear existing content
        const playerElement = game.playerCharacter.createPlayerElement();
        playerElement.setAttribute('data-class', game.playerClass);
        
        // Add shield aura
        const shieldAura = document.createElement('div');
        shieldAura.className = 'shield-aura';
        playerElement.appendChild(shieldAura);

        // Create stats container
        const statsContainer = document.createElement('div');
        statsContainer.className = 'character-stats';
        statsContainer.style.position = 'absolute';
        statsContainer.style.left = '0';
        statsContainer.style.bottom = '0';
        statsContainer.innerHTML = `
            <div class="health-bar">
                <div class="health-bar-fill" style="width: 100%"></div>
            </div>
            <div class="defense-bar">
                <div class="defense-bar-fill" style="width: 0%"></div>
                <div class="defense-text">Defense: 0</div>
            </div>
            <div class="resource-bar">
                <div class="resource-bar-fill" style="width: ${(game.playerResource / game.maxResource) * 100}%"></div>
            </div>
            <div class="resource-label">${game.playerClass === 'mage' ? 'Mana' : 'Rage'}: ${game.playerResource}</div>
        `;
        playerSide.appendChild(playerElement);
        playerSide.appendChild(statsContainer);

        // Run-in animation
        playerElement.style.transition = 'none';
        playerElement.style.transform = 'translateX(-600px)';
        playerElement.style.opacity = '0';
        setTimeout(() => {
            playerElement.style.transition = 'transform 2s ease-out, opacity 0.1s ease-out';
            playerElement.style.opacity = '1';
            game.playerCharacter.playRunAnimation();
            // Play running sound
            const runningSound = game.soundManager.sounds.get('running');
            if (runningSound) {
                runningSound.currentTime = 1;
                runningSound.play().catch(() => {});
            }
            requestAnimationFrame(() => {
                playerElement.style.transform = 'translateX(0)';
            });
            setTimeout(() => {
                game.playerCharacter.stopRunAnimation();
                if (runningSound) {
                    runningSound.pause();
                    runningSound.currentTime = 0;
                }
            }, 2000);
        }, 400);
    }

    // Create enemy-side element if it doesn't exist
    let enemySide = document.querySelector('.enemy-side');
    if (!enemySide) {
        enemySide = document.createElement('div');
        enemySide.className = 'enemy-side';
        enemySide.style.position = 'absolute';
        enemySide.style.left = '0';
        enemySide.style.top = '0';
        enemySide.style.width = '100%';
        enemySide.style.height = '100%';
        enemySide.style.pointerEvents = 'none';
        enemySide.style.zIndex = '1000';
        const gameScene = document.querySelector('.game-scene');
        if (gameScene) {
            gameScene.appendChild(enemySide);
        } else {
            console.error('Game scene not found!');
            return;
        }
    } else {
        // Clear existing enemies
        while (enemySide.firstChild) {
            enemySide.removeChild(enemySide.firstChild);
        }
    }

    // Set up the level background and music
    game.levelManager.setBackground(25);
    game.levelManager.setMusicAndNarration(25);

    // Add Garrick tied up as part of the background
    const garrickElement = document.createElement('div');
    garrickElement.style.position = 'absolute';
    garrickElement.style.left = '96%';
    garrickElement.style.bottom = '10%';
    garrickElement.style.transform = 'translateX(-50%)';
    garrickElement.style.width = '150px';
    garrickElement.style.height = '225px';
    garrickElement.style.backgroundImage = 'url("./assets/Images/garricktied.png")';
    garrickElement.style.backgroundSize = 'contain';
    garrickElement.style.backgroundRepeat = 'no-repeat';
    garrickElement.style.backgroundPosition = 'center';
    garrickElement.style.zIndex = '1'; // Set to 1 to be above background but below other elements
    const playfield = document.querySelector('.playfield');
    if (playfield) {
        playfield.appendChild(garrickElement);
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

    // Create first goblin
    setTimeout(() => {
        const goblin1 = new Goblin(1, 100, game);
        const goblinElement1 = goblin1.createEnemyElement();
        goblinElement1.classList.add('enemy-character');
        goblinElement1.style.position = 'absolute';
        goblinElement1.style.left = '25%';
        goblinElement1.style.bottom = '10%';
        enemySide.appendChild(goblinElement1);
        game.enemies.push(goblin1);
        
        requestAnimationFrame(() => {
            goblinElement1.classList.add('fade-in');
        });
    }, 1000);

    // Create second goblin
    setTimeout(() => {
        const goblin2 = new Goblin(2, 100, game);
        const goblinElement2 = goblin2.createEnemyElement();
        goblinElement2.classList.add('enemy-character');
        goblinElement2.style.position = 'absolute';
        goblinElement2.style.left = '45%';
        goblinElement2.style.bottom = '10%';
        enemySide.appendChild(goblinElement2);
        game.enemies.push(goblin2);
        
        requestAnimationFrame(() => {
            goblinElement2.classList.add('fade-in');
        });
    }, 1500);

    // Create third goblin
    setTimeout(() => {
        const goblin3 = new Goblin(3, 100, game);
        const goblinElement3 = goblin3.createEnemyElement();
        goblinElement3.classList.add('enemy-character');
        goblinElement3.style.position = 'absolute';
        goblinElement3.style.left = '65%';
        goblinElement3.style.bottom = '10%';
        enemySide.appendChild(goblinElement3);
        game.enemies.push(goblin3);
        
        requestAnimationFrame(() => {
            goblinElement3.classList.add('fade-in');
        });
    }, 2000);

    // Create flying demon
    setTimeout(() => {
        const flyingDemon = new FlyingDemon(4, 100, game);
        const flyingDemonElement = flyingDemon.createEnemyElement();
        flyingDemonElement.classList.add('enemy-character');
        flyingDemonElement.style.position = 'absolute';
        flyingDemonElement.style.left = '85%';
        flyingDemonElement.style.bottom = '40%';
        enemySide.appendChild(flyingDemonElement);
        game.enemies.push(flyingDemon);
        
        requestAnimationFrame(() => {
            flyingDemonElement.classList.add('fade-in');
        });
    }, 2500);

    // Override the game's checkLevelCompletion method for level 25
    const originalCheckLevelCompletion = game.checkLevelCompletion;
    game.checkLevelCompletion = function() {
        if (this.enemies.length === 0 && !this.isLevelTransitioning) {
            if (currentWave === 1 && !isSecondWaveSpawned) {
                // First wave is defeated, spawn second wave
                currentWave = 2;
                spawnSecondWave(this, enemySide);
            } else if (currentWave === 2 && !isThirdWaveSpawned) {
                // Second wave is defeated, spawn third wave
                currentWave = 3;
                spawnThirdWave(this, enemySide);
            } else if (currentWave === 3 && !isGoblinKingSpawned) {
                // Third wave is defeated, spawn Goblin King
                isGoblinKingSpawned = true;
                // Clear existing enemies
                while (enemySide.firstChild) {
                    enemySide.removeChild(enemySide.firstChild);
                }
                this.enemies = [];

                // Create Goblin King with dramatic entrance
                setTimeout(() => {
                    const goblinKing = new GoblinKing(1, 200, this);
                    const goblinKingElement = goblinKing.createEnemyElement();
                    goblinKingElement.classList.add('enemy-character');
                    goblinKingElement.style.position = 'absolute';
                    goblinKingElement.style.left = '50%';
                    goblinKingElement.style.bottom = '-5%';
                    goblinKingElement.style.transform = 'translateX(-50%)';
                    enemySide.appendChild(goblinKingElement);
                    this.enemies.push(goblinKing);
                    
                    requestAnimationFrame(() => {
                        goblinKingElement.classList.add('fade-in');
                    });
                }, 1000);
            } else if (isGoblinKingSpawned && this.enemies.length === 0) {
                // Goblin King is defeated, restore original checkLevelCompletion
                this.checkLevelCompletion = originalCheckLevelCompletion;
                // Don't complete level yet as there's more story to come
                this.defeatedEnemies = [];

                // Wait 2 seconds before changing Garrick's image and playing sound
                setTimeout(() => {
                    // Find and update Garrick's image
                    const garrickElement = document.querySelector('.playfield').querySelector('div[style*="garricktied.png"]');
                    if (garrickElement) {
                        garrickElement.style.backgroundImage = 'url("./assets/Images/garricknorm.png")';
                        // Play rescue sound
                        if (this.soundManager) {
                            this.soundManager.playSound('garrickrescue');
                            
                            // Add Return to Town button after sound plays
                            setTimeout(() => {
                                const returnBtn = document.createElement('button');
                                returnBtn.textContent = 'Return to Town';
                                returnBtn.style.position = 'absolute';
                                returnBtn.style.top = '50%';
                                returnBtn.style.left = '50%';
                                returnBtn.style.transform = 'translate(-50%, -50%)';
                                returnBtn.style.padding = '18px 36px';
                                returnBtn.style.fontSize = '1.3em';
                                returnBtn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
                                returnBtn.style.color = '#b6ffb6';
                                returnBtn.style.border = '2px solid #39ff14';
                                returnBtn.style.borderRadius = '16px';
                                returnBtn.style.cursor = 'pointer';
                                returnBtn.style.zIndex = '4000';
                                returnBtn.style.boxShadow = '0 0 24px 4px #39ff1466, 0 4px 24px rgba(0,0,0,0.7)';
                                returnBtn.style.fontFamily = 'Cinzel, Times New Roman, serif';
                                returnBtn.style.letterSpacing = '1px';
                                returnBtn.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
                                
                                // Add click handler to return to town
                                const game = this; // Store reference to game
                                returnBtn.onclick = () => {
                                    // Clear any existing enemies
                                    game.enemies = [];
                                    // Stop any existing music
                                    if (game.soundManager) {
                                        game.soundManager.stopMusic(true);
                                    }
                                    // Set the new level
                                    game.currentLevel = 26;
                                    game.levelManager.initializeLevel(26);
                                };
                                
                                // Add to playfield instead of body
                                const playfield = document.querySelector('.playfield');
                                if (playfield) {
                                    playfield.appendChild(returnBtn);
                                }
                            }, 1000); // Wait 1 second after sound starts playing
                        }
                    }
                }, 2000);
            }
        }
    };
} 