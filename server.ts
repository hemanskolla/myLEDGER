// Import Frameworks + Modules
import express from 'express';
import dotenv from 'dotenv';
dotenv.config({
    path: './server/.env' // Since .env file not in root
});

const PORT = process.env.PORT; // Define the port
const app = express(); // Creates Express Instance

// Middleware
app.use(express.json()); // Automatically parses JSON

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
