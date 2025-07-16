// Crediti by Gabs

// Questi import non sono direttamente usati nell'handler, ma sono stati mantenuti
// per coerenza con il tuo setup, nel caso siano utili in altre parti del bot.
import 'os';
import 'util';
import 'human-readable';
import '@whiskeysockets/baileys';
import 'fs';
import 'perf_hooks';

// Ho rimosso l'offuscamento e ho ricostruito la logica.
// La funzione _0x6970 e il suo IIFE non sono più necessari.

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
    // Stringhe usate nel codice originale, ora chiare
    const addOwnerCommand = 'addowner';
    const removeOwnerCommand = 'rowner';
    const successMessage = '𝐐𝐮𝐞𝐬𝐭𝐨 𝐧𝐮𝐦𝐞𝐫𝐨 𝐞́ 𝐬𝐭𝐚𝐭𝐨 𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨 𝐚𝐥𝐥𝐚 𝐥𝐢𝐬𝐭𝐚 𝐝𝐞𝐠𝐥𝐢 𝐨𝐰𝐧𝐞𝐫';
    const removeSuccessMessage = '𝐐𝐮𝐞𝐬𝐭𝐨 𝐧𝐮𝐦𝐞𝐫𝐨 𝐞́ 𝐬𝐭𝐚𝐭𝐨 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥𝐥𝐚 𝐥𝐢𝐬𝐭𝐚 𝐝𝐞𝐠𝐥𝐢 𝐨𝐰𝐧𝐞𝐫';
    const vcardString = `BEGIN:VCARD
VERSION:3.0
N:;Unlimited;;;
FN:Unlimited
ORG:Unlimited
TITLE:
item1.TEL;waid=15395490858:+1 (539) 549-0858
item1.X-ABLabel:Unlimited
X-WA-BIZ-DESCRIPTION:ofc
X-WA-BIZ-NAME:Unlimited
END:VCARD`;

    // Costruisci l'esempio di utilizzo del comando
    const example = `
╭⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》
┊ 💡 *ESEMPIO DI UTILIZZO*
┊ ──────────────────────
┊ ✧‌⃟ᗒ \`${usedPrefix}${command} @${m.sender.split('@')[0]}\`
┊ ✧‌⃟ᗒ \`${usedPrefix}${command} ${m.sender.split('@')[0]}\`
┊ ✧‌⃟ᗒ \`${usedPrefix}${command} (rispondendo a un messaggio)\`
╰⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》
`;

    // Determina il target (JID) per l'aggiunta/rimozione
    let target = m.mentionedJid[0] 
        ? m.mentionedJid[0] 
        : m.quoted 
            ? m.quoted.sender 
            : text 
                ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' // Pulisce il testo e aggiunge il suffisso JID
                : false;

    // Se non è stato specificato un target, invia l'esempio
    if (!target) {
        return conn.reply(m.chat, example, m, { 
            mentions: [m.sender] // Menzione il mittente nell'esempio
        });
    }

    // Oggetto messaggio base per la quotazione
    let baseMessage = {
        key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'Halo' }, // ID generico
        message: { extendedTextMessage: { text: '𝐂𝐨𝐦𝐚𝐧𝐝𝐨 𝐞𝐬𝐞𝐠𝐮𝐢𝐭𝐨 ✓', vcard: vcardString } },
        participant: '0@s.whatsapp.net',
    };

    switch (command) {
        case addOwnerCommand: // Comando 'addowner'
            // Aggiungi il numero alla lista globale degli owner
            // Assicurati che 'global.owner' sia un array e che ogni elemento sia un array di un elemento [JID]
            // Se global.owner non è inizializzato, potresti doverlo fare altrove.
            // Esempio: global.owner = global.owner || [];
            global.owner.push([target.split('@')[0]]); // Aggiunge solo il numero senza il '@s.whatsapp.net'

            await conn.reply(
                m.chat,
                successMessage,
                baseMessage // Usa l'oggetto baseMessage per la quotazione
            );
            break;

        case removeOwnerCommand: // Comando 'rowner'
            // Rimuovi il numero dalla lista globale degli owner
            const numberToRemove = target.split('@')[0]; // Rimuovi solo il numero senza il '@s.whatsapp.net'
            const index = global.owner.findIndex((ownerEntry) => ownerEntry[0] === numberToRemove);

            if (index !== -1) {
                global.owner.splice(index, 1); // Rimuovi l'elemento dall'array
                await conn.reply(
                    m.chat,
                    removeSuccessMessage,
                    baseMessage // Usa l'oggetto baseMessage per la quotazione
                );
            } else {
                await conn.reply(
                    m.chat,
                    '𝐐𝐮𝐞𝐬𝐭𝐨 𝐧𝐮𝐦𝐞𝐫𝐨 𝐧𝐨𝐧 𝐞́ 𝐩𝐫𝐞𝐬𝐞𝐧𝐭𝐞 𝐧𝐞𝐥𝐥𝐚 𝐥𝐢𝐬𝐭𝐚 𝐝𝐞𝐠𝐥𝐢 𝐨𝐰𝐧𝐞𝐫.', // Messaggio se il numero non è trovato
                    baseMessage
                );
            }
            break;
    }
};

handler.help = ["addowner", "rowner"];
handler.tags = ['owner']; // Aggiunto tag 'owner'
handler.command = /^(addowner|rowner)$/i; // Supporta entrambi i comandi

export default handler;

// La funzione clockString non è usata in questo handler, quindi la si può rimuovere
// se non è utilizzata altrove. L'ho rimossa dal file finale per pulizia.
/*
function clockString(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}
*/
