// 難易度設定
const difficultySettings = {
    easy: {
        maxRounds: 10,
        colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'lime'],
        displayDelay: 1000,
        highlightDuration: 500,
        betweenDelay: 300,
        initialSequenceLength: 3
    },
    normal: {
        maxRounds: 15,
        colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'lime'],
        displayDelay: 700,
        highlightDuration: 400,
        betweenDelay: 200,
        initialSequenceLength: 3
    },
    hard: {
        maxRounds: 20,
        colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'lime'],
        displayDelay: 500,
        highlightDuration: 300,
        betweenDelay: 150,
        initialSequenceLength: 3
    }
};

// ゲーム状態管理
const gameState = {
    sequence: [],
    playerSequence: [],
    round: 1,
    score: 0,
    isPlaying: false,
    isShowingSequence: false,
    maxRounds: 10,
    highScore: 0,
    // 難易度
    difficulty: 'easy',
    currentColors: ['red', 'blue', 'green', 'yellow'],
    // マルチプレイヤー用
    isMultiplayer: false,
    players: [],
    currentPlayerIndex: 0,
    playerScores: []
};

// DOM要素の取得
const elements = {
    // 画面
    modeSelection: document.getElementById('modeSelection'),
    difficultySelection: document.getElementById('difficultySelection'),
    playerSetup: document.getElementById('playerSetup'),
    gameScreen: document.getElementById('gameScreen'),

    // モード選択
    singlePlayerBtn: document.getElementById('singlePlayerBtn'),
    multiPlayerBtn: document.getElementById('multiPlayerBtn'),

    // 難易度選択
    difficultyButtons: document.querySelectorAll('.difficulty-btn'),
    backToModeFromDifficultyBtn: document.getElementById('backToModeFromDifficultyBtn'),

    // プレイヤー設定
    playerCount: document.getElementById('playerCount'),
    playerNames: document.getElementById('playerNames'),
    startMultiplayerBtn: document.getElementById('startMultiplayerBtn'),
    backToModeBtn: document.getElementById('backToModeBtn'),

    // ゲーム画面
    currentPlayerDisplay: document.getElementById('currentPlayerDisplay'),
    currentPlayerName: document.getElementById('currentPlayerName'),
    colorGrid: document.getElementById('colorGrid'),
    colorButtons: document.querySelectorAll('.color-button'),
    startBtn: document.getElementById('startBtn'),
    resetBtn: document.getElementById('resetBtn'),
    message: document.getElementById('message'),
    round: document.getElementById('round'),
    score: document.getElementById('score'),
    highscore: document.getElementById('highscore'),
    leaderboard: document.getElementById('leaderboard'),
    leaderboardList: document.getElementById('leaderboardList')
};

// ===== 画面遷移関数 =====

function showModeSelection() {
    elements.modeSelection.style.display = 'block';
    elements.difficultySelection.style.display = 'none';
    elements.playerSetup.style.display = 'none';
    elements.gameScreen.style.display = 'none';
}

function showDifficultySelection() {
    elements.modeSelection.style.display = 'none';
    elements.difficultySelection.style.display = 'block';
    elements.playerSetup.style.display = 'none';
    elements.gameScreen.style.display = 'none';
}

function showPlayerSetup() {
    elements.modeSelection.style.display = 'none';
    elements.difficultySelection.style.display = 'none';
    elements.playerSetup.style.display = 'block';
    elements.gameScreen.style.display = 'none';
    generatePlayerInputs();
}

function showGameScreen() {
    elements.modeSelection.style.display = 'none';
    elements.difficultySelection.style.display = 'none';
    elements.playerSetup.style.display = 'none';
    elements.gameScreen.style.display = 'block';
}

// ===== 難易度設定関数 =====

function applyDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    const settings = difficultySettings[difficulty];

    gameState.maxRounds = settings.maxRounds;
    gameState.currentColors = settings.colors;
    // 全ての色は常に表示される（3×3グリッド）
}

// ===== プレイヤー設定関数 =====

