let lieblingsEssen = ["Spätzle","Frühlingsrolle","Aglio e olio","Kaiserschmarrn","Flammkuchen","Ratatouille"];
let kategorien = ["Tellergericht vegetarisch", "Vegetarisch", "Klassiker", "Pizza des Tages",
"Wok", "Burger der Woche", "Empfehlung des Tages"];

const proxyURL = "https://api.allorigins.win/raw?url=";
const mensaURL = "https://www.studierendenwerk-aachen.de/speiseplaene/academica-w.html";

function updateMensa() {
    fetch(proxyURL + mensaURL)
    .then(response => {
        if (response.status !== 200) {
            console.error(`Failed to fetch Mensa data. Status Code: ${response.status}`);
            return;
        }
        response.text().then(parseMensaData);
    })
    .catch(error => {
        console.error("Failed to fetch Mensa data:", error);
    });
}

function parseMensaData(data) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, "text/html");

    let today = new Date();
    let currentHour = today.getHours();
    let days = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
    let currentDay = days[today.getDay()];

    // Adjust the day if it's past 16:00 or if it's a weekend
    if (currentHour >= 16) {
        today.setDate(today.getDate() + 1);
        currentDay = days[today.getDay()];
    }
    if (currentDay === "Samstag" || currentDay === "Sonntag") {
        currentDay = "Montag";
    }

    //console.log("Parsed day:", currentDay);

    // Find the section for the current day
    const daySection = doc.querySelector(`div[id="${currentDay}"]`);
    if (!daySection) {
        console.error(`Failed to find section for day: ${currentDay}`);
        return;
    }

    // Extract the menu items for the day
    const dishes = [];
    const rows = daySection.querySelectorAll('tr.odd, tr.even');
    rows.forEach(row => {
        const categoryElement = row.querySelector('.menue-item.menue-category');
        const descriptionElement = row.querySelector('.menue-item.menue-desc');
        const priceElement = row.querySelector('.menue-item.menue-price');

        const category = categoryElement ? categoryElement.textContent.trim() : "N/A";
        const description = descriptionElement ? descriptionElement.textContent.trim() : "N/A";
        const price = priceElement ? priceElement.textContent.trim() : "N/A";

        const dish = {
            category,
            description,
            price
        };
        dishes.push(dish);
    });

    // Update the UI with the fetched dishes
    updateUIWithDishes(dishes);
}

function cleanMenuString(menuString) {
    // Start with the incoming menu string
    let cleanedString = menuString;

    // Remove allergen tags: sequences of uppercase letters and/or numbers optionally followed by a comma and another sequence of uppercase letters and/or numbers
    cleanedString = cleanedString.replace(/\s+([A-Z0-9]+(\s*,\s*[A-Z0-9]+)*)(\s|$)/g, " ");

    // Remove the + symbol at the beginning
    cleanedString = cleanedString.replace(/^\+/gm, "");
	
    // Trim any extra spaces left behind after removing the tags
    cleanedString = cleanedString.trim();

    return cleanedString;
}




function updateUIWithDishes(dishes) {
    let res = "";  // Text to be displayed
    let nurEinmalWok = 0;  // To handle Wok dishes

    for (let dish of dishes) {
        if (kategorien.includes(dish.category)) {
            // Handle Wok dishes
            if (dish.category === "Wok") {
                if (nurEinmalWok === 0) {
                    nurEinmalWok++;
                } else {
                    let wok_parts = dish.description.split("|");
                    let wok = cleanMenuString(wok_parts[0].trim());
                    let beilage = cleanMenuString(wok_parts[wok_parts.length - 1].trim());
                    res += `${wok}<br>${beilage}<br><hr/>`;
                }
            } else {  // Handle other dishes
                let newLine = cleanMenuString(dish.description.split("|")[0]);
                res += `${newLine}<br><hr/>`;
            }
        }
    }

    //console.log("Processed Menu:", res);  // Logging the processed menu

    // Check for favorite dishes
    for (let favorite of lieblingsEssen) {
        if (res.includes(favorite)) {
            res += `<h3>Empfehlung: ${favorite}</h3>`;
            break;
        }
    }

    // Update the display element with the processed result
    document.getElementById("mensa").innerHTML = res;
}


// Trigger the fetch when the script loads
fetchMensa();

// ... (all your other code, functions, and variables)

// At the very end of your script:
//document.addEventListener('DOMContentLoaded', function() {
//    fetchMensa();
//});

