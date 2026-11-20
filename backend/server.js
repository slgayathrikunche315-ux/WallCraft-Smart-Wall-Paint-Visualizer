require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const designRoutes = require('./routes/designRoutes');

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200'
}));

app.use(express.json({ limit: '15mb' }));

app.get('/', (req, res) => {
    res.send('WallCraft Backend is Running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/designs', designRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected Successfully');

        app.listen(process.env.PORT || 5000, () => {
            console.log('Server running on port 5000');
        });
    })
    .catch(error => {
        console.error('MongoDB Connection Failed:', error.message);
    });