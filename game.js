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
    if (guess === state.secret) {
        setTimeout(() => alert('Congratulations! You won!'), 600);
    } else if (state.currentRow === 5) {
        setTimeout(() => alert(`Game Over! The word was ${state.secret.toUpperCase()}`), 600);
    }
    
    state.currentRow++;
    state.currentCol = 0;
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
