const searchBarEle = document.querySelector('.search-bar');
const searchBtn = document.querySelector('.search-btn');
const mainSection = document.querySelector('.main-section');
const weatherLocationCard = document.querySelector('.weather-location-card');
const weatherAirConditionCard = document.querySelector('.weather-air-condition-card');
const weatherInfo = document.querySelector('.weather-info');
const forecastInfo = document.querySelector('.forecast-info');
const weatherContainer = document.querySelector('.weather-container');
const lightModeBtn = document.getElementById('light-mode-btn');
const darkModeBtn = document.getElementById('dark-mode-btn');
const faSun = document.querySelector('.fa-sun');
const faMoon = document.querySelector('.fa-moon');
const weatherMapCard = document.querySelector('.weather-map-card');

// Apply light mode styles
function enableLightMode() {
    document.body.style.background = "linear-gradient(180deg, #f8f8f8, #e6f6ff)";
    document.body.style.color = "#222";

  weatherLocationCard.classList.add("weather-location-card-light-mode");
  weatherAirConditionCard.classList.add("weather-air-condition-card-light-mode");
  forecastInfo.classList.add("forecast-info-light-mode");
  mainSection.classList.add("main-section-light-mode");

  // Apply light mode to all forecast day-cards dynamically
  document.querySelectorAll(".day-card").forEach(card => {
    card.classList.add("day-card-light-mode");
  });

  faSun.classList.add("active");
  faMoon.classList.remove("active");
}

// Remove light mode styles (back to dark)
function disableLightMode() {
  document.body.style.background = "black";
  document.body.style.color = "#fff";

  weatherLocationCard.classList.remove("weather-location-card-light-mode");
  weatherAirConditionCard.classList.remove("weather-air-condition-card-light-mode");
  forecastInfo.classList.remove("forecast-info-light-mode");
  mainSection.classList.remove("main-section-light-mode");

  // Remove light mode from all forecast day-cards dynamically

  document.querySelectorAll(".day-card").forEach(card => {
    card.classList.remove("day-card-light-mode");
  });

  faMoon.classList.add("active");
  faSun.classList.remove("active");
}

// Attach event listeners
lightModeBtn.addEventListener("click", enableLightMode);
darkModeBtn.addEventListener("click", disableLightMode);


const apiKey = '1f44bb69fbd66b9a206a164dfae9d339';

searchBtn.addEventListener('click', async () => {
    const city = searchBarEle.value;

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        if (!response.ok) throw new Error('City not found');
        if (searchBarEle.value == "") throw new Error('Please enter City Name');
        const data = await response.json();
        console.log(data);
        displayWeather(data);
        searchBarEle.value = '';

    } catch (error) {
        alert(error);
    }
});
function displayWeather(data) {
    const { name } = data;
    const { icon, description } = data.weather[0];
    const { temp, humidity, pressure, feels_like } = data.main;
    const { speed } = data.wind;
    const { sunrise, sunset } = data.sys;
    const { timezone } = data;
    const { lon, lat } = data.coord;

    // Convert to ms for JS Date
    let sunriseDate = new Date(sunrise  * 1000);
    let sunsetDate = new Date(sunset  * 1000);
    console.log(sunriseDate, sunsetDate);

    // Format to hh:mm AM/PM
    let options = { hour: '2-digit', minute: '2-digit' };

    let sunriseTime = sunriseDate.toLocaleTimeString([], options);
    let sunsetTime = sunsetDate.toLocaleTimeString([], options);
    console.log(sunriseTime, sunsetTime);

    let sunrisedDate = new Date((sunrise + timezone ) * 1000)
    // Format (Day, Month, Year)
    let formattedDate = sunrisedDate.toLocaleDateString("en-US",{ year: 'numeric', month: 'long', day: 'numeric' });
    weatherContainer.classList.remove('displayed');

    console.log(formattedDate);
    weatherLocationCard.innerHTML = `
        <div class="weather-city-details">
            <div class="weather-city">
                <h2>${name}</h2>
                <p>${formattedDate}</p>
            </div>
            <div class="city-temp">
                <h1>${Math.round(temp)}°C</h1>
                <p>${description}</p>
            </div>
        </div>
        <div class="weather-icon">
            <img src="http://openweathermap.org/img/wn/${icon}@4x.png" alt="${description}">
        </div>
    `;
    weatherAirConditionCard.innerHTML = `
        <p class="heading">Air Condition</p>
        <div class="air-condition">
            <div class="condition">
                <p><i class="fa-solid fa-temperature-low"></i> Humidity</p>
                <h3>${humidity}%</h3>
            </div>
            <div class="condition">
                <p><i class="fa-solid fa-wind"></i> Wind Speed</p>
                <h3>${speed} m/s</h3>
            </div>
            <div class="condition">
                <p><i class="fa-solid fa-sun"></i> Sunrise</p>
                <h3>${sunriseTime}</h3>
            </div>
            <div class="condition">
                <p><i class="fa-solid fa-moon"></i> Sunset</p>
                <h3>${sunsetTime}</h3>
            </div>  
            <div class="condition">
                <p><i class="fa-solid fa-temperature-three-quarters"></i> Feels Like</p>
                <h3>${Math.round(feels_like)}°C</h3>
            </div>
            <div class="condition">
                <p><i class="fa-solid fa-gauge-high"></i> Pressure</p>
                <h3>${pressure} hPa</h3>
            </div>
        </div>
    `;
    displayForecast(name);
    showMap(lat, lon);
}

