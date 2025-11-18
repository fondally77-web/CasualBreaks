// ゲーム状態管理
const gameState = {
    sequence: [],
    playerSequence: [],
    round: 1,
    score: 0,
    isPlaying: false,
    isShowingSequence: false,
    maxRounds: 10,
    highScore: 0
};

// DOM要素の取得
const elements = {
    colorButtons: document.querySelectorAll('.color-button'),
    startBtn: document.getElementById('startBtn'),
    resetBtn: document.getElementById('resetBtn'),
    message: document.getElementById('message'),
    round: document.getElementById('round'),
    score: document.getElementById('score'),
    highscore: document.getElementById('highscore')
};

// 色の配列
const colors = ['red', 'blue', 'green', 'yellow'];

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
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    gameState.sequence.push(randomColor);
}

// シーケンスの表示
async function showSequence() {
    gameState.isShowingSequence = true;
    disableColorButtons(true);
    showMessage('よく見てね...', '');

    await sleep(1000);

    for (let i = 0; i < gameState.sequence.length; i++) {
        const color = gameState.sequence[i];
        await highlightButton(color);
        await sleep(300);
    }

    gameState.isShowingSequence = false;
    disableColorButtons(false);
    showMessage('あなたの番です！', '');
}

// ボタンをハイライト
function highlightButton(color) {
    return new Promise(resolve => {
        const button = document.querySelector(`[data-color="${color}"]`);
        button.classList.add('active');
        playSound(color);

        setTimeout(() => {
            button.classList.remove('active');
            resolve();
        }, 500);
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
        yellow: 523.25  // C5
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
        gameOver();
        return;
    }

    // シーケンス全体を正しく入力したかチェック
    if (gameState.playerSequence.length === gameState.sequence.length) {
        // ラウンドクリア
        gameState.score += gameState.round * 10;
        updateDisplay();

        if (gameState.round >= gameState.maxRounds) {
            // ゲームクリア
            gameComplete();
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

// ゲームオーバー
async function gameOver() {
    gameState.isPlaying = false;
    disableColorButtons(true);
    saveHighScore();

    showMessage(`ゲームオーバー！スコア: ${gameState.score}`, 'error');
    elements.startBtn.style.display = 'none';
    elements.resetBtn.style.display = 'block';
}

// ゲームクリア
async function gameComplete() {
    gameState.isPlaying = false;
    disableColorButtons(true);
    saveHighScore();

    showMessage(`🎊 おめでとう！全${gameState.maxRounds}ラウンドクリア！`, 'success');
    elements.startBtn.style.display = 'none';
    elements.resetBtn.style.display = 'block';
}

// ゲーム開始
async function startGame() {
    gameState.sequence = [];
    gameState.playerSequence = [];
    gameState.round = 1;
    gameState.score = 0;
    gameState.isPlaying = true;

    updateDisplay();
    elements.startBtn.style.display = 'none';

    showMessage('ゲームスタート！', '');
    await sleep(1000);

    addColorToSequence();
    await showSequence();
}

// リセット
function resetGame() {
    elements.resetBtn.style.display = 'none';
    elements.startBtn.style.display = 'block';
    showMessage('スタートを押してね！', '');
    disableColorButtons(true);
}

// イベントリスナーの設定
elements.startBtn.addEventListener('click', startGame);
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
