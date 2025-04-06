// Game state
const state = {
    secret: '',
    grid: Array(6).fill().map(() => Array(6).fill('')),
    currentRow: 0,
    currentCol: 0,
    gameOver: false
};

// Word list (we'll expand this later)
const WORD_LIST = ['python', 'coding', 'gaming', 'script', 'player', 'cursor', 'syntax', 'coffee', 'laptop', 'github', 'branch', 'commit'];

// Initialize game
function initGame() {
    // Reset the game state
    state.currentRow = 0;
    state.currentCol = 0;
    state.gameOver = false;
    state.grid = Array(6).fill().map(() => Array(6).fill(''));
    
    // Choose random word
    state.secret = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    console.log("Secret word:", state.secret); // For debugging
    
    // Clear the board visually
    document.querySelectorAll('.letter-box').forEach(box => {
        box.textContent = '';
        box.className = 'letter-box';
    });
    
    // Reset keyboard colors
    document.querySelectorAll('.key').forEach(key => {
        key.className = 'key';
    });
    
    // Reset share button
    const shareButton = document.getElementById('share-button');
    if (shareButton) {
        shareButton.disabled = true;
    }
    
    // Remove existing listeners to prevent duplicates
    document.removeEventListener('keydown', handleKeyPress);
    
    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyPress);
    
    // Add click listeners to virtual keyboard
    document.querySelectorAll('.key').forEach(key => {
        // Remove existing listeners
        key.replaceWith(key.cloneNode(true));
    });
    
    // Re-add event listeners to fresh elements
    document.querySelectorAll('.key').forEach(key => {
        key.addEventListener('click', () => {
            const keyText = key.textContent.toLowerCase();
            if (keyText === 'enter') {
                if (state.currentCol === 6) {
                    checkGuess();
                }
            } else if (keyText === '⌫') {
                removeLetter();
            } else if (keyText.length === 1 && isLetter(keyText) && state.currentCol < 6) {
                addLetter(keyText);
            }
        });
    });
}

// Handle key press
function handleKeyPress(e) {
    if (state.gameOver) return; // Game over
    
    const key = e.key.toLowerCase();
    
    if (key === 'enter') {
        if (state.currentCol === 6) {
            checkGuess();
        }
    } else if (key === 'backspace') {
        removeLetter();
    } else if (isLetter(key) && state.currentCol < 6) {
        addLetter(key);
    }
}

// Add letter to grid
function addLetter(letter) {
    if (state.currentCol === 6) return;
    
    state.grid[state.currentRow][state.currentCol] = letter;
    const box = document.querySelector(
        `.word-row:nth-child(${state.currentRow + 1}) .letter-box:nth-child(${state.currentCol + 1})`
    );
    box.textContent = letter.toUpperCase();
    box.classList.add('filled');
    state.currentCol++;
}

// Remove letter from grid
function removeLetter() {
    if (state.currentCol === 0) return;
    
    state.currentCol--;
    state.grid[state.currentRow][state.currentCol] = '';
    const box = document.querySelector(
        `.word-row:nth-child(${state.currentRow + 1}) .letter-box:nth-child(${state.currentCol + 1})`
    );
    box.textContent = '';
    box.classList.remove('filled');
}

// Check if character is letter
function isLetter(key) {
    return key.length === 1 && key.match(/[a-z]/i);
}

// Check guess
function checkGuess() {
    const guess = state.grid[state.currentRow].join('');
    console.log(`Checking guess: ${guess}, current row: ${state.currentRow}`);
    
    const row = document.querySelector(`.word-row:nth-child(${state.currentRow + 1})`);
    if (!row) {
        console.error(`Could not find row ${state.currentRow + 1}`);
        return;
    }
    
    // Create arrays for checking
    const secret = Array.from(state.secret);
    const guessArr = Array.from(guess);
    const result = Array(6).fill('absent');
    
    // Check for correct letters in correct positions
    guessArr.forEach((letter, i) => {
        if (letter === secret[i]) {
            result[i] = 'correct';
            secret[i] = '#';
            guessArr[i] = '*';
        }
    });
    
    // Check for correct letters in wrong positions
    guessArr.forEach((letter, i) => {
        if (letter !== '*') {
            const index = secret.indexOf(letter);
            if (index !== -1) {
                result[i] = 'present';
                secret[index] = '#';
            }
        }
    });
    
    // Animate tiles and update keyboard
    const boxes = row.querySelectorAll('.letter-box');
    if (boxes.length !== 6) {
        console.error(`Expected 6 letter boxes, found ${boxes.length}`);
    }
    
    boxes.forEach((box, index) => {
        setTimeout(() => {
            box.classList.add('flip');
            box.classList.add(result[index]);
            updateKeyboard(state.grid[state.currentRow][index], result[index]);
        }, index * 100);
    });
    
    // Game end logic
    if (guess === state.secret) {
        state.gameOver = true;
        const shareButton = document.getElementById('share-button');
        if (shareButton) {
            shareButton.disabled = false;
        }
        setTimeout(() => alert('Congratulations! You won!'), 600);
    } else if (state.currentRow === 5) { // Last row
        state.gameOver = true;
        const shareButton = document.getElementById('share-button');
        if (shareButton) {
            shareButton.disabled = false;
        }
        setTimeout(() => alert(`Game Over! The word was ${state.secret.toUpperCase()}`), 600);
    } else {
        // Move to the next row
        state.currentRow++;
        state.currentCol = 0;
        console.log(`Moved to row: ${state.currentRow}`);
    }
}

