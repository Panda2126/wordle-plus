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
    
    // Check if game is won or lost
    let gameJustEnded = false;

    if (guess === state.secret) {
        console.log('Game Won! Attempting to enable share button.');
        state.currentRow++;
        state.currentCol = 0;
        gameJustEnded = true;
        setTimeout(() => alert('Congratulations! You won!'), 600); // Delay alert slightly
    } else if (state.currentRow === 6) {
        console.log('Game Lost! Attempting to enable share button.');
        state.currentRow++;
        state.currentCol = 0;
        gameJustEnded = true;
        setTimeout(() => alert(`Game Over! The word was ${state.secret.toUpperCase()}`), 600); // Delay alert slightly
    }

    // Enable the button *if* the game just ended
    if (gameJustEnded && document.getElementById('share-button')) {
        document.getElementById('share-button').disabled = false;
        console.log('Share button enabled.', document.getElementById('share-button').disabled);
    } 
}

// Update keyboard colors
function updateKeyboard(letter, result) {
    const key = document.querySelector(`.key:not(.enter):not(.backspace)`);
    
    if (key.classList.contains('correct')) return;
    if (result === 'correct' || (result === 'present' && !key.classList.contains('present'))) {
        key.classList.remove('absent', 'present');
        key.classList.add(result);
    } else if (result === 'absent' && !key.classList.contains('present') && !key.classList.contains('correct')) {
        key.classList.add('absent');
    }
}

// Start the game
initGame();

function createEmojiGrid() {
    let emojiGrid = '';
    const rows = document.querySelectorAll('.row');
    for (let i = 0; i < state.currentRow; i++) {
        const tiles = rows[i].querySelectorAll('.tile');
        for (let tile of tiles) {
            if (tile.classList.contains('correct')) {
                emojiGrid += '🟩';
            } else if (tile.classList.contains('present')) {
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
    if (state.currentRow === 6) return;
    
    const tries = state.currentRow;
    const won = tries === 6;
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

// Add event listener (only if button was found)
if (shareButton) {
    shareButton.addEventListener('click', shareScore);
}
