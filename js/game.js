// Основные константы
// Константы сетки и размера тайла
let GRID_WIDTH = 30;   // Ширина сетки в тайлах
let GRID_HEIGHT = 30;  // Высота сетки в тайлах
const TILE_SIZE = 20;    // Базовый размер тайла в пикселях

let GAME_SPEED = 150; // мс
const SIZE = 0;

// Игровые элементы
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Состояние игры
let snake = [{x: 0, y: 0}];
let food = [{x: 0, y: 0}];
let direction = 'RIGHT';
let olddirection = direction;
let nextDirection = [];
let score = 0;
let gameRunning = true;
let oldgridCanvas = null;
let foodvalue = 1;
let foodcount = 1;

let touchStartX = 0;
let touchStartY = 0;

// Инициализация игры
function initGame() {
    // Установка размеров canvas
    GRID_WIDTH = Number(document.getElementById('size-width-setting').value);
    GRID_HEIGHT = Number(document.getElementById('size-height-setting').value);
    GAME_SPEED = Number(document.getElementById('speed-game-setting').value);
    foodvalue = Number(document.getElementById('valueeat-food-setting').value);
    foodcount = Number(document.getElementById('value-food-setting').value);

    canvas.width = GRID_WIDTH * TILE_SIZE;
    canvas.height = GRID_HEIGHT * TILE_SIZE;
	
	canvas.addEventListener('touchstart', handleTouchStart, {passive: false});
	canvas.addEventListener('touchmove', handleTouchMove, {passive: false});
    
    // Запуск игрового цикла
	resetGame();
	spawnFood();
    gameLoop();
}

// Главный игровой цикл
function gameLoop() {
    if (!gameRunning) return;
	
	//canvas.width = GRID_WIDTH * TILE_SIZE;
	//canvas.height = GRID_HEIGHT * TILE_SIZE;
	
	updateGame();
	drawGame();
    
    setTimeout(gameLoop, GAME_SPEED);
}

// Обновление игрового состояния
function updateGame() {
	// Обновление направления из буфера
	if (nextDirection.length > 0) {
		olddirection = direction;
	    direction = nextDirection.shift(); // Берем первое направление из буфера
		if (
					(olddirection === 'DOWN' && direction === 'UP') ||
					(olddirection === 'UP' && direction === 'DOWN') ||
					(olddirection === 'RIGHT' && direction === 'LEFT') ||
					(olddirection === 'LEFT' && direction === 'RIGHT')
			)
			direction = olddirection;
	}
    
    // Движение змейки
    const head = {...snake[0]};
    
    switch(direction) {
        case 'UP': head.y--; break;
        case 'DOWN': head.y++; break;
        case 'LEFT': head.x--; break;
        case 'RIGHT': head.x++; break;
    }
    
    // Проверка столкновений
    if (head.x < 0 || head.x >= GRID_WIDTH || 
        head.y < 0 || head.y >= GRID_HEIGHT ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    // Добавление новой головы
    snake.unshift(head);
    
    // Проверка съедения еды
    for(let i = 0; i < food.length; i++)
    if (head.x === food[i].x && head.y === food[i].y) {
        score += foodvalue;
        scoreElement.textContent = `Счет: ${score}`;
        food.splice(i, 1);
        spawnFood(1);
    } 
    else if(snake.length - 3 > score)
    {
        snake.pop();
    } 
}

// Отрисовка игры
function drawGame() {
    // Очистка холста
    ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	if (!oldgridCanvas || oldgridCanvas.width !== canvas.width || oldgridCanvas.height !== canvas.height) {
		oldgridCanvas = oldgridCanvas;
	    drawGrid();
	}
	
    // Отрисовка змейки
    ctx.fillStyle = '#4CAF50';
    snake.forEach(segment => {
        ctx.fillRect(
            segment.x * TILE_SIZE, 
            segment.y * TILE_SIZE, 
            TILE_SIZE - 1, 
            TILE_SIZE - 1
        );
    });
	ctx.fillStyle = '#6CFF70';
	ctx.fillRect(
	    snake[0].x * TILE_SIZE, 
	    snake[0].y * TILE_SIZE, 
	    TILE_SIZE - 1, 
	    TILE_SIZE - 1
	);
    
    // Отрисовка еды
    ctx.fillStyle = '#F44336';
    for(let i = 0; i < food.length; i++)
    {
        ctx.beginPath();
        ctx.arc(
            food[i].x * TILE_SIZE + TILE_SIZE/2,
            food[i].y * TILE_SIZE + TILE_SIZE/2,
            TILE_SIZE/2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

function drawGrid() {
    ctx.save(); // Сохраняем текущие настройки контекста
    ctx.strokeStyle = 'rgba(50, 50, 50, 1)'; // Полупрозрачные серые линии
    ctx.lineWidth = 1;
    
    // Вертикальные линии
    for (let x = 0; x <= GRID_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * TILE_SIZE, 0);
        ctx.lineTo(x * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
        ctx.stroke();
    }
    
    // Горизонтальные линии
    for (let y = 0; y <= GRID_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * TILE_SIZE);
        ctx.lineTo(GRID_WIDTH * TILE_SIZE, y * TILE_SIZE);
        ctx.stroke();
    }
    
    ctx.restore(); // Восстанавливаем настройки контекста
}

// Генерация еды
function spawnFood(countfood) {
    const availablePositions = [];
    
    // Сбор всех свободных позиций
    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            if (!snake.some(s => s.x === x && s.y === y) && !food.some(s => s.x === x && s.y === y)) {
                availablePositions.push({x, y});
            }
        }
    }
    
    // Выбор случайной позиции
    for(let i = 0; i < countfood; i++)
    if (availablePositions.length > 0) {
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        food.push(availablePositions[randomIndex]);
    }
}

// Обработка окончания игры
function gameOver() {
    gameRunning = false;
    alert(`Игра окончена! Ваш счет: ${score}`);
    
    // Рестарт игры
    divGame.classList.remove('active'); // Убираем активное состояние у игры
	divMenu.classList.add('active'); // Добавляем активное состояние меню
}

// Сброс игры
function resetGame() {
    snake = [{x: 0, y: Math.floor(GRID_HEIGHT / 2)}];
    direction = 'RIGHT';
	olddirection = direction;
    nextDirection = [];
    score = 0;
    scoreElement.textContent = `Счет: ${score}`;
    gameRunning = true;
    spawnFood(foodcount - 1);
	
	// Инициализация змейки (добавляем 2 сегмента)
	const head = {...snake[0]};
}

// Обработка клавиатуры
document.addEventListener('keydown', e => {
	if(nextDirection.length < 2)
    switch(e.key) {
        case 'ArrowUp':
            nextDirection.push('UP');
            break;
        case 'ArrowDown':
            nextDirection.push('DOWN');
            break;
        case 'ArrowLeft':
            nextDirection.push('LEFT');
            break;
        case 'ArrowRight':
            nextDirection.push('RIGHT');
            break;
    }
});

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    
	if(nextDirection.length < 2)
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && direction !== 'LEFT') nextDirection.push('RIGHT');
        else if (dx < 0 && direction !== 'RIGHT') nextDirection.push('LEFT');
    } else {
        if (dy > 0 && direction !== 'UP') nextDirection.push('DOWN');
        else if (dy < 0 && direction !== 'DOWN') nextDirection.push('UP');
    }
    
    touchStartX = touchEndX;
    touchStartY = touchEndY;
    e.preventDefault();
}

// Запуск игры при загрузке страницы
//window.addEventListener('load', initGame);