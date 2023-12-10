// Найдем все необходимые элементы на странице
const canvas = document.querySelector(".canvas");
const ctx = canvas.getContext("2d");
const inputFile = document.querySelector("#input_file");
const saveFile = document.querySelector(".save");
const fontSetting = document.querySelector(".font-setting");
const select = document.querySelector("select");
const color = document.querySelector("#color");
const fontSize = document.querySelector("#font_size");
const textarea = document.querySelector("#textarea");
const addStyleBtn = document.querySelector(".add-style");
const removeBtn = document.querySelector(".remove");

// Так как текстов у нас может быть несколько - будет сохранять каждый их них как объект и добавлять в массив
let textArr = [];
let canvasImage;
let selectedTextElement;
let id = 0;

// При нажатии на кнопку "добавить" отобразим текст
addStyleBtn.addEventListener("click", () => applyStyles());

// При нажатии на кнопку удалить - удалим выбранный текстовый элемент
removeBtn.addEventListener("click", () => {
  if (selectedTextElement) {
    textArr.splice(textArr.indexOf(selectedTextElement), 1);
    selectedTextElement = null;
    removeBtn.style.display = "none";
    renderImage();
  }
});

// Функция по очистке полей
const clearForm = () => {
  select.value = "normal";
  color.value = "black";
  fontSize.value = 16;
  textarea.value = "";
};

// Функция по применению стилей к тексту
const applyStyles = () => {
  // Добавим сообщение, в случае если текстовое поле пустое
  if (!textarea.value) {
    alert("Введите текст в поле ввода");
  }
  // Добавляем текстовый элемент в массив
  textArr.push({
    id: id,
    font: select.value,
    size: fontSize.value,
    color: color.value,
    text: textarea.value.trim(),
    x: 180,
    y: 50,
  });
  id += 1;

  clearForm();
  renderImage();
};

// Отображение загруженной картинки
inputFile.addEventListener("change", (event) => {
  const reader = new FileReader();
  const file = event.target.files[0];

  textArr = [];

  reader.onload = (event) => {
    const image = new Image();

    image.src = event.target.result;

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      canvasImage = image;
      fontSetting.style.display = "flex";
    };
  };

  reader.readAsDataURL(file);
  saveFile.style.display = "block";
});

// При нажатии на кнопку "сохранить" выполняем действия по сохранению картинки на локальный компьютер
saveFile.addEventListener("click", () => {
  const anchor = document.createElement("a");

  anchor.href = canvas.toDataURL();
  anchor.download = "meme.jpeg";

  return anchor.click();
});

// Функция по отрисовке, которую мы вызываем при изменениях
const renderImage = () => {
  const image = new Image();

  image.src = canvasImage.src;
  image.onload = function () {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    // Отрисовываем каждый текст
    textArr.forEach((text) => {
      ctx.fillStyle = text.color;
      ctx.font = `${text.font} ${text.size}px Arial`;
      ctx.fillText(text.text, text.x, text.y);

      // Отрисовываем рамку, если есть выделенный текст
      if (selectedTextElement?.id === text.id) {
        let width = ctx.measureText(text.text).width;
        let height = text.size;

        ctx.strokeRect(text.x, text.y - height, width, height);
      }
    });
  };
};

// Реализация изменения положения текста
let isDragging = false;
let dragStartX, dragStartY;

// Функция для определения текущего положения курсора
const getMouseXY = (canvas, event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
};

// Отслеживание клика по элементу
canvas.addEventListener("mousedown", (event) => {
  const mousePosition = getMouseXY(canvas, event);
  selectedTextElement = null;
  removeBtn.style.display = "none";

  // Проходим по каждому тексту и проверяем, попали ли мы в его границы.
  // Если да, то помечаем текст как перетаскиваемый
  textArr.forEach((text) => {
    const textWidth = ctx.measureText(text.text).width;
    const textHeight = text.size;
    if (
      mousePosition.x >= text.x &&
      mousePosition.x <= text.x + textWidth &&
      mousePosition.y >= text.y - textHeight &&
      mousePosition.y <= text.y
    ) {
      isDragging = true;
      dragStartX = mousePosition.x;
      dragStartY = mousePosition.y;
      selectedTextElement = text;
      removeBtn.style.display = "block";
    }
  });
  renderImage();
});

// Отслеживание движения элемента
canvas.addEventListener("mousemove", (event) => {
  if (isDragging) {
    const mousePosition = getMouseXY(canvas, event);
    const deltaX = mousePosition.x - dragStartX;
    const deltaY = mousePosition.y - dragStartY;

    selectedTextElement.x += deltaX;
    selectedTextElement.y += deltaY;
    dragStartX = mousePosition.x;
    dragStartY = mousePosition.y;

    // При каждом перемещении перерисовываем картинку,
    // чтобы показывать актуальное расположение элементов на холсте
    renderImage();
  }
});

// Отслеживание удаления фокуса с элемента
canvas.addEventListener("mouseup", () => {
  isDragging = false;
});
