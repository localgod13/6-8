export function runLevel26(game) {
    // Level 26: Return to Town after rescuing Garrick
    // Remove any existing player character
    const existingPlayer = document.querySelector('.player-character');
    if (existingPlayer) {
        existingPlayer.remove();
    }

    // Remove any existing buttons
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent === 'Return to Town') {
            btn.remove();
        }
    });

    // Set up the background
    const playfield = document.querySelector('.playfield');
    if (playfield) {
        playfield.style.backgroundImage = 'url("./assets/Images/townday.png")';
        playfield.style.backgroundSize = 'cover';
        playfield.style.backgroundPosition = 'center';
        playfield.style.backgroundRepeat = 'no-repeat';
    }

    // Play town day music
    if (game.soundManager) {
        game.soundManager.stopMusic(false); // Stop any existing music
        game.soundManager.playMusic('townday', true); // Play townday.mp3 with loop
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
    game.levelManager.setBackground(26);
    game.levelManager.setMusicAndNarration(26);

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
} 