const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

// La stratégie LocalAuth va sauvegarder la session dans un dossier
// C'est essentiel pour que Render conserve votre connexion
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
    })
});

client.on('qr', qr => {
    // Affiche le code QR pour la connexion initiale
    console.log('Veuillez scanner ce code QR pour connecter Royale-Protection:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready! Royale-Protection est maintenant en ligne et protège votre compte.');
});

client.on('message', message => {
    // Le code pour la détection de spam et les actions ira ici
    console.log(`Message reçu de : ${message.from}`);
    console.log(`Contenu : ${message.body}`);
});

client.initialize();
