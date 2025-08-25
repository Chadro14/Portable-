const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
    })
});

client.on('qr', qr => {
    console.log('Veuillez scanner ce code QR pour connecter Royale-Protection:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready! Royale-Protection est maintenant en ligne et protège votre compte.');
});

client.on('message', async message => {
    const sender = message.from;
    const body = message.body.toLowerCase();

    // 1. Détection de spam par mots-clés
    const spamKeywords = [
        'gagner de l’argent',
        'crypto',
        'opportunité d’investissement',
        'cliquez ici'
    ];
    
    // Vérifie si le message contient un mot-clé de spam
    const containsSpam = spamKeywords.some(keyword => body.includes(keyword));

    if (containsSpam) {
        console.log(`[ALERTE SPAM] Message de ${sender} a été détecté comme spam.`);
        message.reply(`⛔️ ALERTE: Ce message a été identifié comme spam. Le contenu est en cours de surveillance par Royale-Protection.`);
        
        // Optionnel: vous pouvez bloquer l'utilisateur
        // client.blockContact(sender);
    }
    
    // 2. Détection de spams par messages de groupe
    if (message.isGroupMsg) {
        // Optionel: vous pouvez interdire les liens ou les photos dans un groupe
        if (message.hasMedia || body.includes('http')) {
            console.log(`[MODÉRATION GROUPE] Message suspect de ${sender}.`);
            message.delete(true); // Supprime le message de tous les participants du groupe
            message.reply(`⚠️ Le message a été supprimé par Royale-Protection. Les liens et médias sont interdits dans ce groupe.`);
        }
    }

    // Réponse automatique pour les utilisateurs
    if (body.includes('salut')) {
        message.reply(`Salut, je suis Royale-Protection. Je suis là pour garantir la sécurité de votre compte.`);
    }

    console.log(`Message reçu de : ${sender}`);
    console.log(`Contenu : ${body}`);
});

client.initialize();
