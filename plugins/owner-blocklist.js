/* Creado por https://github.com/FG98F */

let handler = async (m, { conn }) => {
    try {
        // Recupera la lista degli utenti bloccati dal bot
        const blocklist = await conn.fetchBlocklist();

        // Prepara il nome del bot per il footer della newsletter
        const botNewsletterName = global.db.data.nomedelbot || "꧁ ĝ̽̓̀͑ỉ͔͖̜͌ư̡͕̭̇s̠҉͍͊ͅẹ̿͋̒̕ẹ̿͋̒̕ ꧂ 「 ᵇᵒᵗ 」";

        // Costruisci il messaggio con la lista degli utenti bloccati, formattato con la UI desiderata
        let formattedMessage = `╭⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》
┊ 🚫 *LISTA UTENTI BLOCCATI* 🚫
┊ ──────────────────────
┊ *Totale:* ${blocklist.length}
┊ ──────────────────────
${blocklist.length > 0 ? blocklist.map(jid => `┊ ➢ @${jid.split("@")[0]}`).join('\n') : '┊ ➢ Nessun utente bloccato.'}
┊ ──────────────────────
┊ > ${botNewsletterName}
╰⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》`;

        // Invia il messaggio. conn.parseMention(formattedMessage) assicura che gli utenti menzionati (se presenti) siano correttamente riconosciuti.
        return conn.reply(m.chat, formattedMessage, m, { mentions: await conn.parseMention(formattedMessage) });

    } catch (err) {
        console.error("Errore nel recupero della blocklist:", err);
        // Messaggio di errore stilizzato se non ci sono utenti bloccati o si verifica un altro errore
        let errorMessage = `╭⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》
┊ ❌ *ERRORE O NESSUN BLOCCO* ❌
┊ ──────────────────────
┊ Non ci sono utenti bloccati o si è verificato un errore
┊ nel recupero della lista.
┊ ──────────────────────
┊ > ${botNewsletterName}
╰⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》`;
        return conn.reply(m.chat, errorMessage, m);
    }
};

handler.help = ['blocklist'];
handler.tags = ['owner']; // Questo comando è per l'owner
handler.command = ['blocklist', 'listblock'];
handler.owner = true; // Solo l'owner può usare questo comando

export default handler;
