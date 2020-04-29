const typeText = document.querySelector('.type-text');
const typeTextGuide = document.querySelector('.type-text-guide');
const timerText = document.querySelector('.timer');
const timerGuides = document.querySelectorAll('.timer-guide')
const characters = document.querySelectorAll('.character-content.result');

let wordChars;              // 問題文の配列
let insertTextJa;           // 問題文を吹き出しに挿入(日本語)
let insertTextEn;           // 問題文を吹き出しに挿入(ローマ字)
let isPressedKey = [];      // 指定キーコードが押されたかどうか
let isPressedShiftKey;      // shiftkeyが押されたかどうか
let started = false;        // 最初のspaceキーが二度押されるのを防ぐため
const shiftkeyCode = 16;
const spaceCode = 32;
let count = 4;              // カウントダウン用
let timer = 60;             // 制限時間(秒)
let countCorrect = 0;       // 正しく打った数
let countUncorrect = 0;     // 間違えた数
let countClearWords = 0;    // クリアした単語数

const timerNum = timer      // 結果の時の計算用

const mondai = [
    ['うどん', 'そば', 'カレーライス', '手塩にかけて育てたナメクジが死んだ。', '癖になる、モンスター', 'ダルビッシュはYoutuber', 'ここに乗せたい一言募集中'],
    ['udon', 'soba', 'kare-raisu', 'tesionikaketesodatetanamekujigasinda.', 'kuseninaru,monsuta-', 'darubissyuhaYoutuber', 'kokoninosetaihitokotobosyuutyuu']
];

// const mondai = [
//     ['うどん?'],
//     ['UdoN?~']
// ]

// スペースキーを押してゲームを始める
window.addEventListener('keydown', event => {
    event.preventDefault();
    if(!started) {
        if(event.keyCode === spaceCode) {
            gameStart();
        }
    } else {
        return false;
    }
});

const gameStart = () => {
    started = true;
    const anmakuClass = prefix => document.querySelector('.anmaku' + prefix);
    anmakuClass('-guide').style.display = "none";

    // マイナスしていくカウントダウン
    // 3、2、1、GO!
    // 1秒待ってから処理を行ってしまうため、下記を指定
    anmakuClass('-count-' + count).classList.add('active');
    const countDown = setInterval(() => {
        count--;
        if(count === 0) {
            clearInterval(countDown);
            anmakuClass('-wrap').style.display = 'none';
            // ここにタイマー処理を設定する
            startTimer();
            init();
        }
        // 上で処理すると1秒待たずにsetIntervalが終わるためこの配置
        anmakuClass('-count-' + count).classList.add('active');
    }, 1000);
}

const startTimer = () => {
    timerText.innerHTML = timer
    timerGuides.forEach(timerGuide => {
        timerGuide.classList.add('active');
    })
    setTimer = setInterval(() => {
        timer--
        if(timer === 10) {
            timerText.classList.add('timeup');
        } else if(timer === 0) {
            timerText.classList.remove('timeup');
            timerText.classList.add('timeout');
            clearInterval(setTimer);
            gameEnd()
        }
        timerText.innerHTML = timer
    }, 1000)
}

const gameEnd = () => {

    // キーボードイベントを受け付けなくする
    document.onkeydown = false;
    document.onkeyup = false;
    gameResult();
}

const gameResult = () => {
    const countType = countCorrect + countUncorrect;
    const correctRate = Math.round((countCorrect / countType) * 100);
    const typeAverage = Math.round((countType / timerNum) * 10) / 10
    const resultClass = prefix => document.querySelector('.result' + prefix);
    
    // それぞれに結果を追加していく
    resultClass('-type').innerHTML = countType;                 // タイプ数
    resultClass('-correct').innerHTML = countCorrect;           // 正解数
    resultClass('-uncorrect').innerHTML = countUncorrect;       // ミス数
    resultClass('-type-average').innerHTML = typeAverage + '回/秒';       // 平均タイプ数
    if(countType === 0) {
        resultClass('-correct-rate').innerHTML = 'なんか打てよ。';
    } else {
        resultClass('-correct-rate').innerHTML = correctRate + '%';   // 正解率
    }

    if(typeAverage >= 4.5 && correctRate >= 95) {
        resultClass('-serif').innerHTML = 'やるやん';
        characters[0].classList.add('active');
    } else if(typeAverage < 4.5 && typeAverage >= 3.5 && correctRate <= 100 && correctRate > 80) {
        resultClass('-serif').innerHTML = 'もうちょい！';
        characters[1].classList.add('active');
    } else if(typeAverage < 3.5 && typeAverage >= 2.5 && correctRate <= 80 && correctRate > 70) {
        resultClass('-serif').innerHTML = 'いいね！';
        characters[1].classList.add('active');
    } else {
        resultClass('-serif').innerHTML = 'うん。';
        characters[0].classList.add('active');
    }

    resultClass('-wrap').classList.add('active');
    setTimeout(() => {
        resultClass('-container').classList.add('active');

        resultClass('-return').addEventListener(() => {
            // とりあえずリロードとしているが、もっといい方法があったらそれを採用
            location.reload();
        })
    }, 500);
}

