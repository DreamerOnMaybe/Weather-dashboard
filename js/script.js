const apiKey = '54656c3ccfba1edf5e913bb0eddcfd03'
const city = 'Omsk'
const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ru`

const tempDisplay = document.querySelector('.number')
const middleTempDisplay = document.querySelector('.middle__temp')
const cityDisplay = document.querySelector('.location')
const windDisplay = document.querySelector('.wind')
const humidityDisplay = document.querySelector('.humidity')
const rainDisplay = document.querySelector('.rain')
const qualityIndex = document.querySelector('.index')

function getWeather() {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            cityDisplay.textContent = data.name
            tempDisplay.innerHTML = `${Math.round(data.main.temp)}<span>°C</span>`
            middleTempDisplay.innerHTML = `${Math.round(data.main.temp_min)}° <span>${Math.round(data.main.temp_max)}</span>°`
            windDisplay.textContent = `${data.wind.speed} km/h`
            humidityDisplay.textContent = `${data.main.humidity} %`
            const rainValue = data.rain ? data.rain['1h'] : 0
            rainDisplay.textContent = `${rainValue}%`

            const formatTime = (timestamp, timezoneOffset) => {
                const date = new Date((timestamp + timezoneOffset) * 1000)

                const hours = date.getUTCHours().toString().padStart(2, '0')
                const minutes = date.getUTCMinutes().toString().padStart(2, '0')

                return `${hours}:${minutes}`
            }

            const sunriseDisplay = document.getElementById('sunrise-text')
            const sunsetDisplay = document.getElementById('sunset-text')
            const offset = data.timezone
            sunriseDisplay.textContent = formatTime(data.sys.sunrise, offset)
            sunsetDisplay.textContent = formatTime(data.sys.sunset, offset)

            updateWeatherTime(data);

            const lat = data.coord.lat
            const lon = data.coord.lon

            return fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)

            
        })
        .then(response => response.json())
        .then(airData => {
            console.log('Данные о воздухе:', airData)

            const aqiToText = {
                1: 'Хорошо',
                2: 'Удовлетворительно',
                3: 'Средне',
                4: 'Плохо',
                5: 'Очень плохо'
            }
            const aqi = airData.list[0].main.aqi
            qualityIndex.textContent = aqi
            const qualityTextDisplay = document.querySelector('.boa')
            qualityTextDisplay.textContent = aqiToText[aqi]

            const components = airData.list[0].components
            document.querySelector('.pm2_5').textContent = components.pm2_5
            document.querySelector('.pm10').textContent = components.pm10
            document.querySelector('.so2').textContent = components.so2
            document.querySelector('.no2').textContent = components.no2
            document.querySelector('.o3').textContent = components.o3
            document.querySelector('.co').textContent = components.co

        })
}

let weatherTimer;

const updateWeatherTime = (data) => {
    const currentTimeDisplay = document.getElementById('current-time-text');
    const sunIcon = document.getElementById('sun-icon');
    
    const { timezone, sys, dt } = data;
    const { sunrise, sunset } = sys;

    if (weatherTimer) clearInterval(weatherTimer);

    let currentCitySeconds = dt + timezone;

    const tick = () => {
        const cityTime = new Date(currentCitySeconds * 1000);

        const hours = cityTime.getUTCHours().toString().padStart(2, '0');
        const minutes = cityTime.getUTCMinutes().toString().padStart(2, '0');
        
        currentTimeDisplay.textContent = `${hours}:${minutes}`;
        
        let sunProgress = (currentCitySeconds - sunrise) / (sunset - sunrise);
        sunProgress = Math.max(0, Math.min(1, sunProgress));

        const angle = (sunProgress * 180) - 90;
        
        sunIcon.style.transformOrigin = '122px 122px';
        sunIcon.style.transform = `rotate(${angle}deg)`;


        currentCitySeconds++;
    };

    tick();
    weatherTimer = setInterval(tick, 1000);
};

getWeather()