require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const cors = require('cors'); // Essential for React -> Express communication

const app = express();

// 1. Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// 2. Middleware
app.use(cors());
app.use(express.json()); // Changed from urlencoded to support React JSON requests
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.JWT_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: true
}));

// 3. User Model (The "Schema" for your DB)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true } // In production, hash this with bcrypt!
});
const User = mongoose.model('User', userSchema);

// 4. Exercise Session Model
const sessionSchema = new mongoose.Schema({
    username: String,
    accuracy: Number,
    timeSeconds: Number,
    date: { type: Date, default: Date.now }
});
const ExerciseSession = mongoose.model('ExerciseSession', sessionSchema);

const bcrypt = require('bcrypt');

// --- SIGNUP ROUTE ---
app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Username already taken" });
        }

        // Hash the password (10 "salt rounds" is standard)
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ success: true, message: "User created! You can now login." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error creating user" });
    }
});

// --- UPDATED LOGIN ROUTE ---
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // 2. Compare the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
            req.session.loggedIn = true;
            req.session.username = username;
            req.session.userId = user._id; // Store ID for saving MIDI data later
            res.json({ success: true, message: "Logged in!" });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Login error" });
    }
});

// 6. Save MIDI Progress Route
app.post('/api/save-session', async (req, res) => {
    if (!req.session.loggedIn) return res.status(401).send('Unauthorized');

    try {
        const newResult = new ExerciseSession({
            username: req.session.username,
            accuracy: req.body.accuracy,
            timeSeconds: req.body.timeSeconds
        });
        await newResult.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).send('Error saving session');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));