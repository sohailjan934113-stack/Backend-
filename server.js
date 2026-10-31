require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Luxe Homes Backend is running!",
        status: "success"
    });
});

// Get all properties
app.get("/api/properties", (req, res) => {
    try {
        const properties = db.prepare(
            "SELECT * FROM properties ORDER BY id DESC"
        ).all();

        res.json(properties);
    } catch (error) {
        res.status(500).json({
            message: "Error loading properties"
        });
    }
});

// Get one property
app.get("/api/properties/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid property ID"
        });
    }

    const property = db.prepare(
        "SELECT * FROM properties WHERE id = ?"
    ).get(id);

    if (!property) {
        return res.status(404).json({
            message: "Property not found"
        });
    }

    res.json(property);
});

// Add property
app.post("/api/properties", (req, res) => {
    const {
        title,
        price,
        location,
        type,
        bedrooms = 0,
        bathrooms = 0,
        image = "",
        description = ""
    } = req.body;

    if (
        typeof title !== "string" ||
        !title.trim() ||
        typeof location !== "string" ||
        !location.trim() ||
        typeof type !== "string" ||
        !type.trim() ||
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price <= 0
    ) {
        return res.status(400).json({
            message: "Please provide valid property details"
        });
    }

    if (
        !Number.isInteger(bedrooms) ||
        bedrooms < 0 ||
        !Number.isInteger(bathrooms) ||
        bathrooms < 0
    ) {
        return res.status(400).json({
            message: "Invalid bedrooms or bathrooms"
        });
    }

    if (
        typeof image !== "string" ||
        typeof description !== "string"
    ) {
        return res.status(400).json({
            message: "Image and description must be text"
        });
    }

    try {
        const result = db.prepare(`
            INSERT INTO properties (
                title, price, location, type,
                bedrooms, bathrooms, image, description
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            title.trim(),
            price,
            location.trim(),
            type.trim(),
            bedrooms,
            bathrooms,
            image.trim(),
            description.trim()
        );

        const property = db.prepare(
            "SELECT * FROM properties WHERE id = ?"
        ).get(result.lastInsertRowid);

        res.status(201).json({
            message: "Property added successfully",
            property
        });
    } catch (error) {
        res.status(500).json({
            message: "Could not add property"
        });
    }
});

// Update property
app.put("/api/properties/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid property ID"
        });
    }

    const existing = db.prepare(
        "SELECT * FROM properties WHERE id = ?"
    ).get(id);

    if (!existing) {
        return res.status(404).json({
            message: "Property not found"
        });
    }

    const fields = [
        "title",
        "price",
        "location",
        "type",
        "bedrooms",
        "bathrooms",
        "image",
        "description"
    ];

    const values = {};
    for (const field of fields) {
        values[field] = req.body[field] ?? existing[field];
    }

    if (
        typeof values.title !== "string" ||
        !values.title.trim() ||
        typeof values.price !== "number" ||
        !Number.isFinite(values.price) ||
        values.price <= 0 ||
        typeof values.location !== "string" ||
        !values.location.trim() ||
        typeof values.type !== "string" ||
        !values.type.trim() ||
        !Number.isInteger(values.bedrooms) ||
        values.bedrooms < 0 ||
        !Number.isInteger(values.bathrooms) ||
        values.bathrooms < 0 ||
        typeof values.image !== "string" ||
        typeof values.description !== "string"
    ) {
        return res.status(400).json({
            message: "Please provide valid property details"
        });
    }

    db.prepare(`
        UPDATE properties SET
            title = ?,
            price = ?,
            location = ?,
            type = ?,
            bedrooms = ?,
            bathrooms = ?,
            image = ?,
            description = ?
        WHERE id = ?
    `).run(
        values.title.trim(),
        values.price,
        values.location.trim(),
        values.type.trim(),
        values.bedrooms,
        values.bathrooms,
        values.image.trim(),
        values.description.trim(),
        id
    );

    const property = db.prepare(
        "SELECT * FROM properties WHERE id = ?"
    ).get(id);

    res.json({
        message: "Property updated successfully",
        property
    });
});

// Delete property
app.delete("/api/properties/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid property ID"
        });
    }

    const result = db.prepare(
        "DELETE FROM properties WHERE id = ?"
    ).run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            message: "Property not found"
        });
    }

    res.json({
        message: "Property deleted successfully"
    });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `Luxe Homes Backend running on port ${PORT}`
    );
});