function generatePlayerInputs() {
    const count = parseInt(elements.playerCount.value);
    elements.playerNames.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        div.className = 'player-input';
        div.innerHTML = `
            <label>プレイヤー${i + 1}:</label>
            <input type="text" id="player${i}" placeholder="名前を入力" value="プレイヤー${i + 1}">
        `;
        elements.playerNames.appendChild(div);
    }
}

// ===== ゲーム関数 =====

// ローカルストレージから最高記録を読み込む
function loadHighScore() {
    const saved = localStorage.getItem('colorMemoryHighScore');
    gameState.highScore = saved ? parseInt(saved) : 0;
    updateDisplay();
}

// 最高記録を保存
function saveHighScore() {
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('colorMemoryHighScore', gameState.highScore);
    }
}

// 表示の更新
function updateDisplay() {
    elements.round.textContent = gameState.round;
    elements.score.textContent = gameState.score;
    elements.highscore.textContent = gameState.highScore;
}

// メッセージの表示
function showMessage(text, type = '') {
    elements.message.textContent = text;
    elements.message.className = 'message ' + type;
}

// ランダムな色を追加
function addColorToSequence() {
    const currentColors = gameState.currentColors;
    const randomColor = currentColors[Math.floor(Math.random() * currentColors.length)];
    gameState.sequence.push(randomColor);
}

// シーケンスの表示
async function showSequence() {
    const settings = difficultySettings[gameState.difficulty];

    gameState.isShowingSequence = true;
    disableColorButtons(true);
    showMessage('よく見てね...', '');

    await sleep(settings.displayDelay);

    for (let i = 0; i < gameState.sequence.length; i++) {
        const color = gameState.sequence[i];
        await highlightButton(color, settings.highlightDuration);
        await sleep(settings.betweenDelay);
    }

    gameState.isShowingSequence = false;
    disableColorButtons(false);

    if (gameState.isMultiplayer) {
        const playerName = gameState.players[gameState.currentPlayerIndex];
        showMessage(`${playerName}さんの番です！`, '');
    } else {
        showMessage('あなたの番です！', '');
    }
}

// ボタンをハイライト
function highlightButton(color, duration = 500) {
    return new Promise(resolve => {
        const button = document.querySelector(`[data-color="${color}"]`);
        button.classList.add('active');
        playSound(color);

        setTimeout(() => {
            button.classList.remove('active');
            resolve();
        }, duration);
    });
}

// 効果音の再生（Web Audio API使用）
function playSound(color) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // 色ごとに異なる周波数
    const frequencies = {
        red: 329.63,    // E4
        blue: 392.00,   // G4
        green: 493.88,  // B4
        yellow: 523.25, // C5
        purple: 587.33, // D5
        orange: 659.25, // E5
        pink: 698.46,   // F5
        cyan: 783.99,   // G5
        lime: 880.00    // A5
    };

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequencies[color];
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// カラーボタンの有効/無効切り替え
function disableColorButtons(disabled) {
    elements.colorButtons.forEach(btn => {
        btn.disabled = disabled;
    });
}

// スリープ関数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// プレイヤーの入力をチェック
function checkPlayerInput(color) {
    const currentIndex = gameState.playerSequence.length;
    gameState.playerSequence.push(color);

    // 正しい色かチェック
    if (color !== gameState.sequence[currentIndex]) {
        // 間違い
        if (gameState.isMultiplayer) {
            multiplayerGameOver();
        } else {
            gameOver();
        }
        return;
    }

    // シーケンス全体を正しく入力したかチェック
    if (gameState.playerSequence.length === gameState.sequence.length) {
        // ラウンドクリア
        gameState.score += gameState.round * 10;
        updateDisplay();

        if (gameState.round >= gameState.maxRounds) {
            // ゲームクリア
            if (gameState.isMultiplayer) {
                multiplayerRoundComplete();
            } else {
                gameComplete();
            }
        } else {
            // 次のラウンドへ
            nextRound();
        }
    }
}

// 次のラウンドへ
async function nextRound() {
    disableColorButtons(true);
    showMessage('正解！🎉', 'success');
    await sleep(1500);

    gameState.round++;
    gameState.playerSequence = [];
    updateDisplay();

    addColorToSequence();
    await showSequence();
}

