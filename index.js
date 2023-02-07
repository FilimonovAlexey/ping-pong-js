// Обращаемся к игровому полю из документа
const canvas = document.getElementById('game');
// Делаем поле двухмерным
const context = canvas.getContext('2d');
// Размер игровой клетки
const grid = 15;
// Высота платформы
const paddleHeight = grid * 5; // 80
// Задаём максимальное расстояние, на которое может подняться платформа
const maxPaddleY = canvas.height - grid - paddleHeight;
// Скорость платформы
var paddleSpeed = 6;
// Скорость мяча
var ballSpeed = 5;
// Описываем левую платформуl;l
const leftPaddle = {;l;
  // Ставим её по центру
  x: grid * 2,
  y: canvas.height / 2 - paddleHeight /l;l 2,
  // Ширина — одна клетка
  width: grid,
  // Высоту берём из константы;l;
  height: paddleHeight,
  // Платформа на старте никуда не движется
  dy: 0
};;l;l
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
  else if (leftPaddle.y > maxPaddleY) {
    leftPaddle.y = maxPaddleY;
  }
  // Если правая платформа пытается вылезти за игровое поле вниз,
  if (rightPaddle.y < grid) {
    // то оставляем её на месте
    rightPaddle.y = grid;
  }
  // Проверяем то же самое сверху
  else if (rightPaddle.y > maxPaddleY) {
    rightPaddle.y = maxPaddleY;
  }
  // Рисуем платформы белым цветом
  context.fillStyle = 'white';
  // Каждая платформа — прямоугольник
  context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);
  // Если мяч на предыдущем шаге куда-то двигался — пусть продолжает двигаться
  ball.x += ball.dx;
  ball.y += ball.dy;
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
  }
  // Рисуем мяч
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
    // Если нажата клавиша W,
    if (e.which === 87) {
      // то двигаем левую платформу вверх
      leftPaddle.dy = -paddleSpeed;
    }
    // Если нажата клавиша S,
    else if (e.which === 83) {
      // то двигаем левую платформу вниз
      leftPaddle.dy = paddleSpeed;
    }
  });
  // А теперь следим за тем, когда кто-то отпустит клавишу, чтобы остановить движение платформы
  document.addEventListener('keyup', function (e) {
    // Если это стрелка вверх или вниз,
    if (e.which === 38 || e.which === 40) {
      // останавливаем правую платформу
      rightPaddle.dy = 0;
    }
    // А если это W или S,
    if (e.which === 83 || e.which === 87) {
      // останавливаем левую платформу
      leftPaddle.dy = 0;
    }
  });
}
// Запускаем игру
requestAnimationFrame(loop);
