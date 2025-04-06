// Game state
const state = {
    secret: '',
    grid: Array(6).fill().map(() => Array(6).fill('')),
    currentRow: 0,
    currentCol: 0,
};

// Word list (we'll expand this later)
const WORD_LIST = ['python', 'coding', 'gaming', 'script', 'player'];

// Initialize game
function initGame() {
    // Choose random word
    state.secret = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    
    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyPress);
    
    // Add click listeners to virtual keyboard
    document.querySelectorAll('.key').forEach(key => {
        key.addEventListener('click', () => {
            handleKeyPress({ key: key.textContent.toLowerCase() });
        });
    });
}

// Handle key press
function handleKeyPress(e) {
    if (state.currentRow === 6) return; // Game over

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
    const row = document.querySelector(`.word-row:nth-child(${state.currentRow + 1})`);
    
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
    row.querySelectorAll('.letter-box').forEach((box, index) => {
        setTimeout(() => {
            box.classList.add('flip');
            box.classList.add(result[index]);
            updateKeyboard(state.grid[state.currentRow][index], result[index]);
        }, index * 100);
    });
    
    // --- Game End Logic ---
    let gameJustEnded = false;

    if (guess === state.secret) {
        console.log('Game Won! Attempting to enable share button.');
        gameEnded = true; // Set global game ended variable
        gameJustEnded = true;
        setTimeout(() => alert('Congratulations! You won!'), 100); // Shorten delay
    } else if (state.currentRow === 5) { // Change to 5 since we're on the last row before incrementing
        console.log('Game Lost! Attempting to enable share button.');
        gameEnded = true; // Set global game ended variable
        gameJustEnded = true;
        setTimeout(() => alert(`Game Over! The word was ${state.secret.toUpperCase()}`), 100); // Shorten delay
    }

    // Enable the button *if* the game just ended
    if (gameJustEnded && document.getElementById('share-button')) {
        document.getElementById('share-button').disabled = false;
        console.log('Share button enabled.', document.getElementById('share-button').disabled);
    } 

    // --- Advance to next row (if game didn't end) ---
    if (!gameJustEnded) {
        state.currentRow++;
        state.currentCol = 0;
        console.log(`Moved to row: ${state.currentRow}`);
    }
    // --- End Advance to next row ---
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
    // Get all word rows
    const rows = document.querySelectorAll('.word-row');
    
    // For each completed row
    for (let i = 0; i < state.currentRow; i++) {
        // Get all letter boxes in this row
        const boxes = rows[i].querySelectorAll('.letter-box');
        
        // Add emoji for each box based on its class
        for (let box of boxes) {
            if (box.classList.contains('correct')) {
                emojiGrid += '🟩';
            } else if (box.classList.contains('present')) {
                emojiGrid += '🟨';
            } else {
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
    if (state.currentRow < 1 || (!gameEnded && state.currentRow < 6)) {
        alert("Finish the game before sharing your score!");
        return;
    }
    
    const tries = state.currentRow;
    // Determine if the player won by checking if the last row matches the secret word
    const lastGuessRow = Math.min(tries, 6) - 1;
    const lastGuess = state.grid[lastGuessRow].join('');
    const won = lastGuess === state.secret;
    
    const emojiGrid = createEmojiGrid();
    
    const shareText = `Panda's Wordle+ ${won ? tries : 'X'}/6\n\n${emojiGrid}\nhttps://panda2126.github.io/wordle-plus/`;
    
    if (navigator.share) {
        navigator.share({
            text: shareText
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(shareText)
            .then(() => alert('Results copied to clipboard!'))
            .catch(() => alert('Failed to copy results'));
    }
}

// Add a global variable to track game state
let gameEnded = false;

// Add event listener (only if button was found)
if (shareButton) {
    shareButton.addEventListener('click', shareScore);
}