// ゲームオーバー（シングルプレイヤー）
async function gameOver() {
    gameState.isPlaying = false;
    disableColorButtons(true);
    saveHighScore();

    showMessage(`ゲームオーバー！スコア: ${gameState.score}`, 'error');
    elements.startBtn.style.display = 'none';
    elements.resetBtn.style.display = 'block';
}

// ゲームクリア（シングルプレイヤー）
async function gameComplete() {
    gameState.isPlaying = false;
    disableColorButtons(true);
    saveHighScore();

    showMessage(`🎊 おめでとう！全${gameState.maxRounds}ラウンドクリア！`, 'success');
    elements.startBtn.style.display = 'none';
    elements.resetBtn.style.display = 'block';
}

// ===== マルチプレイヤー関数 =====

// マルチプレイヤーゲームオーバー
async function multiplayerGameOver() {
    // 現在のプレイヤーのスコアを記録
    gameState.playerScores[gameState.currentPlayerIndex] = gameState.score;

    disableColorButtons(true);
    const playerName = gameState.players[gameState.currentPlayerIndex];
    showMessage(`${playerName}さん終了！スコア: ${gameState.score}`, 'error');

    await sleep(2000);

    // 次のプレイヤーへ
    gameState.currentPlayerIndex++;

    if (gameState.currentPlayerIndex >= gameState.players.length) {
        // 全員終了
        showFinalResults();
    } else {
        // 次のプレイヤーのターン
        startNextPlayerTurn();
    }
}

// ラウンド完了（マルチプレイヤー）
async function multiplayerRoundComplete() {
    // 現在のプレイヤーのスコアを記録（完走）
    gameState.playerScores[gameState.currentPlayerIndex] = gameState.score;

    disableColorButtons(true);
    const playerName = gameState.players[gameState.currentPlayerIndex];
    showMessage(`🎊 ${playerName}さん全クリア！スコア: ${gameState.score}`, 'success');

    await sleep(3000);

    // 次のプレイヤーへ
    gameState.currentPlayerIndex++;

    if (gameState.currentPlayerIndex >= gameState.players.length) {
        // 全員終了
        showFinalResults();
    } else {
        // 次のプレイヤーのターン
        startNextPlayerTurn();
    }
}

// 次のプレイヤーのターン開始
async function startNextPlayerTurn() {
    const playerName = gameState.players[gameState.currentPlayerIndex];
    elements.currentPlayerName.textContent = playerName;

    // ゲーム状態をリセット
    gameState.sequence = [];
    gameState.playerSequence = [];
    gameState.round = 1;
    gameState.score = 0;

    updateDisplay();
    updateLeaderboard();

    showMessage(`${playerName}さんの準備をしてね！`, '');
    await sleep(2000);

    showMessage('ゲームスタート！', '');
    await sleep(1000);

    // 初期シーケンスを設定（3色から開始）
    const settings = difficultySettings[gameState.difficulty];
    for (let i = 0; i < settings.initialSequenceLength; i++) {
        addColorToSequence();
    }
    await showSequence();
}

// リーダーボードの更新
function updateLeaderboard() {
    elements.leaderboardList.innerHTML = '';

    // スコアと名前のペアを作成
    const scores = gameState.players.map((name, index) => ({
        name: name,
        score: gameState.playerScores[index] || 0,
        isPlaying: index === gameState.currentPlayerIndex
    }));

    // スコアでソート
    scores.sort((a, b) => b.score - a.score);

    // リーダーボード表示
    scores.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = `leaderboard-item ${index < 3 ? 'rank-' + (index + 1) : ''}`;

        const rankEmojis = ['🥇', '🥈', '🥉'];
        const rankBadge = index < 3 ? rankEmojis[index] : `${index + 1}位`;

        item.innerHTML = `
            <div class="player-info">
                <span class="rank-badge">${rankBadge}</span>
                <span class="player-name-leaderboard">${player.name}${player.isPlaying ? ' ▶' : ''}</span>
            </div>
            <span class="player-score">${player.score}</span>
        `;

        elements.leaderboardList.appendChild(item);
    });
}

