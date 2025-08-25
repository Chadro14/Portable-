const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

// On utilise un objet pour stocker l'historique des messages de chaque utilisateur.
// Format : { 'numero_de_telephone': { last_message_time: 123456789, message_count: 5 } }
const userMessageHistory = {};

// Paramètres pour la détection du spam
const SPAM_THRESHOLD_SECONDS = 5; // Limite de temps en secondes
const SPAM_THRESHOLD_MESSAGES = 10; // Nombre de messages max dans ce laps de temps

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

// Fonction pour ajouter un délai
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Fonction pour vérifier si un utilisateur envoie des spams en masse
function isSpamming(sender) {
    const now = Date.now();
    
    // Si l'utilisateur n'est pas encore dans l'historique, on l'ajoute.
    if (!userMessageHistory[sender]) {
        userMessageHistory[sender] = { last_message_time: now, message_count: 1 };
        return false;
    }
    
    const history = userMessageHistory[sender];
    const timeSinceLastMessage = now - history.last_message_time;
    
    // Si le temps écoulé est inférieur au seuil, on incrémente le compteur.
    if (timeSinceLastMessage < SPAM_THRESHOLD_SECONDS * 1000) {
        history.message_count++;
        // Si le compteur dépasse le seuil, c'est un spam !
        if (history.message_count > SPAM_THRESHOLD_MESSAGES) {
            return true;
        }
    } else {
        // Sinon, on réinitialise le compteur.
        userMessageHistory[sender] = { last_message_time: now, message_count: 1 };
    }
    
    return false;
}

client.on('message', async message => {
    const sender = message.from;
    const body = message.body.toLowerCase();

    // Vérifie si le contact de l'expéditeur existe
    const contact = await message.getContact();
    if (contact.isMyContact) {
        return; 
    }

    // Nouvelle vérification pour la détection de spam en rafale
    if (isSpamming(sender)) {
        console.log(`[ALERTE SPAM EN RAFALE] ${sender} envoie trop de messages. Bloqué.`);
        await message.reply(`⛔️ ALERTE: Vous avez été identifié comme un spammeur. Vos messages ne seront pas pris en compte.`);
        // Optionnel : vous pouvez ajouter une ligne pour bloquer l'utilisateur ici
        // client.blockContact(sender);
        return; // Arrête le traitement pour cet utilisateur
    }

    // Le reste de votre code existant pour la détection par mots-clés, etc.
    const spamKeywords = [
        'gagner de l’argent',
        'crypto',
        'opportunité d’investissement',
        'cliquez ici'
    ];
    
    const containsSpam = spamKeywords.some(keyword => body.includes(keyword));

    if (containsSpam) {
        console.log(`[ALERTE SPAM] Message de ${sender} a été détecté comme spam.`);
        message.reply(`⛔️ ALERTE: Ce message a été identifié comme spam. Le contenu est en cours de surveillance par Royale-Protection.`);
    }
    
    if (message.isGroupMsg) {
        if (message.hasMedia || body.includes('http')) {
            console.log(`[MODÉRATION GROUPE] Message suspect de ${sender}.`);
            message.delete(true); 
            await sleep(1500); 
            message.reply(`⚠️ Le message a été supprimé par Royale-Protection. Les liens et médias sont interdits dans ce groupe.`);
        }
    }

    if (body.includes('salut')) {
        await sleep(2000); 
        message.reply(`Salut, je suis Royale-Protection. Je suis là pour garantir la sécurité de votre compte.`);
    }

    console.log(`Message reçu de : ${sender}`);
    console.log(`Contenu : ${body}`);
});

client.initialize();
