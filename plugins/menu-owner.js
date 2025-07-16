import 'os';
import 'util';
import 'human-readable';
import '@whiskeysockets/baileys';
import 'fs';
import 'perf_hooks';

let handler = async (message, { conn, usedPrefix }) => {
  const senderName = await conn.getName(message.sender);
  const targetJid = message.quoted
    ? message.quoted.sender
    : message.mentionedJid && message.mentionedJid[0]
    ? message.mentionedJid[0]
    : message.fromMe
    ? conn.user.jid
    : message.sender;

  const profilePicUrl = (await conn.profilePictureUrl(targetJid, "image").catch(() => null)) || "./src/avatar_contact.png";
  let profilePicBuffer;
  if (profilePicUrl !== "./src/avatar_contact.png") {
    profilePicBuffer = await (await fetch(profilePicUrl)).buffer();
  } else {
    profilePicBuffer = await (await fetch("https://telegra.ph/file/22b3e3d2a7b9f346e21b3.png")).buffer();
  }

  const botName = "GiuseMD-V3"; // Nome del bot fisso come richiesto

  // Menu minimalista e in italiano
  const commandList = `
- ⚙️ *Gestione Bot*

✨ ${usedPrefix}addowner
➕ ${usedPrefix}aggiungi
👑 ${usedPrefix}godmode
🔄 ${usedPrefix}azzera
🔴 ${usedPrefix}off
💾 ${usedPrefix}salva
📝 ${usedPrefix}nome
📁 ${usedPrefix}getfile
🔗 ${usedPrefix}prefisso
♻️ ${usedPrefix}riavvio
🟢 ${usedPrefix}on
🗑️ ${usedPrefix}cleartmp
🔌 ${usedPrefix}delplugin

- 👥 *Gestione Utenti*

🚫 ${usedPrefix}banlist
⛔ ${usedPrefix}banuser
🔒 ${usedPrefix}block
🔓 ${usedPrefix}unblock
📜 ${usedPrefix}blocklist

- 💬 *Gestione Gruppi*

📣 ${usedPrefix}bigtag
➡️ ${usedPrefix}join
⬅️ ${usedPrefix}out
🗒️ ${usedPrefix}listgc

- 🎙️ *Funzionalità Extra*

🎧 ${usedPrefix}podcast

> _Tocca qui sotto per saperne di più!_ 👇`
.trim();

  // Embed con titolo e corpo invitanti in italiano
  await conn.sendMessage(message.chat, {
    text: commandList,
    contextInfo: {
      mentionedJid: conn.parseMention(wm), // Assumendo che wm sia definito globalmente per le menzioni
      forwardingScore: 1,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363419284785624@newsletter', // Sostituisci con il tuo JID newsletter se applicabile
        serverMessageId: '',
        newsletterName: "GiuseMD-V3 → Menù Owner"
      },
      externalAdReply: {
        title: `🚀 ${botName} - Il Tuo Assistente!`, // Titolo invitante e pulito
        body: `Esplora tutte le funzionalità. Clicca qui!`, // Breve, incuriosisce all'apertura
        mediaType: 1,
        renderLargerThumbnail: false,
        previewType: "PHOTO",
        thumbnail: profilePicBuffer,
        sourceUrl: 'https://wa.me/+19173829810' // Sostituisci con un link reale (es. gruppo, sito info)
      }
    }
  });
};

handler.help = ["menu"];
handler.tags = ['menu'];
handler.command = /^(owner)$/i; // Comandi trigger

export default handler;

// ... (funzione clockString rimane invariata)