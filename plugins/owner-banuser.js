import fetch from 'node-fetch'; // Assicurati di avere node-fetch installato

let handler = async (m, { conn, participants, usedPrefix, command }) => {
    // Se non viene menzionato nessun utente e non c'è un messaggio quotato, non fare nulla
    if (!m.mentionedJid[0] && !m.quoted) {
        return;
    }

    let targetJid;
    // Determina il JID dell'utente da bannare
    if (m.isGroup) {
        targetJid = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender;
    } else {
        targetJid = m.chat; // Se è una chat privata, il target è la chat stessa (o il mittente della chat privata)
    }

    // Assicurati che l'utente non stia cercando di bannare se stesso o il bot
    if (targetJid === conn.user.jid) {
        return m.reply("Non posso bannare me stesso!");
    }
    if (targetJid === m.sender) {
        return m.reply("Non puoi bannare te stesso!");
    }

    // Marca l'utente come bannato nel database
    global.db.data.users[targetJid].banned = true;

    // Prepara la thumbnail per il messaggio quotato
    let thumbnail = await (await fetch("https://telegra.ph/file/710185c7e0247662d8ca6.png")).buffer();

    // Oggetto per la quotazione del messaggio con un'immagine e vCard
    let quotedMessage = {
        key: {
            participants: "0@s.whatsapp.net",
            fromMe: false,
            id: "UserBanned" // ID specifico per questo messaggio
        },
        message: {
            locationMessage: {
                name: "𝐔𝐭𝐞𝐧𝐭𝐞 𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐨",
                jpegThumbnail: thumbnail,
                vcard: `BEGIN:VCARD
VERSION:3.0
N:;Unlimited;;;
FN:Unlimited
ORG:Unlimited
TITLE:
item1.TEL;waid=19709001746:+1 (970) 900-1746
item1.X-ABLabel:Unlimited
X-WA-BIZ-DESCRIPTION:ofc
X-WA-BIZ-NAME:Unlimited
END:VCARD`
            }
        },
        participant: '0@s.whatsapp.net'
    };

    // Prepara il nome del bot per il footer della newsletter
    const botNewsletterName = global.db.data.nomedelbot || "꧁ ĝ̽̓̀͑ỉ͔͖̜͌ư̡͕̭̇s̠҉͍͊ͅẹ̿͋̒̕ẹ̿͋̒̕ ꧂ 「 ᵇᵒᵗ 」";

    // Costruisci il messaggio di conferma stilizzato con la tua UI
    let confirmationMessage = `╭⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》
┊ 🚫 *UTENTE BANNATO* 🚫
┊ ──────────────────────
┊ L'utente @${targetJid.split('@')[0]} non potrà più eseguire
┊ i comandi del bot. È stato messo in lista nera.
┊ ──────────────────────
┊ > ${botNewsletterName}
╰⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》`;

    // Invia il messaggio di conferma, menzionando l'utente bannato
    conn.sendMessage(m.chat, {
        text: confirmationMessage,
        contextInfo: {
            mentionedJid: [targetJid], // Menziona l'utente bannato
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363418973546282@newsletter",
                serverMessageId: '',
                newsletterName: botNewsletterName
            }
        }
    }, { quoted: quotedMessage }); // Quota il messaggio con la thumbnail e vCard
};

handler.command = /^banuser$/i;
handler.owner = true; // Solo l'owner può usare questo comando

export default handler;
