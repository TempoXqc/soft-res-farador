const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for http://localhost:4200
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Example /api/auth/login endpoint
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    // Replace with your MongoDB logic to validate user
    // Example: Check against users collection
    const user = { _id: '6891640718cc2b85894f5ad0', username: 'testuser', password: 'hashedpassword' }; // Mock user
    if (username === user.username && password === user.password) { // Use bcrypt.compare in production
        res.json({ token: 'mock-jwt-token' }); // Replace with actual JWT generation
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});