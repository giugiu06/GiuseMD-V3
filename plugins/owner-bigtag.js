let handler = async (m, { conn, text, participants, usedPrefix, command }) => {
    try {
        // Funzione di ritardo per controllare la frequenza dei messaggi
        const delay = (time) => new Promise((res) => setTimeout(res, time));
        
        // Rimuovi spazi extra dal messaggio personalizzato
        let customMessage = text.trim();

        // Se non c'è un messaggio dopo il comando, invia un avviso formattato
        if (!customMessage) {
            let errorMessage = `╭⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》
┊ ⚠️ *ATTENZIONE! MESSAGGIO MANCANTE* ⚠️
┊ ──────────────────────
┊ Devi scrivere un messaggio dopo il comando per
┊ poter usare il *bigtag*!
┊ ──────────────────────
┊ 💡 *Esempio:*
┊  \`${usedPrefix}${command} Ciao a tutti, questa è una prova!\`
╰⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》`;
            return m.reply(errorMessage);
        }

        // Estrai tutti i JID dei partecipanti del gruppo
        let usersToMention = participants.map((u) => conn.decodeJid(u.id));
        
        // Funzione per inviare il messaggio con menzioni nascoste (hidetag)
        const sendHidetagMessage = async (message) => {
            await conn.relayMessage(m.chat, {
                extendedTextMessage: {
                    text: message,
                    contextInfo: { mentionedJid: usersToMention },
                },
            }, {});
        };

        const maxMessageLength = 200; // Lunghezza massima per chunk di messaggio
        let messageChunks = []; // Array per i chunk del messaggio

        // Dividi il messaggio personalizzato in chunk se è troppo lungo
        while (customMessage.length > maxMessageLength) {
            messageChunks.push(customMessage.slice(0, maxMessageLength));
            customMessage = customMessage.slice(maxMessageLength);
        }
        messageChunks.push(customMessage); // Aggiungi l'ultimo chunk

        // Ripeti l'invio dei chunk per 10 volte
        for (let i = 0; i < 10; i++) {
            for (let chunk of messageChunks) {
                await sendHidetagMessage(chunk);
                await delay(2000); // Ritardo di 2 secondi tra i chunk per evitare flood
            }
        }
    } catch (e) {
        console.error("Errore nel comando bigtag:", e); // Log dell'errore per debugging
        m.reply("Si è verificato un errore durante l'esecuzione del comando."); // Messaggio di errore all'utente
    }
};

handler.command = /^(bigtag)$/i; // Il comando è "bigtag"
handler.group = true; // Il comando può essere usato solo nei gruppi
handler.owner = true; // Solo l'owner può usare questo comando

export default handler;
