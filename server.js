// Import du serveur pour garder le bot en vie
require('./server.js');

// Code de votre bot Royale-Protection
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready! Royale-Protection est maintenant en ligne et protège votre compte.');
});

client.on('message', message => {
    // Le code pour la détection de spam ira ici
    console.log(`Message reçu de : ${message.from}`);
    console.log(`Contenu : ${message.body}`);
});

client.initialize();
