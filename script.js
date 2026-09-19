const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector(".search-input");
const ipInfoSection = document.querySelector(".ip-info");
const mapContainer = document.getElementById("map");

let map;
let marker;
async function getUserIP() {
	const res = await fetch("https://api.ipify.org?format=json");

	if (!res.ok) {
		throw new Error(`Failed to fetch IP: ${res.status} ${res.statusText}`);
	}
	const data = await res.json();

	console.log(data.ip);
	return data.ip;
}

async function getIPInfo(ip) {
	const res = await fetch(`https://hackmyip.com/api/v1/ip/${ip}`);

	if (!res.ok) {
		throw new Error(`Failed to fetch IP info: ${res.status} ${res.statusText}`);
	}
	const data = await res.json();
	if (!data.success) {
		throw new Error(data.error);
	}

	return data.data;
}

async function init() {
	try {
		const ip = await getUserIP();
		const data = await getIPInfo(ip);

		renderData(data);
		updateMap(data.location.latitude, data.location.longitude, data.ip);
		console.log("initializing data");
	} catch (error) {
		console.error("Error initializing app:", error);
	}
}
function renderData(data) {
	searchInput.value = data.ip;
	ipInfoSection.innerHTML = `
    <div class="info-card">
		<span>IP: </span>
		<p class="ip-address">${data.ip}</p>
	</div>

	<div class="info-card">
		<span>Location: </span>
		<p class="location">${data.location.city}, ${data.location.country_name}</p>
	</div>

	<div class="info-card">
		<span>Timezone: </span>
		<p class="timezone">${data.location.timezone}</p>
	</div>

	<div class="info-card">
		<span>ISP: </span>
		<p class="isp">${data.network.isp}</p>
	</div>
    
    `;
}

function updateMap(lat, long, ip) {
	if (!map) {
		map = L.map("map").setView([lat, long], 13);
		L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
	} else {
		map.setView([lat, long], 13);
	}

	if (!marker) {
		marker = L.marker([lat, long]).addTo(map);
	} else {
		marker.setLatLng([lat, long]);
	}

	marker.bindPopup(ip).openPopup();
}

searchForm.addEventListener("submit", async (e) => {
	e.preventDefault();
	const ip = searchInput.value.trim();
	// let searchData = null;
	if (!ip) {
		alert("Please enter an IP address to search.");
		return;
	}

	try {
		const searchData = await getIPInfo(ip);

		renderData(searchData);
		updateMap(
			searchData.location.latitude,
			searchData.location.longitude,
			searchData.ip,
		);
		console.log(`rendering data for IP:${ip}`);
	} catch (error) {
		console.error("Error fetching IP info:", error);
		alert(
			error.message ||
				"An error occurred while fetching the IP information. Please try again later.",
		);
	}
});

init();
