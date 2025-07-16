import '@whiskeysockets/baileys'; // Importa le dipendenze necessarie per Baileys

// Quantità di denaro da dare con il daily bonus
const DAILY_BONUS_AMOUNT = 150;
// Cooldown in millisecondi (24 ore * 60 minuti * 60 secondi * 1000 millisecondi)
const COOLDOWN = 24 * 60 * 60 * 1000; 

// --- FUNZIONE HELPER PER FORMATTARE IL TEMPO ---
/**
 * Formatta un numero di millisecondi in una stringa leggibile (es. 1g 3h 30m).
 * @param {number} ms - Millisecondi.
 * @returns {string} Tempo formattato.
 */
function formatTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    let parts = [];
    if (days > 0) parts.push(`${days}g`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 && parts.length < 2) parts.push(`${seconds}s`); // Mostra secondi solo se non ci sono già 2 unità maggiori

    return parts.length > 0 ? parts.join(' ') : 'meno di 1s';
}

// --- HANDLER DEL COMANDO .slotDaily ---
let handler = async (m, { conn, usedPrefix }) => {
    const senderId = m.sender;
    const chatId = m.chat;

    // --- GESTIONE SALDO UTENTE E COOLDOWN TRAMITE global.slotDb ---
    // Assicurati che global.slotDb sia stato inizializzato dal modulo lib/slotDB.js
    if (typeof global.slotDb === 'undefined' || typeof global.slotDb.data === 'undefined' || typeof global.slotDb.data.users === 'undefined') {
        console.error("ERRORE: global.slotDb non è configurato. Assicurati che lib/slotDB.js sia importato.");
        return conn.reply(chatId, `❌ Errore interno del bot: sistema slot non configurato. Contatta l'amministratore.`, m);
    }

    // Inizializza l'utente nel database slot se non esiste
    if (typeof global.slotDb.data.users[senderId] === 'undefined') {
        global.slotDb.data.users[senderId] = {};
    }

    // Inizializza il saldo dell'utente a 250 se non esiste (coerente con .slot)
    if (typeof global.slotDb.data.users[senderId].money === 'undefined' || global.slotDb.data.users[senderId].money === null) {
        global.slotDb.data.users[senderId].money = 250; 
        console.log(`[SLOT DAILY] Saldo di ${senderId} inizializzato a 250 in slotdata.json.`);
    }
    // Inizializza l'ultimo utilizzo del daily bonus se non esiste
    if (typeof global.slotDb.data.users[senderId].lastDaily === 'undefined' || global.slotDb.data.users[senderId].lastDaily === null) {
        global.slotDb.data.users[senderId].lastDaily = 0; // Imposta a 0 per permettere il primo utilizzo
    }

    let userMoney = global.slotDb.data.users[senderId].money;
    let lastDailyUse = global.slotDb.data.users[senderId].lastDaily;
    const currentTime = Date.now();

    // Calcola il tempo rimanente prima che il comando possa essere usato di nuovo
    const timeLeft = COOLDOWN - (currentTime - lastDailyUse);

    try {
        if (timeLeft > 0) {
            // Se il cooldown non è terminato
            const formattedTimeLeft = formatTime(timeLeft);
            return conn.reply(chatId, `⏳ Hai già ritirato il tuo bonus giornaliero! Riprova tra ${formattedTimeLeft}.`, m);
        } else {
            // Se il cooldown è terminato, eroga il bonus
            global.slotDb.data.users[senderId].money += DAILY_BONUS_AMOUNT;
            global.slotDb.data.users[senderId].lastDaily = currentTime; // Aggiorna l'ultimo utilizzo

            userMoney = global.slotDb.data.users[senderId].money; // Aggiorna la variabile locale

            let message = `🎉 *BONUS GIORNALIERO RITIRATO!* 🎉
Hai ricevuto ${DAILY_BONUS_AMOUNT}€!
Il tuo nuovo saldo: ${userMoney}€`;

            // --- PREPARA E INVIA IL MESSAGGIO CON EMBED E MOSTRA CANALE ---
            const thumbnailUrl = "https://i.ibb.co/vCsZYV3p/scroll-1f4dc.webp"; // Immagine per l'embed
            let thumbnailBuffer;
            try {
                thumbnailBuffer = await (await fetch(thumbnailUrl)).buffer();
            } catch (e) {
                console.error("Errore nel download della thumbnail:", e);
                thumbnailBuffer = Buffer.from('');
            }

            await conn.sendMessage(chatId, {
                text: message.trim(),
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363419284785624@newsletter', // Sostituisci con il tuo JID newsletter
                        serverMessageId: '',
                        newsletterName: "GiuseMD-V3 → Bonus Giornaliero" // Nome del canale/newsletter
                    },
                    externalAdReply: { // L'embed visivo
                        title: `💰 Bonus Giornaliero - Ritirato!`,
                        body: `Torna tra 24h per un altro bonus!`,
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        previewType: "PHOTO",
                        thumbnail: thumbnailBuffer,
                        sourceUrl: 'https://wa.me/' + conn.user.jid.split('@')[0] // Link del bot
                    }
                }
            }, { quoted: m }); // Quota il messaggio originale per un contesto
        }
        
    } catch (error) {
        console.error("Errore nel comando .slotDaily:", error);
        conn.reply(chatId, `❌ Si è verificato un errore durante l'erogazione del bonus giornaliero. Riprova più tardi.`, m);
    }
};

handler.help = ['slotDaily'];
handler.tags = ['economy', 'games'];
handler.command = /^(slotdaily)$/i;

export default handler;