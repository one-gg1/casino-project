const tg = window.Telegram.WebApp;
tg.expand();

let userBalance = 1250;
let currentProb = 35;

// --- UTILS ---
function updateBalanceUI() {
    document.getElementById('user-balance-top').innerText = userBalance.toLocaleString();
    document.getElementById('user-balance-wallet').innerText = userBalance.toLocaleString() + ' ⭐';
}

function restartBot() {
    tg.HapticFeedback.notificationOccurred('warning');
    window.location.reload();
}

function switchTab(tabId) {
    tg.HapticFeedback.impactOccurred('medium');
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${tabId}`).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if(item.innerText.toLowerCase().includes(tabId)) item.classList.add('active');
    });
}

// --- CASE SYSTEM ---
const ITEMS = [
    { name: 'Star', icon: '⭐', rarity: 'common', chance: 70 },
    { name: 'Diamond', icon: '💎', rarity: 'rare', chance: 25 },
    { name: 'Crown', icon: '👑', rarity: 'legendary', chance: 5 }
];

function openCase(caseData) {
    if (userBalance < caseData.price) {
        tg.showAlert("Not enough stars!");
        return;
    }
    
    userBalance -= caseData.price;
    updateBalanceUI();
    switchTab('case-open');
    
    const track = document.getElementById('roulette-track');
    document.getElementById('opening-case-name').innerText = caseData.name;
    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';
    track.innerHTML = '';

    // Генеруємо 50 елементів для прокрутки
    const totalItems = 50;
    for(let i = 0; i < totalItems; i++) {
        const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        const el = document.createElement('div');
        el.className = `roulette-item ${item.rarity}`;
        el.innerHTML = `<span class="icon">${item.icon}</span>`;
        track.appendChild(el);
    }

    // Запуск анімації через мікро-таймаут
    setTimeout(() => {
        const itemWidth = 100; // 90px + 10px margin
        const winIndex = 45; // Передостанні елементи
        const finalOffset = (winIndex * itemWidth) - (Math.random() * 80);
        
        track.style.transition = 'transform 5s cubic-bezier(0.15, 0, 0.15, 1)';
        track.style.transform = `translateX(-${finalOffset}px)`;
        
        tg.HapticFeedback.impactOccurred('heavy');

        setTimeout(() => {
            tg.HapticFeedback.notificationOccurred('success');
            tg.showAlert("Congratulations! You won a prize!");
        }, 5100);
    }, 50);
}

// --- RISK WHEEL ---
function updateOdds(val) {
    currentProb = val;
    tg.HapticFeedback.selectionChanged();
    const wheel = document.getElementById('visual-wheel');
    const color = val === 35 ? '#ffcf40' : (val === 50 ? '#00d2ff' : '#ff007a');
    wheel.style.background = `conic-gradient(${color} 0% ${val}%, #121214 ${val}% 100%)`;
    
    document.querySelectorAll('.odds-tab').forEach(t => {
        t.classList.remove('active');
        if(t.innerText.includes(val)) t.classList.add('active');
    });
}

function playRiskWheel() {
    const bet = parseFloat(document.getElementById('bet-input').value);
    if(!bet || bet <= 0) return tg.showAlert("Enter bet!");

    const wheel = document.getElementById('visual-wheel');
    const spin = 2000 + Math.random() * 2000;
    wheel.style.transform = `rotate(${spin}deg)`;

    setTimeout(() => {
        const win = Math.random() * 100 < currentProb;
        if(win) {
            userBalance += (bet * (100 / currentProb));
            tg.HapticFeedback.notificationOccurred('success');
            tg.showAlert("WINNER!");
        } else {
            userBalance -= bet;
            tg.HapticFeedback.notificationOccurred('error');
            tg.showAlert("LOSE!");
        }
        updateBalanceUI();
        wheel.style.transform = 'rotate(0deg)';
    }, 4000);
}

function setMaxBet() {
    document.getElementById('bet-input').value = userBalance;
}

// --- INITIALIZE ---
function openModal(id) { document.getElementById(`modal-${id}`).classList.add('active'); }
function closeModal(id) { document.getElementById(`modal-${id}`).classList.remove('active'); }

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('cases-grid');
    const CASES = [
        { name: 'Starter Box', icon: '📦', price: 20 },
        { name: 'Neon Case', icon: '💎', price: 100 },
        { name: 'Star Jack', icon: '🎰', price: 500 },
        { name: 'Royal Vault', icon: '👑', price: 2000 }
    ];

    CASES.forEach(c => {
        const card = document.createElement('div');
        card.className = 'case-card';
        card.innerHTML = `<span class="icon">${c.icon}</span><h4>${c.name}</h4><span class="price">${c.price} ⭐</span>`;
        card.onclick = () => openCase(c);
        grid.appendChild(card);
    });
});