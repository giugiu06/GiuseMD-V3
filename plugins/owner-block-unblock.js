let handler = async (m, { text, conn, usedPrefix, command }) => {
    // Messaggio di esempio formattato con la tua UI
    let exampleMessage = `╭⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》
┊ ⚠️ *UTILIZZO CORRETTO DEL COMANDO* ⚠️
┊ ──────────────────────
┊ Per favore, menziona l'utente o rispondi a un suo messaggio.
┊ 
┊ 💡 *Esempio:*
┊  \`${usedPrefix}${command} @${m.sender.split("@")[0]}\`
╰⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》`;

    // Determina il JID dell'utente target
    let targetJid = m.mentionedJid[0] 
        ? m.mentionedJid[0] 
        : m.quoted 
            ? m.quoted.sender 
            : text 
                ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' 
                : false;

    // Se non è stato fornito un target valido, invia il messaggio di esempio
    if (!targetJid) {
        return conn.reply(m.chat, exampleMessage, m, { mentions: [m.sender] });
    }

    // Prepara il nome del bot per il footer della newsletter
    const botNewsletterName = global.db.data.nomedelbot || "꧁ ĝ̽̓̀͑ỉ͔͖̜͌ư̡͕̭̇s̠҉͍͊ͅẹ̿͋̒̕ẹ̿͋̒̕ ꧂ 「 ᵇᵒᵗ 」";

    let result = []; // Array per memorizzare il JID dell'utente processato

    switch (command) {
        case "blok":
        case "block":
            // Esegui l'azione di blocco
            await conn.updateBlockStatus(targetJid, "block").then(() => { 
                result.push(targetJid); 
            });
            // Costruisci il messaggio di conferma per il blocco
            let blockConfirmation = `╭⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》
┊ 🚫 *UTENTE BLOCCATO* 🚫
┊ ──────────────────────
┊ L'utente @${targetJid.split('@')[0]} è stato bloccato con successo.
┊ Non potrà più interagire con il bot.
┊ ──────────────────────
┊ > ${botNewsletterName}
╰⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》`;
            conn.reply(m.chat, blockConfirmation, m, { mentions: [targetJid] });
            break;

        case "unblok":
        case "unblock":
            // Esegui l'azione di sblocco
            await conn.updateBlockStatus(targetJid, "unblock").then(() => { 
                result.push(targetJid); 
            });
            // Costruisci il messaggio di conferma per lo sblocco
            let unblockConfirmation = `╭⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》
┊ ✅ *UTENTE SBLOCCATO* ✅
┊ ──────────────────────
┊ L'utente @${targetJid.split('@')[0]} è stato sbloccato con successo.
┊ Ora può nuovamente interagire con il bot.
┊ ──────────────────────
┊ > ${botNewsletterName}
╰⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》`;
            conn.reply(m.chat, unblockConfirmation, m, { mentions: [targetJid] });
            break;
    }
};

handler.command = /^(blok|block|unblok|unblock)$/i; // Comandi supportati
handler.owner = true; // Solo l'owner può usare questo comando

export default handler;
