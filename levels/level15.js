// Level 15: Innday scene (town, player character, no enemies)
export function runLevel15(game) {
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
    // Remove any lingering 'Leave the Inn' button
    const leaveBtn = document.querySelector('button');
    if (leaveBtn && leaveBtn.textContent === 'Leave the Inn') leaveBtn.remove();
    // Add inn door box (visual/interactable, no transition)
    const playfield = document.querySelector('.playfield');
    if (playfield) {
        const innDoor = document.createElement('div');
        innDoor.className = 'inn-door-box interactable-rect';
        innDoor.style.position = 'absolute';
        innDoor.style.left = '35%';
        innDoor.style.top = '65%';
        innDoor.style.width = '60px';
        innDoor.style.height = '150px';
        innDoor.style.background = 'rgba(80, 200, 255, 0.25)';
        innDoor.style.border = '2px solid #39ff14';
        innDoor.style.borderRadius = '12px';
        innDoor.style.cursor = 'pointer';
        innDoor.style.zIndex = '3000';
        innDoor.title = 'Inn Door';
        innDoor.style.display = 'flex';
        innDoor.style.alignItems = 'center';
        innDoor.style.justifyContent = 'center';
        innDoor.style.fontSize = '2em';
        innDoor.style.color = '#fff';
        innDoor.style.fontWeight = 'bold';
        innDoor.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
        innDoor.textContent = 'Inn';
        innDoor.style.opacity = '0'; // Hidden by default
        innDoor.style.pointerEvents = 'auto';
        innDoor.addEventListener('mouseenter', () => {
            innDoor.style.background = 'rgba(80, 255, 180, 0.35)';
            innDoor.style.borderColor = '#fff';
            innDoor.style.cursor = 'url("/assets/Images/doorcursor.png") 24 24, pointer';
        });
        innDoor.addEventListener('mouseleave', () => {
            innDoor.style.background = 'rgba(80, 200, 255, 0.25)';
            innDoor.style.borderColor = '#39ff14';
            innDoor.style.cursor = 'pointer';
        });
        innDoor.addEventListener('click', () => {
            game.previousLevel = 15;
            game.currentLevel = 14;
            game.startNextLevel();
        });
        playfield.appendChild(innDoor);
        // Add 'Back to Town' box with transition to level 16
        const backBox = document.createElement('div');
        backBox.className = 'inn-door-box interactable-rect';
        backBox.style.position = 'absolute';
        backBox.style.left = '75%';
        backBox.style.top = '65%';
        backBox.style.width = '300px';
        backBox.style.height = '150px';
        backBox.style.background = 'rgba(80, 200, 255, 0.25)';
        backBox.style.border = '2px solid #39ff14';
        backBox.style.borderRadius = '12px';
        backBox.style.cursor = 'pointer';
        backBox.style.zIndex = '3000';
        backBox.title = 'Back to Town';
        backBox.style.display = 'flex';
        backBox.style.alignItems = 'center';
        backBox.style.justifyContent = 'center';
        backBox.style.fontSize = '2em';
        backBox.style.color = '#fff';
        backBox.style.fontWeight = 'bold';
        backBox.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
        backBox.textContent = 'Back to Town';
        backBox.style.opacity = '0'; // Hidden by default
        backBox.style.pointerEvents = 'auto';
        backBox.addEventListener('mouseenter', () => {
            backBox.style.background = 'rgba(80, 255, 180, 0.35)';
            backBox.style.borderColor = '#fff';
            backBox.style.cursor = 'url("/assets/Images/mageboots48.png") 24 40, pointer';
        });
        backBox.addEventListener('mouseleave', () => {
            backBox.style.background = 'rgba(80, 200, 255, 0.25)';
            backBox.style.borderColor = '#39ff14';
            backBox.style.cursor = 'pointer';
        });
        backBox.addEventListener('click', () => {
            game.previousLevel = 15;
            game.currentLevel = 16;
            game.startNextLevel();
        });
        playfield.appendChild(backBox);
        
        // Add 'Leave Town' box
        const leaveTownBox = document.createElement('div');
        leaveTownBox.className = 'inn-door-box interactable-rect';
        leaveTownBox.style.position = 'absolute';
        leaveTownBox.style.left = '50%';
        leaveTownBox.style.top = '65%';
        leaveTownBox.style.width = '275px';
        leaveTownBox.style.height = '150px';
        leaveTownBox.style.background = 'rgba(80, 200, 255, 0.25)';
        leaveTownBox.style.border = '2px solid #39ff14';
        leaveTownBox.style.borderRadius = '12px';
        leaveTownBox.style.cursor = 'pointer';
        leaveTownBox.style.zIndex = '3000';
        leaveTownBox.title = 'Leave Town';
        leaveTownBox.style.display = 'flex';
        leaveTownBox.style.alignItems = 'center';
        leaveTownBox.style.justifyContent = 'center';
        leaveTownBox.style.fontSize = '2em';
        leaveTownBox.style.color = '#fff';
        leaveTownBox.style.fontWeight = 'bold';
        leaveTownBox.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
        leaveTownBox.textContent = 'Leave Town';
        leaveTownBox.style.opacity = '0'; // Hidden by default
        leaveTownBox.style.pointerEvents = 'auto';
        leaveTownBox.addEventListener('mouseenter', () => {
            leaveTownBox.style.background = 'rgba(80, 255, 180, 0.35)';
            leaveTownBox.style.borderColor = '#fff';
            leaveTownBox.style.cursor = 'url("./assets/Images/mageboots48.png") 24 40, pointer';
        });
        leaveTownBox.addEventListener('mouseleave', () => {
            leaveTownBox.style.background = 'rgba(80, 200, 255, 0.25)';
            leaveTownBox.style.borderColor = '#39ff14';
            leaveTownBox.style.cursor = 'pointer';
        });
        leaveTownBox.addEventListener('click', () => {
            console.log('[Level 15] Leave Town clicked');
            
            // Log all quests in the Map with their exact structure
            console.log('[Level 15] All quests in Map:');
            game.questManager.quests.forEach((quest, name) => {
                console.log('Quest key:', name);
                console.log('Quest object:', quest);
            });
            
            // Check if player has Garrick's Trail quest (either active or completed)
            const hasGarricksTrailQuest = Array.from(game.questManager.quests.entries()).some(([key, quest]) => {
                console.log('Checking quest:', key, quest);
                // Check if the quest exists and is either active or completed
                return key === 'garricks_trail' && 
                       (quest.isCompleted === false || quest.isCompleted === true);
            });
            
            console.log('[Level 15] Has Garrick\'s Trail quest:', hasGarricksTrailQuest);

            if (!hasGarricksTrailQuest) {
                console.log('[Level 15] Quest requirement not met, showing popup');
                // Create and show popup message
                const popup = document.createElement('div');
                popup.style.position = 'fixed';
                popup.style.top = '50%';
                popup.style.left = '50%';
                popup.style.transform = 'translate(-50%, -50%)';
                popup.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                popup.style.color = '#fff';
                popup.style.padding = '20px';
                popup.style.borderRadius = '10px';
                popup.style.border = '2px solid #39ff14';
                popup.style.zIndex = '10000';
                popup.style.fontFamily = 'Cinzel, Times New Roman, serif';
                popup.style.fontSize = '1.5em';
                popup.style.textAlign = 'center';
                popup.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.5)';
                popup.textContent = "You still have business in town";
                
                // Add close button
                const closeBtn = document.createElement('button');
                closeBtn.textContent = 'Close';
                closeBtn.style.marginTop = '15px';
                closeBtn.style.padding = '8px 16px';
                closeBtn.style.backgroundColor = '#39ff14';
                closeBtn.style.color = 'black';
                closeBtn.style.border = 'none';
                closeBtn.style.borderRadius = '5px';
                closeBtn.style.cursor = 'pointer';
                closeBtn.style.fontFamily = 'Cinzel, Times New Roman, serif';
                closeBtn.style.fontSize = '0.8em';
                
                closeBtn.onclick = () => {
                    popup.remove();
                };
                
                popup.appendChild(document.createElement('br'));
                popup.appendChild(closeBtn);
                document.body.appendChild(popup);
                
                // Play error sound if available
                const errorSound = game.soundManager.sounds.get('error');
                if (errorSound) {
                    errorSound.play().catch(() => {});
                }
            } else {
                console.log('[Level 15] Quest requirement met, proceeding to level 19');
                // If quest requirement is met, proceed to level 19
                game.previousLevel = 15;
                game.currentLevel = 19;
                game.startNextLevel();
            }
        });
        playfield.appendChild(leaveTownBox);
    }
    // No 'Leave the Inn' button for level 15
    console.log('[Level 15] Background set to innday.png, currentLevel:', game.currentLevel);
} 