// Update keyboard colors
function updateKeyboard(letter, result) {
    // Find the specific key that matches this letter
    const allKeys = document.querySelectorAll('.key');
    let key = null;
    
    // Find the key with this letter
    for (const k of allKeys) {
        if (k.textContent.toLowerCase() === letter.toLowerCase()) {
            key = k;
            break;
        }
    }
    
    // If no key found or already correct, exit
    if (!key || key.classList.contains('correct')) return;
    
    // Update the key's class based on result
    if (result === 'correct') {
        key.classList.remove('absent', 'present');
        key.classList.add('correct');
    } else if (result === 'present' && !key.classList.contains('correct')) {
        key.classList.remove('absent');
        key.classList.add('present');
    } else if (result === 'absent' && !key.classList.contains('present') && !key.classList.contains('correct')) {
        key.classList.add('absent');
    }
}

// Start the game
initGame();

function createEmojiGrid() {
    let emojiGrid = '';
    
    // For each completed row
    for (let i = 0; i <= Math.min(state.currentRow, 5); i++) {
        const row = document.querySelector(`.word-row:nth-child(${i + 1})`);
        if (!row) continue;
        
        const boxes = row.querySelectorAll('.letter-box');
        
        // Add emoji for each box based on its class
        for (let box of boxes) {
            if (box.classList.contains('correct')) {
                emojiGrid += '🟩';
            } else if (box.classList.contains('present')) {
                emojiGrid += '🟨';
            } else if (box.classList.contains('filled') || box.classList.contains('absent')) {
                emojiGrid += '⬛';
            }
        }
        emojiGrid += '\n';
    }
    return emojiGrid;
}

// Find the share button element at the top of your file
const shareButton = document.getElementById('share-button');
if (!shareButton) {
    console.error('Share button element not found! Check index.html');
} else {
    console.log('Share button found:', shareButton);
    // Ensure button starts disabled visually and functionally
    shareButton.disabled = true; 
}

function shareScore() {
    // Don't allow sharing if the game is still in progress
    if (!state.gameOver) {
        alert("Finish the game before sharing your score!");
        return;
    }
    
    const tries = state.currentRow + 1; // +1 because we're 0-indexed
    const won = state.secret === state.grid[state.currentRow - 1].join('');
    
    const emojiGrid = createEmojiGrid();
    
    const shareText = `Panda's Wordle+ ${won ? tries : 'X'}/6\n\n${emojiGrid}\nhttps://panda2126.github.io/wordle-plus/`;
    
    // Add WhatsApp specific sharing
    const whatsappButton = document.createElement('button');
    whatsappButton.textContent = 'Share to WhatsApp';
    whatsappButton.className = 'whatsapp-share-button';
    whatsappButton.style.display = 'block';
    whatsappButton.style.margin = '10px auto';
    whatsappButton.style.padding = '8px 16px';
    whatsappButton.style.backgroundColor = '#25D366';
    whatsappButton.style.color = 'white';
    whatsappButton.style.border = 'none';
    whatsappButton.style.borderRadius = '4px';
    whatsappButton.style.cursor = 'pointer';
    
    whatsappButton.addEventListener('click', () => {
        const encodedText = encodeURIComponent(shareText);
        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    });
    
    // Check if button already exists to avoid duplicates
    const existingButton = document.querySelector('.whatsapp-share-button');
    if (!existingButton) {
        // Add the button after the Share Score button
        const shareScoreButton = document.getElementById('share-button');
        if (shareScoreButton && shareScoreButton.parentNode) {
            shareScoreButton.parentNode.insertBefore(whatsappButton, shareScoreButton.nextSibling);
        }
    }
    
    // Also keep the original share functionality
    if (navigator.share) {
        navigator.share({
            text: shareText
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(shareText)
            .then(() => alert('Results copied to clipboard! You can also use the WhatsApp button to share.'))
            .catch(() => alert('Failed to copy results. Try using the WhatsApp button instead.'));
    }
}

// Add event listener (only if button was found)
if (shareButton) {
    shareButton.addEventListener('click', shareScore);
}
