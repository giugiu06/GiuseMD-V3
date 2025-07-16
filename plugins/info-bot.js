import os from 'os';
import { performance } from 'perf_hooks'; 
import bytes from 'bytes';
import { exec } from 'child_process'; 
import { promisify } from 'util'; 

const execPromise = promisify(exec);

const toMathematicalAlphanumericSymbols = text => {
    const map = {
    'A': '𝑨', 'B': '𝑩', 'C': '𝑪', 'D': '𝑫', 'E': '𝑬', 'F': '𝑭', 'G': '𝑮', 'H': '𝑯', 'I': '𝑰', 'J': '𝑱', 
    'K': '𝑲', 'L': '𝑳', 'M': '𝑴', 'N': '𝑵', 'O': '𝑶', 'P': '𝑷', 'Q': '𝑸', 'R': '𝑹', 'S': '𝑺', 'T': '𝑻', 
    'U': '𝑼', 'V': '𝑽', 'W': '𝑾', 'X': '𝑿', 'Y': '𝒀', 'Z': '𝒁'
  } 
  return text.split('').map(char => map[char.toUpperCase()] || char).join('')
}

let handler = async (m, { conn, usedPrefix }) => {
  const botName = "GiuseMD-V3";
  const ownerName = "Giuse";
  const description = "Per la versione *3* di GiuseMD abbiamo deciso di fondarla sul minimalismo! Se hai qualche curiosità su quest'ultimo contatta un owner!";

  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  let diskInfoFormatted = 'Info disco non disponibile.';

  try {
    const { stdout, stderr } = await execPromise('df -h /');
    if (stderr) {
      console.error(`Errore stderr dal comando 'df -h /': ${stderr}`);
      diskInfoFormatted = `Errore recupero disco: ${stderr.trim().split('\n')[0]}`;
    } else {
      const lines = stdout.trim().split('\n');
      if (lines.length > 1) {
        const dataLine = lines[1];
        const parts = dataLine.split(/\s+/);

        if (parts.length >= 5) {
          const totalDisk = parts[1];
          const usedDisk = parts[2];
          const availableDisk = parts[3];
          const usagePercent = parts[4];

          diskInfoFormatted = `Totale: ${totalDisk}\nUsato: ${usedDisk} (${usagePercent})\nLibero: ${availableDisk}`;
        } else {
          diskInfoFormatted = 'Formato output disco non riconosciuto.';
          console.error('Formato output `df -h /` inatteso:', dataLine);
        }
      } else {
        diskInfoFormatted = 'Nessuna informazione disco valida trovata.';
      }
    }
  } catch (error) {
    console.error(`Errore nell'esecuzione del comando 'df -h /': ${error.message}`);
    diskInfoFormatted = `Errore esecuzione comando: ${error.message.trim().split('\n')[0]}`;
  }

  const uptime = clockString(process.uptime() * 1000);

  const prettyUsedMem = bytes(usedMem);
  const prettyTotalMem = bytes(totalMem);

  const infoText = `
═══════ *${toMathematicalAlphanumericSymbols("G I U S E M D")}* ═══════

🤖 Nome Bot: *${botName}*
👑 Creatore: *${ownerName}*
📝 Descrizione: _${description}_

═══════════════

📊 *Statistiche Sistema:*
🧠 RAM Utilizzata: ${prettyUsedMem} / ${prettyTotalMem}
⏰ Online da: ${uptime}

═══════════════

💾 *Memoria Interna (Disco):*
${diskInfoFormatted}

═══════════════

> _Tocca qui sotto per saperne di più!_ 👇
`.trim();

  const profilePicBuffer = await (await fetch("https://telegra.ph/file/22b3e3d2a7b9f346e21b3.png")).buffer();

  await conn.sendMessage(m.chat, { // Usiamo m.chat per l'ID della chat
    text: infoText, // Usiamo infoText per il messaggio
    contextInfo: {
      // Non includiamo mentionedJid qui a meno che non sia specificamente necessario per questo comando
      forwardingScore: 1,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363419284785624@newsletter', // Sostituisci con il tuo JID newsletter se applicabile
        serverMessageId: '',
        newsletterName: "GiuseMD-V3 → Info Bot" // O il nome appropriato per info bot
      },
      externalAdReply: {
        title: `🚀 ${botName} - Il Tuo Assistente!`, // Titolo invitante e pulito
        body: `Per la versione *3* di GiuseMD abbiamo deciso di fondarla sul minimalismo! Se hai qualche curiosità su quest'ultimo contatta un owner!`, // Breve, incuriosisce all'apertura
        mediaType: 1,
        renderLargerThumbnail: false,
        previewType: "PHOTO",
        thumbnail: profilePicBuffer,
        sourceUrl: 'https://wa.me/+19173829810' // Sostituisci con un link reale (es. gruppo, sito info)
      }
    }
  });
};

handler.help = ["infobot"];
handler.tags = ['info'];
handler.command = /^(infobot|status|stats)$/i;

export default handler;

function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}