// 最終結果の表示
function showFinalResults() {
    elements.currentPlayerDisplay.style.display = 'none';
    updateLeaderboard();

    // 優勝者を探す
    const maxScore = Math.max(...gameState.playerScores);
    const winnerIndex = gameState.playerScores.indexOf(maxScore);
    const winner = gameState.players[winnerIndex];

    showMessage(`🏆 優勝: ${winner}さん！スコア: ${maxScore}`, 'success');

    elements.startBtn.style.display = 'none';
    elements.resetBtn.style.display = 'block';
}

// ===== ゲーム開始関数 =====

// シングルプレイヤーゲーム開始
async function startSinglePlayerGame() {
    gameState.isMultiplayer = false;
    gameState.sequence = [];
    gameState.playerSequence = [];
    gameState.round = 1;
    gameState.score = 0;
    gameState.isPlaying = true;

    elements.currentPlayerDisplay.style.display = 'none';
    elements.leaderboard.style.display = 'none';

    showGameScreen();
    updateDisplay();
    elements.startBtn.style.display = 'none';

    showMessage('ゲームスタート！', '');
    await sleep(1000);

    // 初期シーケンスを設定（3色から開始）
    const settings = difficultySettings[gameState.difficulty];
    for (let i = 0; i < settings.initialSequenceLength; i++) {
        addColorToSequence();
    }
    await showSequence();
}

// マルチプレイヤーゲーム開始
async function startMultiPlayerGame() {
    // プレイヤー名を取得
    const playerCount = parseInt(elements.playerCount.value);
    gameState.players = [];

    for (let i = 0; i < playerCount; i++) {
        const input = document.getElementById(`player${i}`);
        const name = input.value.trim() || `プレイヤー${i + 1}`;
        gameState.players.push(name);
    }

    gameState.isMultiplayer = true;
    gameState.currentPlayerIndex = 0;
    gameState.playerScores = new Array(playerCount).fill(0);

    gameState.sequence = [];
    gameState.playerSequence = [];
    gameState.round = 1;
    gameState.score = 0;
    gameState.isPlaying = true;

    showGameScreen();

    elements.currentPlayerDisplay.style.display = 'block';
    elements.leaderboard.style.display = 'block';
    elements.startBtn.style.display = 'none';

    const playerName = gameState.players[0];
    elements.currentPlayerName.textContent = playerName;

    updateDisplay();
    updateLeaderboard();

    showMessage(`${playerName}さんの準備をしてね！`, '');
    await sleep(2000);

    showMessage('ゲームスタート！', '');
    await sleep(1000);

    // 初期シーケンスを設定（3色から開始）
    const settings = difficultySettings[gameState.difficulty];
    for (let i = 0; i < settings.initialSequenceLength; i++) {
        addColorToSequence();
    }
    await showSequence();
}

// リセット
function resetGame() {
    elements.resetBtn.style.display = 'none';
    disableColorButtons(true);
    showModeSelection();
}

// ===== イベントリスナーの設定 =====

// モード選択
elements.singlePlayerBtn.addEventListener('click', () => {
    gameState.isMultiplayer = false;
    showDifficultySelection();
});

elements.multiPlayerBtn.addEventListener('click', () => {
    gameState.isMultiplayer = true;
    showDifficultySelection();
});

// 難易度選択
elements.difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
        const difficulty = button.dataset.difficulty;
        applyDifficulty(difficulty);

        if (gameState.isMultiplayer) {
            showPlayerSetup();
        } else {
            startSinglePlayerGame();
        }
    });
});

elements.backToModeFromDifficultyBtn.addEventListener('click', () => {
    showModeSelection();
});

// プレイヤー設定
elements.playerCount.addEventListener('change', generatePlayerInputs);

elements.startMultiplayerBtn.addEventListener('click', () => {
    startMultiPlayerGame();
});

elements.backToModeBtn.addEventListener('click', () => {
    showDifficultySelection();
});

// ゲーム操作
elements.startBtn.addEventListener('click', startSinglePlayerGame);
elements.resetBtn.addEventListener('click', resetGame);

elements.colorButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (!gameState.isPlaying || gameState.isShowingSequence) {
            return;
        }

        const color = button.dataset.color;
        highlightButton(color);
        checkPlayerInput(color);
    });
});

// 初期化
loadHighScore();
disableColorButtons(true);
showModeSelection();
