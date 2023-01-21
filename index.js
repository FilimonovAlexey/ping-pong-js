// Обращаемся к игровому полю из документа
const canvas = document.getElementById('game');
// Делаем поле двухмерным
const context = canvas.getContext('2d');
// Размер игровой клетки
const grid = 15;
// Высота платформы
const paddleHeight = grid * 5; // 80
// Задаём максимальное расстояние, на которое могут двигаться платформы
const LeftmaxPaddleY = canvas.height - grid - paddleHeight * 2;
const RightmaxPaddleY = canvas.height - grid - paddleHeight;
// Скорость платформы
var paddleSpeed = 6;
// Скорость мяча
var ballSpeed = 4;
// Рекорд
var record = 0;
// Набранные очки
var count = 0;
// активация секретного уровня
var secret = false;
// число отбиваний в секретном режиме
var secret_count = 0;
// цвет мяча, на старте — белый
ballColor = '#ffffff';
// Узнаём размер хранилища
var Storage_size = localStorage.length;
// Если в хранилище что-то есть…
if (Storage_size > 0) {
  // Достаём оттуда текущее значение рекорда
  record = localStorage.getItem('record');
  // Если там ничего нет —
} else {
  // Делаем новую запись и кладём туда ноль — рекорда пока нет
  localStorage.setItem('record', 0);
}
// Описываем левую платформу
const leftPaddle = {
  // Ставим её по центру
  x: grid * 2,
  y: canvas.height / 2 - paddleHeight / 2,
  // Ширина — одна клетка
  width: grid,
  // Высоту берём из константы
  height: paddleHeight * 2,
  // Платформа на старте никуда не движется
  dy: 0
};
// Описываем правую платформу
const rightPaddle = {
  // Ставим по центру с правой стороны
  x: canvas.width - grid * 3,
  y: canvas.height / 2 - paddleHeight / 2,
  // Задаём такую же ширину и высоту
  width: grid,
  height: paddleHeight,
  // Правая платформа тоже пока никуда не двигается
  dy: 0
};
// Описываем мячик
const ball = {
  // Он появляется в самом центре поля
  x: canvas.width / 2,
  y: canvas.height / 2,
  // квадратный, размером с клетку
  width: grid,
  height: grid,
  // На старте мяч пока не забит, поэтому убираем признак того, что мяч нужно ввести в игру заново
  resetting: false,
  // Подаём мяч в правый верхний угол
  dx: ballSpeed,
  dy: -ballSpeed
};
// Проверка на то, пересекаются два объекта с известными координатами или нет
// Подробнее тут: https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function collides(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y;
}
// Главный цикл игры
function loop() {
  // Очищаем игровое поле
  requestAnimationFrame(loop);
  context.clearRect(0, 0, canvas.width, canvas.height);
  // Если платформы на предыдущем шаге куда-то двигались — пусть продолжают двигаться
  leftPaddle.y += leftPaddle.dy;
  rightPaddle.y += rightPaddle.dy;
  // Если левая платформа пытается вылезти за игровое поле вниз,
  if (leftPaddle.y < grid) {
    // то оставляем её на месте
    leftPaddle.y = grid;
  }
  // Проверяем то же самое сверху
  else if (leftPaddle.y > LeftmaxPaddleY) {
    leftPaddle.y = LeftmaxPaddleY;
  }
  // Если правая платформа пытается вылезти за игровое поле вниз,
  if (rightPaddle.y < grid) {
    // то оставляем её на месте
    rightPaddle.y = grid;
  }
  // Проверяем то же самое сверху
  else if (rightPaddle.y > RightmaxPaddleY) {
    rightPaddle.y = RightmaxPaddleY;
  }
  // Рисуем платформы белым цветом
  context.fillStyle = 'white';
  // Каждая платформа — прямоугольник
  context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);
  // Если мяч на предыдущем шаге куда-то двигался — пусть продолжает двигаться
  ball.x += ball.dx;
  ball.y += ball.dy;
  // пусть платформа движется точно так же, как и мяч
  leftPaddle.dy = ball.dy;
  // Если мяч касается стены снизу — меняем направление по оси У на противоположное
  if (ball.y < grid) {
    ball.y = grid;
    ball.dy *= -1;
  }
  // Делаем то же самое, если мяч касается стены сверху
  else if (ball.y + grid > canvas.height - grid) {
    ball.y = canvas.height - grid * 2;
    ball.dy *= -1;
  }
  // Если мяч улетел за игровое поле влево или вправо — перезапускаем его
  if ((ball.x < 0 || ball.x > canvas.width) && !ball.resetting) {
    // Помечаем, что мяч перезапущен, чтобы не зациклиться
    ball.resetting = true;
    // Если игрок набрал больше рекорда — записываем это как новый рекорд
    if (count > record) { record = count };
    // Обнуляем количество очков у игрока
    count = 0;
    // Кладём значение рекорда в хранилище браузера
    localStorage.setItem('record', record);
    // Даём секунду на подготовку игрокам
    setTimeout(() => {
      // Всё, мяч в игре
      ball.resetting = false;
      // Снова запускаем его из центра
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
    }, 1000);
  }
  // Если мяч коснулся левой платформы,
  if (collides(ball, leftPaddle)) {
    // то отправляем его в обратном направлении
    ball.dx *= -1;
    // Увеличиваем координаты мяча на ширину платформы, чтобы не засчитался новый отскок
    ball.x = leftPaddle.x + leftPaddle.width;
  }
  // Проверяем и делаем то же самое для правой платформы
  else if (collides(ball, rightPaddle)) {
    ball.dx *= -1;
    ball.x = rightPaddle.x - ball.width;
    // считаем отскоки
    count += 1;
    // если набралось 10 — активируем секретный уровень
    if (count >= 10) { secret = true };
    // а вот и сам секретный уровень
    if (secret) {
      // увеличиваем новые отскоки
      secret_count += 1;
      // если это число делится на 3 без остатка…
      if (secret_count % 3 == 0) {
        // увеличиваем скорость мяча на единицу
        if (ball.dx > 0) { ball.dx += 1 } else { ball.dx -= 1 };
        if (ball.dy > 0) { ball.dy += 1 } else { ball.dy -= 1 };
        // красим мяч случайным образом
        ballColor = '#' + (Math.random().toString(16) + '000000').substring(2, 8).toUpperCase();
      }
    }
  }
  // Рисуем мяч нужным цветом
  context.fillStyle = ballColor;
  context.fillRect(ball.x, ball.y, ball.width, ball.height);
  // Рисуем стены
  context.fillStyle = 'lightgrey';
  context.fillRect(0, 0, canvas.width, grid);
  context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);
  // Рисуем сетку посередине
  for (let i = grid; i < canvas.height - grid; i += grid * 2) {
    context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
  }
  // Отслеживаем нажатия клавиш
  document.addEventListener('keydown', function (e) {
    // Если нажата клавиша вверх,
    if (e.which === 38) {
      // то двигаем правую платформу вверх
      rightPaddle.dy = -paddleSpeed;
    }
    // Если нажата клавиша вниз,
    else if (e.which === 40) {
      // то двигаем правую платформу вниз
      rightPaddle.dy = paddleSpeed;
    }
  });
  // А теперь следим за тем, когда кто-то отпустит клавишу, чтобы остановить движение платформы
  document.addEventListener('keyup', function (e) {
    // Если это стрелка вверх или вниз,
    if (e.which === 38 || e.which === 40) {
      // останавливаем правую платформу
      rightPaddle.dy = 0;
    }
  });
  // Цвет текста
  context.fillStyle = "#ff0000";
  // Задаём размер и шрифт
  context.font = "20pt Courier";
  // Сначала выводим рекорд
  context.fillText('Record: ' + record, 150, 550);
  // Затем — набранные очки
  context.fillText(count, 450, 550);
}
// Запускаем игру
requestAnimationFrame(loop);