import { Goblin } from '../goblin.js';

export function runLevel22(game) {
    // Level 22: Ember Vault
    // Remove any existing player character
    const existingPlayer = document.querySelector('.player-character');
    if (existingPlayer) {
        existingPlayer.remove();
    }

    // Stop any existing music and play goblin town music
    game.soundManager.stopMusic(false);
    const goblinTownMusic = game.soundManager.sounds.get('goblintown');
    if (goblinTownMusic) {
        goblinTownMusic.loop = true;
        goblinTownMusic.volume = 0.5;
        goblinTownMusic.play().catch(() => {});
        game.soundManager.currentMusic = goblinTownMusic;
    }

    // Remove any existing Back to Town button
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent === 'Back to Town') {
            btn.remove();
        }
    });

    // Also try removing by class
    document.querySelectorAll('.merchant-back-btn').forEach(btn => btn.remove());

    // Remove all existing title texts
    document.querySelectorAll('.mountain-pass-title').forEach(el => el.remove());

    // Let the level manager handle the background
    game.levelManager.setBackground(22);

    // Create player character with entrance animation
    const playerSide = document.querySelector('.player-side');
    if (playerSide) {
        playerSide.innerHTML = '';
        // Create player element with the already initialized playerCharacter
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
        if (game.playerClass === 'mage' || game.playerClass === 'warrior') {
            // Start with player off screen
            playerElement.style.transition = 'none';
            playerElement.style.transform = 'translateX(-200px)';
            void playerElement.offsetWidth; // Force reflow

            // Start the run animation
            game.playerCharacter.playRunAnimation();

            // Play running sound
            const runningSound = game.soundManager.sounds.get('running');
            if (runningSound) {
                runningSound.currentTime = 0;
                runningSound.volume = 0.5;
                runningSound.loop = true;
                runningSound.play().catch(() => {});
            }

            // Animate player moving right
            playerElement.style.transition = 'transform 1s ease-out';
            playerElement.style.transform = 'translateX(0)';

            // Stop animation and sound after movement
            setTimeout(() => {
                game.playerCharacter.stopRunAnimation();
                if (runningSound) {
                    runningSound.pause();
                    runningSound.currentTime = 0;
                }
            }, 1000);
        }
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
        // Add to playfield
        const playfield = document.querySelector('.playfield');
        if (playfield) {
            playfield.style.position = 'relative'; // Ensure playfield has relative positioning
            playfield.appendChild(enemySide);
        } else {
            console.error('Playfield not found');
            return;
        }
    } else {
        // Clear existing enemies
        while (enemySide.firstChild) {
            enemySide.removeChild(enemySide.firstChild);
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

    // Create goblin enemies with fade-in effect
    setTimeout(() => {
        const goblin1 = new Goblin(1, 100, game);
        const goblinElement1 = goblin1.createEnemyElement();
        goblinElement1.classList.add('enemy-character');
        enemySide.appendChild(goblinElement1);
        game.enemies.push(goblin1);
        
        // Trigger fade-in animation
        requestAnimationFrame(() => {
            goblinElement1.classList.add('fade-in');
        });
    }, 0);

    setTimeout(() => {
        const goblin2 = new Goblin(2, 100, game);
        const goblinElement2 = goblin2.createEnemyElement();
        goblinElement2.classList.add('enemy-character');
        enemySide.appendChild(goblinElement2);
        game.enemies.push(goblin2);
        
        // Trigger fade-in animation
        requestAnimationFrame(() => {
            goblinElement2.classList.add('fade-in');
        });
    }, 800);

    setTimeout(() => {
        const goblin3 = new Goblin(3, 100, game);
        const goblinElement3 = goblin3.createEnemyElement();
        goblinElement3.classList.add('enemy-character');
        enemySide.appendChild(goblinElement3);
        game.enemies.push(goblin3);
        
        // Trigger fade-in animation
        requestAnimationFrame(() => {
            goblinElement3.classList.add('fade-in');
        });
    }, 1600);
} 