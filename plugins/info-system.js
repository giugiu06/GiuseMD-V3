import os from 'os';
import { execSync } from 'child_process';

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getDiskSpace = () => {
    try {
        // Tenta di ottenere lo spazio su disco per sistemi Linux/Unix.
        // Cerca la riga che inizia con '/dev/root' o '/dev/sda1'.
        const stdout = execSync('df -h | grep -E "^/dev/root|^/dev/sda1"').toString();
        // Estrae i valori rilevanti dalla riga di output.
        const [ , size, used, available, usePercent ] = stdout.split(/\s+/);
        return { size, used, available, usePercent };
    } catch (error) {
        console.error('❌ Errore nel recupero dello spazio su disco:', error);
        return null; // Ritorna null in caso di errore
    }
};

const handler = async (m, { conn }) => {
    // Recupera le informazioni sulla memoria RAM
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // Recupera l'uptime del processo del bot
    const uptimeMillis = process.uptime() * 1000;
    const formattedUptime = clockString(uptimeMillis);

    // Recupera le informazioni del sistema operativo
    const hostname = os.hostname();
    const platform = os.platform();
    const arch = os.arch();

    // Recupera l'utilizzo della memoria da parte del processo Node.js
    const nodeMemoryUsage = process.memoryUsage();

    // Recupera le informazioni sullo spazio su disco
    const diskSpace = getDiskSpace();

    // Costruisci il messaggio formattato con lo stile "cornice"
    let systemInfoMessage = `╭⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》
┊ ⚙️ *STATO DEL SISTEMA*
┊ ──────────────────────
┊ 🚩 *Host:* GiuseMD-V2 OFFICIAL
┊ 🏆 *Sistema Operativo:* ${platform}
┊ 💫 *Architettura:* ${arch}
┊ ──────────────────────
┊ 🥷 *RAM Totale:* ${formatBytes(totalMem)}
┊ 🚀 *RAM Libera:* ${formatBytes(freeMem)}
┊ ⌛ *RAM Usata:* ${formatBytes(usedMem)}
┊ 🕒 *Uptime Bot:* ${formattedUptime}
┊ ──────────────────────
┊ 🪴 *Memoria Node.js:*
┊  → RSS: ${formatBytes(nodeMemoryUsage.rss)}
┊  → Heap Totale: ${formatBytes(nodeMemoryUsage.heapTotal)}
┊  → Heap Usata: ${formatBytes(nodeMemoryUsage.heapUsed)}
┊  → Esterna: ${formatBytes(nodeMemoryUsage.external)}
┊  → ArrayBuffer: ${formatBytes(nodeMemoryUsage.arrayBuffers)}
`;

    // Aggiungi le informazioni sullo spazio su disco solo se disponibili
    if (diskSpace) {
        systemInfoMessage += `┊ ──────────────────────
┊ ☁️ *Spazio su Disco:*
┊  → Totale: ${diskSpace.size}
┊  → Usato: ${diskSpace.used}
┊  → Disponibile: ${diskSpace.available}
┊  → Percentuale di Uso: ${diskSpace.usePercent}
`;
    } else {
        systemInfoMessage += `┊ ──────────────────────
┊ ❌ *Spazio su Disco: Errore nel recupero dei dati.*
`;
    }

    systemInfoMessage += `╰⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》`;

    // Invia il messaggio
    await conn.reply(m.chat, systemInfoMessage, m);
};

// Funzione helper per formattare l'uptime
function clockString(ms) {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

handler.help = ['sistema', 'system'];
handler.tags = ['info'];
handler.command = ['system', 'sistema'];

export default handler;
