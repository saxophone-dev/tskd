const express = require('express');
const cors = require('cors');
const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(cors());

// POST endpoint for /api/feedback
app.post('/api/feedback', (req, res) => {
    const { email, message } = req.body;

    // Validate email and message keys
    if (!email || !message) {
        return res.status(400).json({ error: "Both 'email' and 'message' are required." });
    }

    // Respond with the received data
    res.json({
        received: {
            email,
            message,
        },
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

