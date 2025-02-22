// Polyfill fetch and Headers for Node.js
globalThis.fetch = require('node-fetch');
globalThis.Headers = require('headers-polyfill').Headers;

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();
const ejs=require("ejs");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const cors = require("cors");

app.use(express.json());
app.use(cors());

const port = 3000;

// Serve static files (CSS, JS, images, etc.)
app.use(express.static('public'));

// Middleware to parse JSON and form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session configuration
app.use(session({
    secret: 'your-secret-key', // Replace with a secure secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Flash middleware
app.use(flash());

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Database connection pool
let pool;

// Set up view engine (EJS)
app.set("view engine","ejs");//to start view engine
app.set("views",path.join(__dirname,"views"));//join the path of to start server outside the main project
app.use(express.urlencoded({extended:true}));   //for parsing post body

app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);//it used as 

//static files 
app.use(express.static(path.join(__dirname, "public")));

// Routes

// Home page
app.get('/', (req, res) => {
    res.redirect('/index');
});

// Index page
app.get('/index', (req, res) => {
    const messages = {
        success: req.flash('success'),
        error: req.flash('error')
    };
    res.render('index', { messages });
});

// Connect page
app.get('/connect', (req, res) => {
    const messages = {
        success: req.flash('success'),
        error: req.flash('error')
    };
    res.render('connect', { messages });
});

app.get('/contact', (req, res) => {
 
    res.render('contact.ejs');
});


app.get('/about', (req, res) => {
 
    res.render('about.ejs');
});



// Handle database connection
app.post('/connect', async (req, res) => {
    const { host, port, username, password, database } = req.body;

    // Trim all input values to remove leading/trailing spaces
    const trimmedHost = host.trim();
    const trimmedPort = port.trim();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedDatabase = database.trim();

    console.log('Received connection request with details:', {
        host: trimmedHost,
        port: trimmedPort,
        username: trimmedUsername,
        database: trimmedDatabase,
    });

    try {
        pool = mysql.createPool({
            host: trimmedHost,
            port: parseInt(trimmedPort),
            user: trimmedUsername,
            password: trimmedPassword,
            database: trimmedDatabase,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });

        // Test the connection
        const connection = await pool.getConnection();
        console.log('Successfully connected to the database!');
        connection.release(); // Release the connection back to the pool

        // Set flash message for successful connection
        req.flash('success', 'Database connected successfully!');
        return res.redirect('/index');
    } catch (error) {
        console.error('Database connection error:', error);

        // Set flash message for connection error
        req.flash('error', 'Failed to connect to the database. Check your credentials and try again.');
        return res.redirect('/connect');
    }
});

// Handle query submission
app.post('/query', async (req, res) => {
    const { query } = req.body;

    console.log('Received query:', query);

    if (!pool) {
        console.error('Database not connected');
        return res.status(400).json({ error: 'Database not connected' });
    }

    try {
        // Convert natural language to SQL
        const sqlQuery = await naturalLanguageToSQL(query);
        console.log('Generated SQL Query:', sqlQuery);

        return res.status(200).json({ result: sqlQuery });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Failed to process the query', details: error.message });
    }
});

// Handle SQL execution
app.post('/execute', async (req, res) => {
    const { query } = req.body;

    console.log('Received SQL query for execution:', query);

    if (!pool) {
        console.error('Database not connected');
        return res.status(400).json({ error: 'Database not connected' });
    }

    try {
        // Execute the SQL query
        const [rows] = await pool.query(query);
        console.log('Query Result:', rows);

        return res.status(200).json({ result: rows });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Failed to execute the query', details: error.message });
    }
});

// Function to convert natural language to SQL
async function naturalLanguageToSQL(prompt) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Define a system prompt to guide the model
    const systemPrompt = `
    You are a SQL expert. Convert the following natural language query into a valid SQL query for a MySQL database.
    The database has a table named "users" with columns: id, name, email.
    Return only the SQL query, nothing else.
    Natural Language Query: ${prompt}
    `;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const sqlQuery = response.text().trim();

    // Clean up the SQL query (remove backticks, formatting, etc.)
    const cleanedQuery = sqlQuery.replace(/```sql/g, '').replace(/```/g, '').trim();

    return cleanedQuery;
}



// 404 Page
app.get('*', (req, res) => {
    res.send('404 page not found');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});