async function displayForecast(name) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${name}&appid=f5f61655d1b0408c25bf00286ed3361b&units=metric`);
        if (!response.ok) throw new Error('Forecast data not found');  
        const data = await response.json();
        console.log(data);
        const daily = await getDailyForecast(data.list);
        console.log(daily);
        displayElements(daily);
    } catch (error) {
        console.log(error);
    }
}

function getDailyForecast(forecastList) {
  const groupedByDay = {};

  // 1. Group by day
  forecastList.forEach(item => {
    const date = item.dt_txt.split(" ")[0]; // "YYYY-MM-DD"
    if (!groupedByDay[date]) {
      groupedByDay[date] = [];
    }
    groupedByDay[date].push(item);
  });

  // 2. Build daily forecast
  const dailyForecast = Object.keys(groupedByDay).map(date => {
    const dayData = groupedByDay[date];

    // Extract temps
    const temps = dayData.map(d => d.main.temp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);

    // Pick midday weather if available, else fallback to first entry
    const middayData = dayData.find(d => d.dt_txt.includes("12:00:00")) || dayData[0];
    const weather = middayData.weather[0].main;

    return {
      date: new Date(date).toLocaleDateString("en-US", { weekday: "long" }),
      min: minTemp.toFixed(1),
      max: maxTemp.toFixed(1),
      weather,
      icon: middayData.weather[0].icon
    };
  });

  return dailyForecast;
}

function displayElements(daily) {
    forecastInfo.innerHTML = '<p class="heading">5-Day Forecast</p>';
    daily.forEach(day => {
        const dayCard = document.createElement('div');
        dayCard.classList.add('day-card');
        dayCard.innerHTML = `
            <div class="day-card">
                <h3>${day.date}</h3>
                <div>
                    <img src="http://openweathermap.org/img/wn/${day.icon}@4x.png" alt="${day.weather}">
                    <p>${day.weather}</p>
                </div>
                <p class="min-max">${day.min}°C | ${day.max}°C</p>
            </div>
        `;
        forecastInfo.appendChild(dayCard);

        if(faSun.classList.contains('active')) {
        document.querySelectorAll('.day-card').forEach(card => {
            card.classList.add('day-card-light-mode');
        });
    }
    });
}
function showMap(lat, lon) {
  weatherMapCard.classList.remove('displayed');

  if (!window.myMap) {
    // ✅ Initialize map only once
    window.myMap = L.map("map").setView([lat, lon], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(window.myMap);
  } else {
    window.myMap.setView([lat, lon], 10);
  }

  // ✅ Clear previous markers by using a layer group
  if (window.markerLayer) {
    window.myMap.removeLayer(window.markerLayer);
  }

  window.markerLayer = L.layerGroup().addTo(window.myMap);
  L.marker([lat, lon]).addTo(window.markerLayer)
    .bindPopup(`📍 ${lat.toFixed(2)}, ${lon.toFixed(2)}`)
    .openPopup();

}


