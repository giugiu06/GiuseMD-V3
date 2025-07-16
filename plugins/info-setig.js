let handler = async (m, { text, conn }) => {
    let userId = m.sender;
    let userData = global.db.data.users[userId];

    if (!text) {
        return conn.reply(m.chat, `╭⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》
┊ ❌ *Errore: Mancanza Nome Utente*
┊ ──────────────────────
┊ *Devi specificare il tuo nome utente Instagram!*
┊ 📌 *Esempio:* \`.setig nomeutente\`
╰⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》`, m);
    }

    if (text.length > 30) {
        return conn.reply(m.chat, `╭⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》
┊ ⚠️ *Errore: Lunghezza Nome Utente*
┊ ──────────────────────
┊ *Il nome utente di Instagram non può superare i 30 caratteri.*
╰⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》`, m);
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(text)) {
        return conn.reply(m.chat, `╭⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》
┊ ⚠️ *Errore: Caratteri Non Validi*
┊ ──────────────────────
┊ *Il nome utente può contenere solo lettere, numeri, punti e underscore.*
╰⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》`, m);
    }

    // Se tutto è valido, imposta il nome utente Instagram
    userData.instagram = text;
    conn.reply(m.chat, `╭⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》
┊ ✅ *Instagram Impostato!*
┊ ──────────────────────
┊ *Ora nel tuo profilo apparirà:*
┊ instagram.com/${text}
╰⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》`, m);
};

handler.command = /^(setig)$/i;
export default handler;
