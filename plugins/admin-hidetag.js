import '@whiskeysockets/baileys';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, participants }) => {
    try {
        let allParticipantsJids = participants.map(u => conn.decodeJid(u.id));

        let senderMention = `@${m.sender.split('@')[0]}`;
        
        let quotedMention = m.quoted ? `> ? *Citato da:* @${m.quoted.sender.split('@')[0]}` : '';
        
        let messageContent = text || (m.quoted ? m.quoted.text : "");

        let formattedMessage = ` ` + (messageContent || '*_Nessun contenuto_*}') + ` `;

        let thumbnailUrl = "https://i.ibb.co/vCsZYV3p/scroll-1f4dc.webp";

        let thumbnailBuffer;
        try {
            thumbnailBuffer = await (await fetch(thumbnailUrl)).buffer();
        } catch (e) {
            thumbnailBuffer = Buffer.from('');
        }

        let locationEmbed = {
            key: {
                participants: "0@s.whatsapp.net",
                remoteJid: "status@broadcast",
                fromMe: false,
                id: "HideTagMessage"
            },
            message: {
                locationMessage: {
                    name: "GiuseMD-V3 -> Menzione Nascosta",
                    jpegThumbnail: thumbnailBuffer,
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

        let quotedMessage = m.quoted || m;
        let mimeType = (quotedMessage.msg || quotedMessage).mimetype || "";
        let isMedia = /image|video|sticker|audio/.test(mimeType);

        let messageOptions = { mentions: allParticipantsJids, caption: formattedMessage };

        if (isMedia) {
            let mediaBuffer = await quotedMessage.download();

            if (/image/.test(mimeType)) {
                await conn.sendMessage(m.chat, { image: mediaBuffer, ...messageOptions }, { quoted: locationEmbed });
            } else if (/video/.test(mimeType)) {
                await conn.sendMessage(m.chat, { video: mediaBuffer, ...messageOptions, mimetype: "video/mp4" }, { quoted: locationEmbed });
            } else if (/audio/.test(mimeType)) {
                await conn.sendMessage(m.chat, { audio: mediaBuffer, ...messageOptions, mimetype: "audio/mp4", fileName: "Hidetag.mp3" }, { quoted: locationEmbed });
            } else if (/sticker/.test(mimeType)) {
                await conn.sendMessage(m.chat, { sticker: mediaBuffer, mentions: allParticipantsJids }, { quoted: locationEmbed });
            }
        } else {
            await conn.sendMessage(m.chat, { text: formattedMessage, mentions: allParticipantsJids }, { quoted: locationEmbed });
        }
    } catch (error) {
        console.error("Errore nel comando .hidetag:", error);
        conn.reply(m.chat, "? Errore nell'esecuzione del comando! Assicurati che il bot sia amministratore e che il comando venga usato correttamente.", m);
    }
};

handler.command = /^(hidetag|tag)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
