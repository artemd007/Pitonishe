const divMenu = document.getElementById('main-menu');
const divGame = document.getElementById('game-container');

// Инициализация
function initMain() {
	divGame.classList.remove('active'); // Убираем активное состояние у игры
	divMenu.classList.add('active'); // Добавляем активное состояние меню
	initEventList();
}

function initEventList() {
	document.getElementById('play-btn').addEventListener('click', () => {
		divMenu.classList.remove('active');
		divGame.classList.add('active');
		initGame();
	});
}

// Запуск игры при загрузке страницы
window.addEventListener('load', initMain);