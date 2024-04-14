const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");


let oldTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
oldTab.classList.add("current-tab");

getfromSessionStorage();
function switchTab(newTab) {
    if(newTab != oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")) {
            //kya search form wala container is invisible, if yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            //main pehle search wale tab pr tha, ab your weather tab visible karna h 
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});




//check if cordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        //agar local coordinates nahi mile
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }

}



async function fetchDailyForecast(cityName) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
         return data;
    } catch (error) {
        console.error("Error fetching daily forecast:", error);
        throw error;
    }
}



async function fetchUserWeatherInfo(coordinates) {
    // Fetch current weather data
    const { lat, lon } = coordinates;

    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        // Display current weather info
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (error) {
        loadingScreen.classList.remove("active");

    }
    // Fetch daily forecast data
    try {
        
        const cityName = document.querySelector("[data-cityname]").innerText;
        const forecastData = await fetchDailyForecast(cityName);
        // Display daily forecast
        renderDailyForecast(forecastData);
    } catch (error) {
        console.error("Error fetching daily forecast:", error);
    }
}
function renderWeatherInfo(weatherInfo) {

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    console.log(weatherInfo);
    //fetch values from weatherINfo object and put it UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        console.error("No Geological Support ");
    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);

}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);
const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "")
        return;
    else 
        fetchSearchWeatherInfo(cityName);
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        const forecastData = await fetchDailyForecast(city);
        // console.log(forecastData);
        renderDailyForecast(forecastData);
        renderWeatherInfo(data);
    }
    catch(err) {
        console.error("Invalid City");
    }
}


// forecast of next five days

function renderDailyForecast(forecastData) {
    const dailyForecastContainer = document.querySelector(".daily-forecast");
    // Clear previous forecast if any
    dailyForecastContainer.innerHTML = "";

    forecastData.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000); 
        const day = date.toLocaleDateString('en-US', { weekday: 'long' }); 
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); 
        const temp = forecast.main.temp.toFixed(2); 
        const windSpeed = forecast.wind.speed; 
        const humidity = forecast.main.humidity; 
        const chanceOfRain = forecast.pop * 100; 
        const description = forecast.weather[0].description; 
        const icon = forecast.weather[0].icon; 

        // Create forecast card
        const card = document.createElement("div");
        card.classList.add("forecast-card");
        card.innerHTML = `
            <p>${day}, ${time}</p>
            <img src="https://openweathermap.org/img/w/${icon}.png" alt="${description}" />
            <p>${temp}°C</p>
            <p>Wind Speed: ${windSpeed} m/s</p>
            <p>Humidity: ${humidity}%</p>
            <p>Chance of Rain: ${chanceOfRain}%</p>
        `;
        // Append card to daily forecast container
        dailyForecastContainer.appendChild(card);
    });
}






// Fetch weather info for saved location

// Function to save location data to sessionStorage
function saveLocationData(locationData) {
    let savedLocations = JSON.parse(sessionStorage.getItem("savedLocations")) || [];
    savedLocations.push(locationData);
    sessionStorage.setItem("savedLocations", JSON.stringify(savedLocations));
}

// Function to render saved locations on the UI
function renderSavedLocations() {
    const savedLocationContainer = document.querySelector(".saved-location");
    savedLocationContainer.innerHTML = ""; // Clear previous saved locations

    const savedLocations = JSON.parse(sessionStorage.getItem("savedLocations")) || [];
    savedLocations.forEach(location => {
        const locationCard = document.createElement("div");
        locationCard.classList.add("saved-location-card");
        locationCard.innerHTML = `
            <h2>${location.city}</h2>
            <p>Temperature: ${location.temp}°C</p>
            <p>Max Temp: ${location.maxTemp}°C</p>
            <p>Min Temp: ${location.minTemp}°C</p>
            <p>Sunrise: ${new Date(location.sunrise * 1000).toLocaleTimeString()}</p>
            <p>Sunset: ${new Date(location.sunset * 1000).toLocaleTimeString()}</p>
        `;
        savedLocationContainer.appendChild(locationCard);
    });
}

// Function to fetch and display weather info for saved locations
// Add event listener to the "Add Location" button

async function fetchAndSaveLocationWeather(cityName) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        
        // Check if country code is available
        const countryCode = data.sys.country;

        const weatherInfo = {
            city: data.name,
            countryIcon: countryCode ? `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png` : '', // Check if country code is available
            temp: data.main.temp,
            maxTemp: data.main.temp_max,
            minTemp: data.main.temp_min,
            sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
            sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
          
        };
        saveLocationData(weatherInfo);
        renderSavedLocations();
    } catch (error) {
        console.error("Error fetching weather for saved location:", error);
    }
}





// Modify the existing fetchSearchWeatherInfo function to save location data only when the "Add Location" button is clicked
async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        const forecastData = await fetchDailyForecast(city);
        renderDailyForecast(forecastData);
        renderWeatherInfo(data);
        return {
            city: data.name,
            temp: data.main.temp,
            maxTemp: data.main.temp_max,
            minTemp: data.main.temp_min,
            sunrise: data.sys.sunrise,
            sunset: data.sys.sunset
        };
    } catch (error) {
        console.error("Invalid City");
        return null; // Return null if there's an error
    }
}

// Add event listener to the "Add Location" button
const addLocationButton = document.getElementById('addLocationButton');
addLocationButton.addEventListener('click', async () => {
    const addLocationInput = document.getElementById('abc');
    const cityName = addLocationInput.value.trim();
    if (cityName !== '') {
        const locationData = await fetchSearchWeatherInfo(cityName);
        if (locationData) {
            saveLocationData(locationData);
            renderSavedLocations();
            addLocationInput.value = ''; // Clear the input field after adding the location
        } else {
            alert('Please enter a valid city name!');
        }
    } else {
        alert('Please enter a valid city name!');
    }
});

const searchIcon = document.getElementById('behav'); // Assuming this is your search icon element
const searchFormContainer = document.querySelector('.form-container');
const userWeatherContainer = document.querySelector('.user-info-container');
const grantAccesContainer = document.querySelector('.grant-location-container');

// Add event listener to the search icon
searchIcon.addEventListener('click', () => {
    // Show the search form container
    searchFormContainer.classList.add('active');

    // Hide other containers
    userWeatherContainer.classList.remove('active');
    grantAccesContainer.classList.remove('active');
});
renderSavedLocations();
fetchUserWeatherInfo(userCoordinates);
renderWeatherInfo(data);
fetchUserWeatherInfo(data.coords);



