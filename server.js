const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const Event = require("./models/event");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hackathon Backend is running!");
});

// CREATE EVENT
app.post("/events", async (req, res) => {
    try {
        const newEvent = await Event.create(req.body);

        res.status(201).json(newEvent);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// GET ALL EVENTS
app.get("/events", async (req, res) => {
    try {
        const events = await Event.find();

        res.json(events);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
// UPDATE EVENT
app.put("/events/:id", async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedEvent);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err.message);
    });

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});