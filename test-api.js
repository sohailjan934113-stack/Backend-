async function addProperty() {
    try {
        const response = await fetch("http://127.0.0.1:3000/api/properties", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: "Royal Villa",
                price: 25000000,
                location: "Peshawar",
                type: "Villa",
                bedrooms: 5,
                bathrooms: 4,
                image: "royal-villa.jpg",
                description: "Beautiful luxury villa in Peshawar"
            })
        });

        const data = await response.json();

        console.log(data);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

addProperty();