const init = () => {
    nextWord();

    // キーボードイベント受け付け
    document.onkeydown = keyDown;
    document.onkeyup = keyUp;
}

const nextWord = () => {
    charIndex = 0;
    insertTextJa = '';
    insertTextEn = '';
    let random = Math.floor(Math.random() * mondai[1].length);

    // 英字の問題一文字一文字を配列形式でwordCharsに格納
    wordCharsJa = mondai[0][random].split('');
    wordCharsEn = mondai[1][random].split('');
    for(let i = 0; i < wordCharsJa.length; i++) {
        insertTextJa += wordCharsJa[i];
    }
    for(let i = 0; i < wordCharsEn.length; i++) {
        // 文字を打ち終わったら薄くなるようにidを付与
        insertTextEn += "<span id=\"word" + i + "\">" + wordCharsEn[i] + "</span>";
    }
    typeText.innerHTML = insertTextJa;
    typeTextGuide.innerHTML = insertTextEn;
}

const keyDown = (event => {
    event.preventDefault();

    let keycode = event.keyCode;
    let keyBtn = document.querySelector('.key' + keycode);
    let keyStr = event.key;

    keyBtn.classList.add('down');

    isPressedKey[keycode] = true;

    // ?か~の時はshiftkeyを押しながらで無ければ通らないようにする
    if(wordCharsEn[charIndex] == "?" || wordCharsEn[charIndex] == "~"　|| wordCharsEn[charIndex].match(/[A-Z]{1}/)) {
        // 下記がevent.shiftKeyでないのはシフトキーを押しながら他の
        // 文字を打った時にその文字までtrueになってしまうため
        if(keycode === shiftkeyCode) {
            isPressedShiftKey = true;
            keyBtn.classList.add('collect');
            return;
        }
        if(wordCharsEn[charIndex] === keyStr && isPressedShiftKey) {
            // keyBtnはこの関数内でletで指定されたローカルな変数のため
            // 外の関数で使うことができない
            keyBtn.classList.add('collect');
            correctFunc();
            if(charIndex === wordCharsEn.length) {
                init()
            }
        } else {
            keyBtn.classList.add('uncollect');
            uncorrectFunc();
        }
    } else {
        if(wordCharsEn[charIndex] === keyStr && !isPressedShiftKey) {
            keyBtn.classList.add('collect');
            correctFunc();
            if(charIndex === wordCharsEn.length) {
                init();
                countClearWords++;
            }
        } else {
            keyBtn.classList.add('uncollect');
            uncorrectFunc();
        }
    }
})

const keyUp = (event => {
    let keycode = event.keyCode;
    let keyBtn = document.querySelector('.key' + keycode);

    // isPressedShiftKeyを解除
    // 厳密にシフトキーがkeyupイベントを発したときに処理を
    // 行いたいため下記の方法で検証を行う
    if(keycode === shiftkeyCode) {
        keyBtn.classList.remove('down');
        isPressedShiftKey = false;
        if(keyBtn.classList.contains('collect')){
            keyBtn.classList.remove('collect');
        } else {
            keyBtn.classList.remove('uncollect');
        }
    } else if(isPressedKey[keycode]) {
        isPressedKey[keycode] = false;
        keyBtn.classList.remove('down');
        if(keyBtn.classList.contains('collect')){
            keyBtn.classList.remove('collect');
        } else {
            keyBtn.classList.remove('uncollect');
        }
    }
})

const correctFunc = () => {
    // 問題文に対しての処理
    document.querySelector('#word' + charIndex).classList.add('clear');
    charIndex++;

    // 正しく打った数を追加
    countCorrect++;
}
const uncorrectFunc = () => {
    countUncorrect++;
}