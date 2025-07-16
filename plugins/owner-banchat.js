// Crediti by Gabs

let handler = async (m, { conn, usedPrefix }) => { // Aggiunto conn e usedPrefix per coerenza, anche se non usati direttamente
    // Imposta la chat come "bannata" nel database globale
    global.db.data.chats[m.chat].isBanned = true;

    // Prepara il nome del bot per il footer della newsletter
    const botNewsletterName = global.db.data.nomedelbot || "꧁ ĝ̽̓̀͑ỉ͔͖̜͌ư̡͕̭̇s̠҉͍͊ͅẹ̿͋̒̕ẹ̿͋̒̕ ꧂ 「 ᵇᵒᵗ 」";
    
    // Messaggio di conferma stilizzato con la tua UI
    let banMessage = `╭⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》
┊ 😴 *BOT ADDORMENTATO* 😴
┊ ──────────────────────
┊ Il bot è stato messo in *modalità riposo* 💤
┊ Non risponderà più a nessun comando in questa chat.
┊ ──────────────────────
┊ > ${botNewsletterName}
╰⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》`;

    // Invia il messaggio con la UI, includendo un contesto per la newsletter
    await conn.sendMessage(m.chat, {
        text: banMessage.trim(),
        contextInfo: {
            mentionedJid: conn.parseMention(global.wm || botNewsletterName),
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363418973546282@newsletter",
                serverMessageId: '',
                newsletterName: botNewsletterName
            }
        }
    }, { quoted: m }); // Quota il messaggio originale dell'utente
};

handler.help = ['banchat'];
handler.tags = ['owner'];
handler.command = /^(banchat|off)$/i;
handler.owner = true; // Solo l'owner può usare questo comando

export default handler;
