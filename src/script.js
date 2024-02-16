const iBox = document.querySelector("#input-box");
const button = document.querySelector("#submit-button");
const overlay = document.querySelector(".overlay");
const lContainer = document.querySelector(".list-container");

let lon;
let lat;
let current = -1;
let currentValue = iBox.value;
let highlight = false;

tempApi();

window.addEventListener("click", clearList);
button.addEventListener("click", tempApi);
overlay.addEventListener("click", errorHandle);

iBox.addEventListener("keyup", handleInput);
iBox.addEventListener("keydown", handleKeyDown);

async function tempApi() {
  clearList();
  let apiTemp;
  let locationName = iBox.value.trim();
  
  if (lon && lat) {
    apiTemp = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=dc612cf83bb00944b4d4c08dbe31c731&units=metric`;
  } else if (locationName) {
    apiTemp = `https://api.openweathermap.org/data/2.5/weather?q=${locationName}&appid=dc612cf83bb00944b4d4c08dbe31c731&units=metric`;
  } else {
    return; // No location provided
  }
  
  try {
    const response = await fetch(apiTemp);
    const data = await response.json();
    updateWeatherInfo(data);
  } catch (e) {
    errorHandle();
    console.log("Error while fetching data", e);
  }
}

async function locApi() {
  let locationName = iBox.value.trim();
  
  if (!locationName) return;
  
  let apiLoc = `http://api.openweathermap.org/geo/1.0/direct?q=${locationName}&limit=5&appid=dc612cf83bb00944b4d4c08dbe31c731&units=metric`;
  
  try {
    const response = await fetch(apiLoc);
    const data = await response.json();
    createList(data);
  } catch (e) {
    console.log("Error while fetching data", e);
  }
}

function handleInput() {
  const inputValue = iBox.value.trim();
  if (inputValue !== currentValue) {
    currentValue = inputValue;
    if (inputValue) {
      locApi();
    } else {
      clearList();
    }
  }
}


function handleKeyDown(e) {
  let buttons = document.querySelectorAll(".input-list-button");
  if (buttons.length === 0) return;

  if (e.key === "Enter") {
    e.preventDefault();
    if (!highlight) {
      tempApi();
    } else {
      selectListItem(buttons[current]);
    }
  } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    highlightListItem(e.key);
  }
}

function highlightListItem(key) {
  let buttons = document.querySelectorAll(".input-list-button");
  buttons.forEach((button) => button.classList.remove("button-hover"));

  if (key === "ArrowDown") {
    current = (current + 1) % buttons.length;
  } else if (key === "ArrowUp") {
    current = (current - 1 + buttons.length) % buttons.length;
  }

  buttons[current].classList.add("button-hover");
  highlight = true;
}


function createList(data) {
  clearList();
  lon = null;
  lat = null;
  
  let list = document.createElement("ul");
  let locations = data;
  locations.forEach((location) => {
    let item = document.createElement("li");
    let button = document.createElement("button");

    button.classList.add("input-list-button");
    button.innerHTML = `${location.country}, ${
      location.state && location.state != location.name
        ? location.state + ","
        : ""
    } ${location.name}`;
    button.dataset.lon = location.lon;
    button.dataset.lat = location.lat;
    button.addEventListener("click", () => {
      selectListItem(button);
    });

    item.appendChild(button);
    list.appendChild(item);
  });
  lContainer.appendChild(list);
}

function clearList() {
  while (lContainer.firstChild) {
    lContainer.removeChild(lContainer.firstChild);
  }
  current = -1;
  highlight = false;
}

function selectListItem(item) {
  lon = item.dataset.lon;
  lat = item.dataset.lat;
  iBox.value = item.innerHTML;
  clearList();
  tempApi();
}

function updateWeatherInfo(data) {
  let locText = document.querySelector("#current-location");
  let tempText = document.querySelector("#current-temp");
  let humidity = document.querySelector("#humidity");
  let conditionText = document.querySelector("#condition-text");
  let conditionImage = document.querySelector('#condition-image');

  locText.textContent = data.name;
  tempText.textContent = `${data.main.temp} °C`;
  conditionText.textContent = data.weather[0].main;
  conditionImage.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
}

function errorHandle() {
  overlay.style.display = overlay.style.display === "none" ? "block" : "none";
}
