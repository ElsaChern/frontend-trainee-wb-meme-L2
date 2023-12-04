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

// При нажатии на кнопку "добавить" отобразим текст
addStyleBtn.addEventListener("click", () => applyStyles());

removeBtn.addEventListener("click", () => {
  if (selectedTextElement) {
    textArr.splice(textArr.indexOf(selectedTextElement), 1);
    selectedTextElement = null;
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
  } else {
    removeBtn.style.display = "block";
  }
  // При добавлении текста надо очищать поле ввода и убирать лишние пробелы (trim)
  textArr.push({
    id: textArr.length,
    font: select.value,
    size: fontSize.value,
    color: color.value,
    text: textarea.value,
    x: 180,
    y: 50,
  });

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

saveFile.addEventListener("click", () => {
  const anchor = document.createElement("a");

  anchor.href = canvas.toDataURL();
  anchor.download = "meme.jpeg";

  return anchor.click();
});

const renderImage = () => {
  const image = new Image();

  image.src = canvasImage.src;
  image.onload = function () {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    textArr.forEach((text) => {
      ctx.fillStyle = text.color;
      ctx.font = `${text.font} ${text.size}px Arial`;
      ctx.fillText(text.text, text.x, text.y);
    });

    if (selectedTextElement) {
      let width = ctx.measureText(selectedTextElement.text).width;
      let height = selectedTextElement.size;

      ctx.strokeRect(
        selectedTextElement.x,
        selectedTextElement.y - height,
        width,
        height,
      );
    }
  };
};

// Реализация изменения положения текста
let isDragging = false;
let dragStartX, dragStartY;

const getMouseXY = (canvas, event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
};

canvas.addEventListener("mousedown", (event) => {
  const mousePosition = getMouseXY(canvas, event);
  selectedTextElement = null;

  textArr.forEach((text) => {
    const textWidth = ctx.measureText(text.text).width;
    const textHeight = Number(text.size);

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
    }
  });
  renderImage();
});

canvas.addEventListener("mousemove", (event) => {
  if (isDragging) {
    const mousePosition = getMouseXY(canvas, event);
    const deltaX = mousePosition.x - dragStartX;
    const deltaY = mousePosition.y - dragStartY;

    selectedTextElement.x += deltaX;
    selectedTextElement.y += deltaY;
    dragStartX = mousePosition.x;
    dragStartY = mousePosition.y;

    renderImage();
  }
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});
