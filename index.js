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

// Fonction pour ajouter un délai
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

client.on('message', async message => {
    const sender = message.from;
    const body = message.body.toLowerCase();

    // 1. Détection des contacts légitimes (liste blanche)
    const contact = await message.getContact();
    if (contact.isMyContact) {
        return; 
    }

    // 2. Détection de spam par mots-clés
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
    
    // 3. Détection de spams par messages de groupe
    if (message.isGroupMsg) {
        if (message.hasMedia || body.includes('http')) {
            console.log(`[MODÉRATION GROUPE] Message suspect de ${sender}.`);
            message.delete(true); 
            // Ajoute un petit délai avant de répondre pour éviter le bannissement
            await sleep(1500); 
            message.reply(`⚠️ Le message a été supprimé par Royale-Protection. Les liens et médias sont interdits dans ce groupe.`);
        }
    }

    // 4. Réponse automatique pour les utilisateurs
    if (body.includes('salut')) {
        await sleep(2000); 
        message.reply(`Salut, je suis Royale-Protection. Je suis là pour garantir la sécurité de votre compte.`);
    }

    console.log(`Message reçu de : ${sender}`);
    console.log(`Contenu : ${body}`);
});

client.initialize();
client.on('group_participant_change', async (notification) => {
    // Vérifie si l'action est une suppression de participant
    if (notification.action === 'remove') {
        const groupChat = await notification.getChat();
        const participantId = notification.participant;
        const authorId = notification.author; // ID de l'utilisateur qui a initié l'action

        // Si l'action n'a pas été faite par le bot lui-même
        if (authorId !== client.info.me._serialized) {
            console.log(`[ACTION SUSPECTE] ${authorId} a tenté de supprimer ${participantId}.`);
            
            // Le bot retire l'utilisateur qui a initié l'action
            try {
                await groupChat.removeParticipants([authorId]);
                console.log(`[BAN AUTOMATIQUE] ${authorId} a été banni pour avoir tenté de bannir un autre membre.`);
                
                // Le bot envoie un message dans le groupe pour expliquer l'action
                await groupChat.sendMessage(`L'utilisateur @${authorId.split('@')[0]} a été automatiquement banni par Royale-Protection pour avoir tenté de supprimer un membre du groupe.`);
            } catch (error) {
                console.error(`Erreur lors de la suppression de l'utilisateur : ${error.message}`);
            }
        }
    }
});
            
