const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_KEY in environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.get("/", (req, res) => {
    res.send("Hackathon Backend is running with Supabase!");
});

// CREATE EVENT
app.post("/events", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("events")
            .insert([req.body])
            .select();

        if (error) throw error;

        res.status(201).json(data[0]);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// GET ALL EVENTS
app.get("/events", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("events")
            .select("*");

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// UPDATE EVENT
app.put("/events/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from("events")
            .update(req.body)
            .eq("id", id)
            .select();

        if (error) throw error;

        res.json(data[0]);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// The main TypeScript app is using PORT 5000, 
// so this standalone script will need a different port if run concurrently
const PORT = process.env.PORT ? parseInt(process.env.PORT) + 1 : 5001;

app.listen(PORT, () => {
    console.log(`Standalone Server running on http://localhost:${PORT}`);
});