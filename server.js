const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8080;

// Cette ligne est cruciale : elle lance la logique de ton bot qui se trouve dans index.js
require('./index.js');

// Middleware pour servir les fichiers statiques depuis le dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pour analyser les requêtes JSON
app.use(bodyParser.json());

// Point de terminaison API pour le chatbot (si tu l'utilises)
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) {
        return res.status(400).json({ reply: "Message manquant." });
    }

    try {
        const apiUrl = `https://kyotaka-api.vercel.app/api/chat?query=${encodeURIComponent(userMessage)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        const botReply = data.message;
        res.json({ reply: botReply });
    } catch (error) {
        console.error("Erreur de l'API Kyotaka:", error);
        res.status(500).json({ reply: "Désolé, une erreur est survenue." });
    }
});

// Une route simple pour que le serveur reste actif sur Render
app.get('/', (req, res) => {
    res.send('Royale-Protection est en ligne!');
});

app.listen(PORT, () => {
    console.log(`Le serveur est en cours d'exécution sur le port ${PORT}`);
});
