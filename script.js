// ===== CONFIGURATION =====
const API_KEY = "02ae1c365b9b93e4e265fb3ee1a58e76";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// ===== DOM ELEMENTS =====
const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const messageEl = document.getElementById("message");
const weatherCard = document.getElementById("weatherCard");

const cityNameEl = document.getElementById("cityName");
const weatherIconEl = document.getElementById("weatherIcon");
const temperatureEl = document.getElementById("temperature");
const descriptionEl = document.getElementById("description");
const extraDetailsEl = document.getElementById("extraDetails");
const tagsEl = document.getElementById("tags");

// ===== EVENT LISTENER FOR THE FORM =====
weatherForm.addEventListener("submit", function (event) {
  event.preventDefault(); // prevent form from reloading the page

  const city = cityInput.value.trim();
  if (!city) {
    showMessage("Please enter a city name.");
    return;
  }

  // Call the API when the user submits a city
  fetchWeatherForCity(city);
});

// ===== FUNCTION: Display messages (errors, loading) =====
function showMessage(text, isError = true) {
  messageEl.textContent = text;
  messageEl.style.color = isError ? "#b22222" : "#006400";
}

// ===== MAIN FUNCTION: FETCH WEATHER DATA FROM API =====
async function fetchWeatherForCity(city) {
  // Show a loading message
  showMessage("Loading weather data...", false);

  // Build the URL with query parameters
  const url = `${BASE_URL}?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=metric`;

  try {
    const response = await fetch(url);

    // If the response is not OK (e.g. city not found), handle the error
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("City not found. Please check the spelling.");
      } else if (response.status === 401) {
        throw new Error(
          "Unauthorized. Please check that your API key is correct."
        );
      } else {
        throw new Error("Error fetching data. Status: " + response.status);
      }
    }

    // Parse JSON from the response
    const data = await response.json();

    // Show data on the page
    displayWeather(data);

    // Clear any previous error message
    showMessage("Weather data loaded successfully.", false);
  } catch (error) {
    // Handle network errors or thrown errors
    showMessage(error.message || "An unexpected error occurred.");
    weatherCard.style.display = "none";
  }
}

// ===== FUNCTION: UPDATE THE UI WITH API DATA =====
function displayWeather(data) {

  // Basic fields from the JSON response
  const cityName = data.name;
  const country = data.sys?.country;
  const temp = data.main?.temp;
  const feelsLike = data.main?.feels_like;
  const tempMin = data.main?.temp_min;
  const tempMax = data.main?.temp_max;
  const humidity = data.main?.humidity;
  const windSpeed = data.wind?.speed;
  const weatherMain = data.weather?.[0]?.main;
  const weatherDescription = data.weather?.[0]?.description;
  const iconCode = data.weather?.[0]?.icon;

  // Update UI
  cityNameEl.textContent = country ? `${cityName}, ${country}` : cityName;
  temperatureEl.textContent = `${Math.round(temp)}°C`;
  descriptionEl.textContent = capitalizeFirstLetter(weatherDescription);

  extraDetailsEl.innerHTML = `
    <strong>Feels like:</strong> ${Math.round(feelsLike)}°C<br/>
    <strong>Min / Max:</strong> ${Math.round(tempMin)}°C / ${Math.round(
    tempMax
  )}°C<br/>
    <strong>Humidity:</strong> ${humidity}%<br/>
    <strong>Wind speed:</strong> ${windSpeed} m/s
  `;

  // Weather icon from OpenWeather
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherIconEl.src = iconUrl;
  weatherIconEl.alt = weatherMain || "Weather icon";

  // Create some "tags" to do something interesting with the data
  tagsEl.innerHTML = "";
  const tags = [];

  if (temp <= 0) {
    tags.push("Freezing");
  } else if (temp < 10) {
    tags.push("Cold");
  } else if (temp < 20) {
    tags.push("Cool");
  } else if (temp < 30) {
    tags.push("Comfortable");
  } else {
    tags.push("Hot");
  }

  if (humidity >= 80) {
    tags.push("Very Humid");
  }

  if (weatherMain) {
    tags.push(weatherMain);
  }

  tags.forEach((tagText) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = tagText;
    tagsEl.appendChild(span);
  });

  // Show the weather card
  weatherCard.style.display = "block";
}

// ===== HELPER: Capitalize first letter of a sentence =====
function capitalizeFirstLetter(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Pre-load weather for a default city
fetchWeatherForCity("Toronto");