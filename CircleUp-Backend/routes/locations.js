const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Database connection

// Fetch all states
router.get("/states", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM states ORDER BY name ASC");
    res.json(result.rows); // Return the list of states
  } catch (error) {
    console.error("Error fetching states:", error);
    res.status(500).json({ error: "Failed to fetch states" });
  }
});

// Fetch cities for a specific state
router.get("/cities", async (req, res) => {
  const { stateId } = req.query; // Get the state ID from the query parameters
  if (!stateId) {
    return res.status(400).json({ error: "State ID is required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, name FROM cities WHERE state_id = $1 ORDER BY name ASC",
      [stateId]
    );
    res.json(result.rows); // Return the list of cities for the given state
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ error: "Failed to fetch cities" });
  }
});

// New endpoint: Fetch all states and all cities
router.get("/all", async (req, res) => {
  try {
    const statesResult = await pool.query("SELECT id, name FROM states ORDER BY name ASC");
    const citiesResult = await pool.query("SELECT id, name, state_id FROM cities ORDER BY name ASC");
    res.json({
      states: statesResult.rows,
      cities: citiesResult.rows,
    });
  } catch (error) {
    console.error("Error fetching all locations:", error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

module.exports = router;