// ゲーム状態
const gameState = {
    isPlaying: false,
    timeLimit: 60,
    timeRemaining: 60,
    count: 0,
    timerId: null
};

// DOM要素
const elements = {
    startScreen: document.getElementById('startScreen'),
    gameScreen: document.getElementById('gameScreen'),
    resultScreen: document.getElementById('resultScreen'),

    timeButtons: document.querySelectorAll('.time-btn'),
    pullBtn: document.getElementById('pullBtn'),
    restartBtn: document.getElementById('restartBtn'),

    timer: document.getElementById('timer'),
    count: document.getElementById('count'),
    resultCount: document.getElementById('resultCount'),
    resultMessage: document.getElementById('resultMessage'),

    pulledTissues: document.getElementById('pulledTissues'),
    tissueVisible: document.getElementById('tissueVisible')
};

// 画面切り替え
function showScreen(screen) {
    elements.startScreen.style.display = 'none';
    elements.gameScreen.style.display = 'none';
    elements.resultScreen.style.display = 'none';

    if (screen === 'start') {
        elements.startScreen.style.display = 'block';
    } else if (screen === 'game') {
        elements.gameScreen.style.display = 'block';
    } else if (screen === 'result') {
        elements.resultScreen.style.display = 'block';
    }
}

// ゲーム開始
function startGame(timeLimit) {
    gameState.isPlaying = true;
    gameState.timeLimit = timeLimit;
    gameState.timeRemaining = timeLimit;
    gameState.count = 0;

    updateDisplay();
    showScreen('game');

    // タイマー開始
    gameState.timerId = setInterval(() => {
        gameState.timeRemaining--;
        updateDisplay();

        if (gameState.timeRemaining <= 0) {
            endGame();
        }
    }, 1000);
}

// 表示更新
function updateDisplay() {
    elements.timer.textContent = gameState.timeRemaining;
    elements.count.textContent = gameState.count;
}

// ティッシュを引っ張る
function pullTissue() {
    if (!gameState.isPlaying) return;

    gameState.count++;
    updateDisplay();

    // アニメーション効果
    createPulledTissueAnimation();
    animateTissueBox();
    playPullSound();
}

// 引っ張られたティッシュのアニメーション
function createPulledTissueAnimation() {
    const tissue = document.createElement('div');
    tissue.className = 'pulled-tissue';

    // ランダムな角度でバリエーション
    const randomAngle = (Math.random() - 0.5) * 20;
    tissue.style.setProperty('--random-angle', randomAngle + 'deg');

    elements.pulledTissues.appendChild(tissue);

    // アニメーション終了後に要素を削除
    setTimeout(() => {
        tissue.remove();
    }, 600);
}

// ティッシュ箱を揺らす
function animateTissueBox() {
    const box = document.querySelector('.tissue-box');
    box.style.animation = 'shake 0.2s ease';

    setTimeout(() => {
        box.style.animation = '';
    }, 200);
}

// CSS に shake アニメーションを追加
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: rotateX(-10deg) rotateY(0deg); }
        25% { transform: rotateX(-10deg) rotateY(-3deg); }
        75% { transform: rotateX(-10deg) rotateY(3deg); }
    }
`;
document.head.appendChild(style);

// 効果音（Web Audio API）
function playPullSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 爽快な「シュッ」という音
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// ゲーム終了
function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.timerId);

    // 結果メッセージ
    let message = '';
    const count = gameState.count;

    if (count === 0) {
        message = '1枚も引っ張れませんでした...😅';
    } else if (count < 10) {
        message = 'もっと頑張りましょう！💪';
    } else if (count < 20) {
        message = 'いい感じです！👍';
    } else if (count < 30) {
        message = 'すごい！かなり速いです！🎉';
    } else if (count < 50) {
        message = '超速い！プロ級です！⚡';
    } else {
        message = '神業！！！あなたはティッシュマスター！🏆';
    }

    elements.resultCount.textContent = count;
    elements.resultMessage.textContent = message;

    showScreen('result');
}

// リスタート
function restart() {
    gameState.isPlaying = false;
    if (gameState.timerId) {
        clearInterval(gameState.timerId);
    }
    showScreen('start');
}

// イベントリスナー設定
elements.timeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const time = parseInt(button.dataset.time);
        startGame(time);
    });
});

elements.pullBtn.addEventListener('click', pullTissue);

// スペースキーでも引っ張れる
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameState.isPlaying) {
        e.preventDefault();
        pullTissue();
    }
});

elements.restartBtn.addEventListener('click', restart);

// 初期表示
showScreen('start');
