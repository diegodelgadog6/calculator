let display = '0';
let previousValue = '';
let operation = '';
let shouldResetDisplay = false;
let history = [];

function loadHistory() {
    const saved = localStorage.getItem('calcHistory');
    if (saved) {
        history = JSON.parse(saved);
    }
    updateRecentHistory();
}

function saveHistory() {
    localStorage.setItem('calcHistory', JSON.stringify(history));
}

function handleClick(value) {
    if (/[0-9.]/.test(value)) {
        if (shouldResetDisplay) {
            display = String(value);
            shouldResetDisplay = false;
        } else {
            if (value === '.' && display.includes('.')) return;
            display = display === '0' ? String(value) : display + value;
        }
        updateDisplay();
    } else if (['+', '-', '*', '/', '%'].includes(value)) {
        if (previousValue === '' && display !== '') {
            previousValue = display;
            operation = value;
            shouldResetDisplay = true;
        } else if (previousValue !== '' && operation !== '' && display !== '') {
            const result = performCalculation(parseFloat(previousValue), parseFloat(display), operation);
            display = String(result);
            previousValue = String(result);
            operation = value;
            shouldResetDisplay = true;
            updateDisplay();
        }
    }
}

function deleteLast() {
    if (display.length > 1) {
        display = display.slice(0, -1);
    } else {
        display = '0';
    }
    updateDisplay();
}

function clearAll() {
    display = '0';
    previousValue = '';
    operation = '';
    shouldResetDisplay = false;
    updateDisplay();
}

function calculate() {
    if (operation && previousValue !== '' && display !== '') {
        const a = parseFloat(previousValue);
        const b = parseFloat(display);
        const expression = `${previousValue} ${getOperationSymbol(operation)} ${display}`;
        const result = performCalculation(a, b, operation);
        addToHistory(expression, result);
        display = String(result);
        previousValue = '';
        operation = '';
        shouldResetDisplay = true;
        updateDisplay();
    }
}

function performCalculation(a, b, op) {
    switch (op) {
        case '+':
            return a + b;
        case '-':
            return a - b;
        case '*':
            return a * b;
        case '/':
            return b !== 0 ? a / b : 0;
        case '%':
            return a % b;
        default:
            return b;
    }
}

function getOperationSymbol(op) {
    const symbols = {
        '+': '+',
        '-': '−',
        '*': '×',
        '/': '÷',
        '%': '%'
    };
    return symbols[op] || op;
}

function updateDisplay() {
    const resultDisplay = document.getElementById('result-display');
    const operationDisplay = document.getElementById('operation-display');
    const formatted = formatNumber(display);
    resultDisplay.textContent = formatted;
    if (operation && previousValue) {
        operationDisplay.textContent = `${formatNumber(previousValue)} ${getOperationSymbol(operation)}`;
    } else {
        operationDisplay.textContent = '';
    }
}

function formatNumber(num) {
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

function addToHistory(expression, result) {
    const now = new Date();
    const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    history.unshift({
        expression: expression,
        result: result,
        time: time,
        date: now.toLocaleDateString('es-ES')
    });
    if (history.length > 50) {
        history.pop();
    }
    saveHistory();
    updateHistoryDisplay();
    updateRecentHistory();
}

function updateRecentHistory() {
    const recentExpression = document.getElementById('recent-expression');
    const recentResult = document.getElementById('recent-result');
    if (!recentExpression || !recentResult) {
        return;
    }
    if (history.length === 0) {
        recentExpression.textContent = 'Sin operaciones';
        recentResult.textContent = '0';
        return;
    }
    recentExpression.textContent = history[0].expression;
    recentResult.textContent = formatNumber(String(history[0].result));
}

function updateHistoryDisplay() {
    const activityLog = document.getElementById('activity-log');
    if (!activityLog) {
        return;
    }
    activityLog.innerHTML = '';
    if (history.length === 0) {
        activityLog.innerHTML = '<p class="text-[#8d8d92] text-center py-10">No hay historial</p>';
        return;
    }
    let currentDate = '';
    history.forEach((item) => {
        if (item.date !== currentDate) {
            currentDate = item.date;
            const section = document.createElement('div');
            section.className = 'pt-2';
            let dateLabel = 'TODAY';
            const today = new Date().toLocaleDateString('es-ES');
            const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('es-ES');
            if (item.date === today) {
                dateLabel = 'TODAY';
            } else if (item.date === yesterday) {
                dateLabel = 'YESTERDAY';
            }
            const label = document.createElement('div');
            label.className = 'text-[#6d6d72] text-xs tracking-[0.16em] font-bold uppercase mb-3';
            label.textContent = dateLabel;
            section.appendChild(label);
            activityLog.appendChild(section);
        }
        const historyItem = document.createElement('div');
        historyItem.className = 'bg-[#111317] border border-[#23252a] rounded-[28px] p-6 min-h-[160px] flex items-end justify-between';
        historyItem.innerHTML = `
            <div class="self-start">
                <div class="text-[#6f7177] text-sm">${item.time}</div>
            </div>
            <div class="flex flex-col items-end gap-1">
                <div class="text-[#8f9096] text-[2rem] leading-none">${item.expression}</div>
                <div class="text-white text-[3.5rem] leading-none font-bold">${formatNumber(String(item.result))}</div>
            </div>
        `;
        activityLog.appendChild(historyItem);
    });
}

function clearHistory() {
    if (confirm('¿Estás seguro de que deseas borrar el historial?')) {
        history = [];
        localStorage.removeItem('calcHistory');
        updateHistoryDisplay();
        updateRecentHistory();
    }
}

function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.add('hidden');
        tab.classList.remove('active');
    });
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.classList.remove('nav-active');
        btn.classList.add('nav-inactive');
    });
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
        selectedTab.classList.add('active');
    }
    const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.remove('nav-inactive');
        activeBtn.classList.add('nav-active');
    }
    if (tabName === 'history') {
        updateHistoryDisplay();
    }
}

function toggleMenu() {
}

window.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    updateDisplay();
    updateHistoryDisplay();
    updateRecentHistory();
});



