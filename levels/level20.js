export function runLevel20(game) {
    // Level 20: Mountain pass, no player character needed
    // Remove any existing player character
    const existingPlayer = document.querySelector('.player-character');
    if (existingPlayer) {
        existingPlayer.remove();
    }

    // Remove any existing Back to Town button - try multiple selectors
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent === 'Back to Town') {
            btn.remove();
        }
    });

    // Also try removing by class
    document.querySelectorAll('.merchant-back-btn').forEach(btn => btn.remove());

    // Remove all existing title texts
    document.querySelectorAll('.mountain-pass-title, .embervault-title').forEach(el => el.remove());

    // Create and add the title text
    const titleText = document.createElement('div');
    titleText.className = 'mountain-pass-title';  // Add class for future cleanup
    titleText.style.position = 'fixed';
    titleText.style.top = '365px';  // Moved down from 40px to 120px
    titleText.style.left = '48%';
    titleText.style.transform = 'translateX(-50%)';
    titleText.style.color = '#000';
    titleText.style.fontSize = '1.125em';  // Reduced from 1.5em by 25%
    titleText.style.fontFamily = 'Cinzel, Times New Roman, serif';
    titleText.style.textAlign = 'center';
    titleText.style.zIndex = '2000';
    titleText.textContent = 'Mountain pass';
    document.body.appendChild(titleText);

    // Create and add the Embervault text
    const embervaultText = document.createElement('div');
    embervaultText.className = 'embervault-title';
    embervaultText.style.position = 'fixed';
    embervaultText.style.top = '442px';  // Moved down from 425px to 445px
    embervaultText.style.left = '47.5%';
    embervaultText.style.transform = 'translateX(-50%)';
    embervaultText.style.color = '#000';
    embervaultText.style.fontSize = '1.125em';
    embervaultText.style.fontFamily = 'Cinzel, Times New Roman, serif';
    embervaultText.style.textAlign = 'center';
    embervaultText.style.zIndex = '2000';
    embervaultText.textContent = 'Embervault';
    document.body.appendChild(embervaultText);

    // Add Mountain Pass door box
    const mountainPassBox = document.createElement('div');
    mountainPassBox.className = 'inn-door-box interactable-rect';
    mountainPassBox.style.position = 'absolute';
    mountainPassBox.style.left = '58%';
    mountainPassBox.style.top = '50%';
    mountainPassBox.style.width = '460px';
    mountainPassBox.style.height = '300px';
    mountainPassBox.style.background = 'rgba(80, 200, 255, 0.25)';
    mountainPassBox.style.border = '2px solid #39ff14';
    mountainPassBox.style.borderRadius = '12px';
    mountainPassBox.style.cursor = 'url("./assets/Images/mageboots48.png") 24 40, pointer';
    mountainPassBox.style.zIndex = '3000';
    mountainPassBox.title = 'Mountain Pass';
    mountainPassBox.style.display = 'flex';
    mountainPassBox.style.alignItems = 'center';
    mountainPassBox.style.justifyContent = 'center';
    mountainPassBox.style.fontSize = '2em';
    mountainPassBox.style.color = '#fff';
    mountainPassBox.style.fontWeight = 'bold';
    mountainPassBox.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
    mountainPassBox.textContent = 'Mountain Pass';
    mountainPassBox.style.opacity = '0';
    mountainPassBox.style.pointerEvents = 'auto';
    mountainPassBox.style.transition = 'opacity 0.3s';

    // Add hover effects
    mountainPassBox.addEventListener('mouseenter', () => {
        mountainPassBox.style.background = 'rgba(80, 255, 180, 0.35)';
        mountainPassBox.style.borderColor = '#fff';
        mountainPassBox.style.cursor = 'url("./assets/Images/mageboots48.png") 24 40, pointer';
    });

    mountainPassBox.addEventListener('mouseleave', () => {
        mountainPassBox.style.background = 'rgba(80, 200, 255, 0.25)';
        mountainPassBox.style.borderColor = '#39ff14';
        mountainPassBox.style.cursor = 'pointer';
    });

    // Add click handler
    mountainPassBox.addEventListener('click', () => {
        game.previousLevel = 20;
        game.currentLevel = 21;  // Assuming level 21 is the next level
        game.startNextLevel();
    });

    // Add to playfield
    const playfield = document.querySelector('.playfield');
    if (playfield) {
        playfield.appendChild(mountainPassBox);
    } else {
        document.body.appendChild(mountainPassBox);
    }

    // Add Ember Vault door box
    const emberVaultBox = document.createElement('div');
    emberVaultBox.className = 'inn-door-box interactable-rect';
    emberVaultBox.style.position = 'absolute';
    emberVaultBox.style.left = '1%';  // Position it on the left side
    emberVaultBox.style.top = '50%';
    emberVaultBox.style.width = '400px';
    emberVaultBox.style.height = '300px';
    emberVaultBox.style.background = 'rgba(80, 200, 255, 0.25)';
    emberVaultBox.style.border = '2px solid #39ff14';
    emberVaultBox.style.borderRadius = '12px';
    emberVaultBox.style.cursor = 'url("./assets/Images/mageboots48.png") 24 40, pointer';
    emberVaultBox.style.zIndex = '3000';
    emberVaultBox.title = 'Ember Vault';
    emberVaultBox.style.display = 'flex';
    emberVaultBox.style.alignItems = 'center';
    emberVaultBox.style.justifyContent = 'center';
    emberVaultBox.style.fontSize = '2em';
    emberVaultBox.style.color = '#fff';
    emberVaultBox.style.fontWeight = 'bold';
    emberVaultBox.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
    emberVaultBox.textContent = 'Ember Vault';
    emberVaultBox.style.opacity = '0';
    emberVaultBox.style.pointerEvents = 'auto';
    emberVaultBox.style.transition = 'opacity 0.3s';

    // Add hover effects
    emberVaultBox.addEventListener('mouseenter', () => {
        emberVaultBox.style.background = 'rgba(80, 255, 180, 0.35)';
        emberVaultBox.style.borderColor = '#fff';
        emberVaultBox.style.cursor = 'url("./assets/Images/mageboots48.png") 24 40, pointer';
    });

    emberVaultBox.addEventListener('mouseleave', () => {
        emberVaultBox.style.background = 'rgba(80, 200, 255, 0.25)';
        emberVaultBox.style.borderColor = '#39ff14';
        emberVaultBox.style.cursor = 'pointer';
    });

    // Add click handler
    emberVaultBox.addEventListener('click', () => {
        game.previousLevel = 20;
        game.currentLevel = 22;  // Assuming level 22 is the Ember Vault level
        game.startNextLevel();
    });

    // Add to playfield
    if (playfield) {
        playfield.appendChild(emberVaultBox);
    } else {
        document.body.appendChild(emberVaultBox);
    }

    // Set initial visibility
    const visible = game.interactableRectsVisible;
    mountainPassBox.style.opacity = visible ? '1' : '0';
    emberVaultBox.style.opacity = visible ? '1' : '0';
} 