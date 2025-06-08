// Level 10: Inn, no enemies
export function runLevel10(game) {
    // Remove any existing inn/town door boxes
    document.querySelectorAll('.inn-door-box').forEach(el => el.remove());
    // Remove any previous interactable rectangles (from level 9 or elsewhere)
    document.querySelectorAll('.interactable-rect').forEach(el => el.remove());
    // Create player element first but keep it hidden
    const playerSide = document.querySelector('.player-side');
    if (playerSide) {
        playerSide.innerHTML = '';
        // Create player element with the already initialized playerCharacter
        const playerElement = game.playerCharacter.createPlayerElement();
        playerElement.setAttribute('data-class', game.playerClass);
        playerElement.style.opacity = '0';  // Start hidden
        playerElement.style.transform = 'translateX(-600px)';  // Start off-screen
        playerElement.style.visibility = 'hidden';  // Ensure it's completely hidden
        playerElement.style.transition = 'none';  // No transition initially
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
        playerSide.appendChild(playerElement);
        playerSide.appendChild(statsContainer);
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
        // Add to game scene instead of document body
        const gameScene = document.querySelector('.game-scene');
        if (gameScene) {
            gameScene.appendChild(enemySide);
            console.log('Added enemy-side to game scene');
        } else {
            console.error('Game scene not found!');
            return;
        }
    }
    // Player run-in animation
    setTimeout(() => {
        const playerElement = document.querySelector('.player-character');
        if (playerElement) {
            playerElement.style.visibility = 'hidden';
            playerElement.style.opacity = '0';
            playerElement.style.transform = 'translateX(-600px)';
            playerElement.style.transition = 'none';
            game.playerCharacter.playRunAnimation();
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
            setTimeout(() => {
                game.playerCharacter.stopRunAnimation();
                if (runningSound) {
                    runningSound.pause();
                    runningSound.currentTime = 0;
                }
            }, 2000);
        }
    }, 400);
    // Create Inn door box
    const innBox = document.createElement('div');
    innBox.className = 'inn-door-box interactable-rect';
    innBox.style.position = 'absolute';
    innBox.style.left = '28.5%';
    innBox.style.top = '70%';
    innBox.style.width = '60px';
    innBox.style.height = '150px';
    innBox.style.background = 'rgba(80, 200, 255, 0.25)';
    innBox.style.border = '2px solid #39ff14';
    innBox.style.borderRadius = '12px';
    innBox.style.cursor = 'pointer';
    innBox.style.zIndex = '3000';
    innBox.title = 'Inn';
    innBox.style.display = 'flex';
    innBox.style.alignItems = 'center';
    innBox.style.justifyContent = 'center';
    innBox.style.fontSize = '2em';
    innBox.style.color = '#fff';
    innBox.style.fontWeight = 'bold';
    innBox.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
    innBox.textContent = 'Inn';
    innBox.addEventListener('mouseenter', () => {
        innBox.style.background = 'rgba(80, 255, 180, 0.35)';
        innBox.style.borderColor = '#fff';
        innBox.style.cursor = 'url("/assets/Images/doorcursor.png") 24 24, pointer';
    });
    innBox.addEventListener('mouseleave', () => {
        innBox.style.background = 'rgba(80, 200, 255, 0.25)';
        innBox.style.borderColor = '#39ff14';
        innBox.style.cursor = 'pointer';
    });
    innBox.addEventListener('click', () => {
        game.previousLevel = 10;
        game.currentLevel = 11;
        game.startNextLevel();
    });
    // Create Back to Town door box
    const backBox = document.createElement('div');
    backBox.className = 'inn-door-box interactable-rect';
    backBox.style.position = 'absolute';
    backBox.style.left = '60%';
    backBox.style.top = '60%';
    backBox.style.width = '300px';
    backBox.style.height = '180px';
    backBox.style.background = 'rgba(80, 200, 255, 0.25)';
    backBox.style.border = '2px solid #39ff14';
    backBox.style.borderRadius = '12px';
    backBox.style.cursor = 'url("./assets/Images/mageboots48.png") 24 40, pointer';
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
    backBox.addEventListener('mouseenter', () => {
        backBox.style.background = 'rgba(80, 255, 180, 0.35)';
        backBox.style.borderColor = '#fff';
        backBox.style.cursor = 'url("./assets/Images/mageboots48.png") 24 40, pointer';
    });
    backBox.addEventListener('mouseleave', () => {
        backBox.style.background = 'rgba(80, 200, 255, 0.25)';
        backBox.style.borderColor = '#39ff14';
        backBox.style.cursor = 'pointer';
    });
    backBox.addEventListener('click', () => {
        game.previousLevel = 10;
        game.currentLevel = 9;
        game.startNextLevel();
    });
    // Add to playfield
    const playfield = document.querySelector('.playfield');
    if (playfield) {
        playfield.appendChild(innBox);
        playfield.appendChild(backBox);
    } else {
        document.body.appendChild(innBox);
        document.body.appendChild(backBox);
    }
    // Set initial visibility like other doors
    const visible = game.interactableRectsVisible;
    innBox.style.opacity = visible ? '1' : '0';
    innBox.style.pointerEvents = 'auto';
    innBox.style.transition = 'opacity 0.3s';
    backBox.style.opacity = visible ? '1' : '0';
    backBox.style.pointerEvents = 'auto';
    backBox.style.transition = 'opacity 0.3s';
} 