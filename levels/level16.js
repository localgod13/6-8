// Level 16: Town Day scene (player character, no enemies)
export function runLevel16(game) {
    // Get or create player element using the game's playerCharacter instance
    let playerElement = document.querySelector('.player-character');
    if (!playerElement && game.playerCharacter) {
        playerElement = game.playerCharacter.createPlayerElement();
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
        
        // Add elements to player side
        const playerSide = document.querySelector('.player-side');
        if (playerSide) {
            playerSide.appendChild(playerElement);
            playerSide.appendChild(statsContainer);
        } else {
            const newPlayerSide = document.createElement('div');
            newPlayerSide.className = 'player-side';
            newPlayerSide.appendChild(playerElement);
            newPlayerSide.appendChild(statsContainer);
            document.body.appendChild(newPlayerSide);
        }
    }

    // Reset player position and state
    if (playerElement) {
        // Force reset player position and state
        playerElement.style.transition = 'none';
        playerElement.style.transform = 'translateX(-600px)';
        playerElement.style.opacity = '0';
        playerElement.style.visibility = 'hidden';
        
        // Small delay to ensure reset is applied
        setTimeout(() => {
            // Start the run animation
            if (game.playerCharacter) {
                game.playerCharacter.playRunAnimation();
            }
            
            // Play running sound
            const runningSound = game.soundManager.sounds.get('running');
            if (runningSound) {
                runningSound.currentTime = 1;
                runningSound.play().catch(() => {});
            }
            
            requestAnimationFrame(() => {
                playerElement.style.visibility = 'visible';
                playerElement.style.transition = 'transform 2s ease-out, opacity 0.1s ease-out';
                playerElement.style.opacity = '1';
                playerElement.style.transform = 'translateX(0)';
            });
            
            // Stop animation after movement completes
            setTimeout(() => {
                if (game.playerCharacter) {
                    game.playerCharacter.stopRunAnimation();
                }
                if (runningSound) {
                    runningSound.pause();
                    runningSound.currentTime = 0;
                }
            }, 2000);
        }, 50);
    }

    // Remove enemy side
    const enemySide = document.querySelector('.enemy-side');
    if (enemySide) enemySide.innerHTML = '';
    // Remove any existing inn/town door boxes and interactable rectangles
    document.querySelectorAll('.inn-door-box').forEach(el => el.remove());
    document.querySelectorAll('.interactable-rect').forEach(el => el.remove());
    document.querySelectorAll('.innkeeper-dialogue-box').forEach(el => el.remove());
    // Add three door boxes labeled 1, 2, 3
    const playfield = document.querySelector('.playfield');
    if (playfield) {
        const doorPositions = ["5%", "45%", "68%"];
        for (let i = 0; i < 3; i++) {
            const doorBox = document.createElement('div');
            doorBox.className = 'inn-door-box interactable-rect';
            doorBox.style.position = 'absolute';
            doorBox.style.left = doorPositions[i];
            doorBox.style.top = i === 2 ? '70%' : '65%';
            if (i === 0) {
                doorBox.style.width = '90px';
                doorBox.style.height = '180px';
                doorBox.style.opacity = '0';
                doorBox.style.pointerEvents = 'auto';
                doorBox.addEventListener('click', () => {
                    game.previousLevel = 16;
                    game.currentLevel = 17;
                    game.startNextLevel();
                });
            } else if (i === 1) {
                doorBox.style.width = '60px';
                doorBox.style.height = '120px';
                doorBox.style.opacity = '0';
                doorBox.style.pointerEvents = 'auto';
                doorBox.addEventListener('click', () => {
                    game.previousLevel = 16;
                    game.currentLevel = 18;
                    game.startNextLevel();
                });
            } else if (i === 2) {
                doorBox.style.width = '70px';
                doorBox.style.height = '140px';
                doorBox.style.opacity = '0';
                doorBox.style.pointerEvents = 'auto';
            }
            doorBox.style.background = 'rgba(80, 200, 255, 0.25)';
            doorBox.style.border = '2px solid #39ff14';
            doorBox.style.borderRadius = '12px';
            doorBox.style.cursor = 'pointer';
            doorBox.style.zIndex = '3000';
            doorBox.title = `Door ${i+1}`;
            doorBox.style.display = 'flex';
            doorBox.style.alignItems = 'center';
            doorBox.style.justifyContent = 'center';
            doorBox.style.fontSize = '2em';
            doorBox.style.color = '#fff';
            doorBox.style.fontWeight = 'bold';
            doorBox.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
            doorBox.textContent = `${i+1}`;
            doorBox.addEventListener('mouseenter', () => {
                doorBox.style.background = 'rgba(80, 255, 180, 0.35)';
                doorBox.style.borderColor = '#fff';
                doorBox.style.cursor = 'url("/assets/Images/doorcursor.png") 24 24, pointer';
            });
            doorBox.addEventListener('mouseleave', () => {
                doorBox.style.background = 'rgba(80, 200, 255, 0.25)';
                doorBox.style.borderColor = '#39ff14';
                doorBox.style.cursor = 'pointer';
            });
            playfield.appendChild(doorBox);
        }

        // Add Back to Inn box
        const backToInnBox = document.createElement('div');
        backToInnBox.className = 'inn-door-box interactable-rect';
        backToInnBox.style.position = 'absolute';
        backToInnBox.style.left = '52%';
        backToInnBox.style.top = '65%';
        backToInnBox.style.width = '150px';
        backToInnBox.style.height = '140px';
        backToInnBox.style.background = 'rgba(80, 200, 255, 0.25)';
        backToInnBox.style.border = '2px solid #39ff14';
        backToInnBox.style.borderRadius = '12px';
        backToInnBox.style.cursor = 'pointer';
        backToInnBox.style.zIndex = '3000';
        backToInnBox.title = 'Back to Inn';
        backToInnBox.style.display = 'flex';
        backToInnBox.style.alignItems = 'center';
        backToInnBox.style.justifyContent = 'center';
        backToInnBox.style.fontSize = '1.5em';
        backToInnBox.style.color = '#fff';
        backToInnBox.style.fontWeight = 'bold';
        backToInnBox.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
        backToInnBox.textContent = 'Back to Inn';
        backToInnBox.style.opacity = '0';
        backToInnBox.style.pointerEvents = 'auto';
        backToInnBox.addEventListener('mouseenter', () => {
            backToInnBox.style.background = 'rgba(80, 255, 180, 0.35)';
            backToInnBox.style.borderColor = '#fff';
            backToInnBox.style.cursor = 'url("./assets/Images/mageboots48.png") 24 40, pointer';
        });
        backToInnBox.addEventListener('mouseleave', () => {
            backToInnBox.style.background = 'rgba(80, 200, 255, 0.25)';
            backToInnBox.style.borderColor = '#39ff14';
            backToInnBox.style.cursor = 'pointer';
        });
        backToInnBox.addEventListener('click', () => {
            game.previousLevel = 16;
            game.currentLevel = 15;
            game.startNextLevel();
        });
        playfield.appendChild(backToInnBox);
    }
    // No enemies, just player character in town
    // (Background is set in main game logic)
    console.log('[Level 16] Town day scene loaded, currentLevel:', game.currentLevel);
} 