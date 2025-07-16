let handler = async (m, { conn, isOwner }) => {
    // Filtra le chat e gli utenti bannati dal database globale
    let chatsBanned = Object.entries(global.db.data.chats).filter(chat => chat[1].isBanned);
    let usersBanned = Object.entries(global.db.data.users).filter(user => user[1].banned);

    // Prepara il nome del bot per il footer, se necessario
    const botNewsletterName = global.db.data.nomedelbot || "꧁ ĝ̽̓̀͑ỉ͔͖̜͌ư̡͕̭̇s̠҉͍͊ͅẹ̿͋̒̕ẹ̿͋̒̕ ꧂ 「 ᵇᵒᵗ 」";

    // Costruisci il messaggio con la lista degli utenti e delle chat bannate
    let caption = `╭⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》
┊ 🚫 *LISTA BAN* 🚫
┊ ──────────────────────
┊ 👨🏻‍✈️ *Utenti Bloccati:*
┊ ➢ *Totale:* ${usersBanned.length}
${usersBanned.length > 0 ? usersBanned.map(([jid], i) => 
`┊ ➢ ${isOwner ? '@' + jid.split('@')[0] : jid}`.trim()).join('\n') : '┊ ➢ Nessun utente bloccato.'}
┊ ──────────────────────
┊ 💬 *Chat Bloccate:*
┊ ➢ *Totale:* ${chatsBanned.length}
${chatsBanned.length > 0 ? chatsBanned.map(([jid], i) => 
`┊ ➢ ${isOwner ? '@' + jid.split('@')[0] : jid}`.trim()).join('\n') : '┊ ➢ Nessuna chat bloccata.'}
┊ ──────────────────────
┊ > ${botNewsletterName}
╰⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》`;

    // Invia il messaggio, menzionando i JID se l'owner lo permette
    m.reply(caption, null, { 
        mentions: conn.parseMention(caption) 
    });
};

handler.command = /^(banlist|bannedlist|daftarban|daftarbanlist)$/i; // Comandi supportati
handler.owner = true; // Solo l'owner può usare questo comando

export default handler;
