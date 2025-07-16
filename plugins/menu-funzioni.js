import '@whiskeysockets/baileys';
import fetch from 'node-fetch'; // Necessario per fetchare le immagini

let handler = async (m, { conn, usedPrefix }) => {
    // Estrai lo stato di TUTTE le funzionalità dalla configurazione della chat
    // Assicurati che global.db.data.chats[m.chat] esista e contenga queste proprietà.
    // È buona pratica fornire un valore di fallback (es. false) se non garantito.
    const chatSettings = global.db.data.chats[m.chat] || {};

    const {
        antiToxic = false,
        antilinkhard = false,
        antiPrivate = false,
        antitraba = false,
        antiArab = false,
        antiviewonce = false,
        isBanned = false, 
        welcome = false,
        detect = false,
        sWelcome = false, 
        sBye = false,
        sPromote = false,
        sDemote = false,
        antiLink = false,
        antilinkbase = false,
        antitiktok = false,
        sologruppo = false,
        soloprivato = false,
        antiCall = false,
        modohorny = false,
        gpt = false,
        antiinsta = false,
        antielimina = false,
        antitelegram = false,
        antiSpam = false,
        antiPorno = false,
        jadibot = false,
        autosticker = false,
        modoadmin = false,
        audios = false
    } = chatSettings;

    // Prepara la thumbnail per l'embed
    // Assicurati che l'URL sia valido e accessibile.
    const thumbnail = await (await fetch("https://qu.ax/cSqEs.jpg")).buffer().catch(() => Buffer.from('')); 

    // Prepara il nome del bot per il footer della newsletter
    const botNewsletterName = ' GiuseMD-V3 → Funzioni ';
    const newsletterJid = "120363419284785624@newsletter"; // Il JID del tuo canale/newsletter

    // Costruisci il testo del menu con lo stile minimalista
    let menuText = `⚙️ *STATO DELLE FUNZIONALITÀ* ⚙️

${detect ? '✅' : '❌'} *detect* 🔍
${gpt ? '✅' : '❌'} *gpt* 🤖
${welcome ? '✅' : '❌'} *welcome* 👋🏻
${sologruppo ? '✅' : '❌'} *sologruppo* 👥
${soloprivato ? '✅' : '❌'} *soloprivato* 👤
${modoadmin ? '✅' : '❌'} *modoadmin* 👑
${antiCall ? '✅' : '❌'} *antiCall* 📵
${antiLink ? '✅' : '❌'} *antiLink* 🔗
${antiinsta ? '✅' : '❌'} *antiinsta* 📸
${antielimina ? '✅' : '❌'} *antielimina* ✏️
${antilinkhard ? '✅' : '❌'} *antilinkhard* ⛓️
${antiPrivate ? '✅' : '❌'} *antiPrivate* 🔒
${antitraba ? '✅' : '❌'} *antitraba* 🚧
${antiviewonce ? '✅' : '❌'} *antiviewonce* 👁️‍🗨️
${antitiktok ? '✅' : '❌'} *antitiktok* 🎶
${antitelegram ? '✅' : '❌'} *antitelegram* ✈️
${antiSpam ? '✅' : '❌'} *antiSpam* ✉️
${antiPorno ? '✅' : '❌'} *antiPorno* 🍑
${jadibot ? '✅' : '❌'} *jadibot* 🤖
${autosticker ? '✅' : '❌'} *autosticker* 🖼️
${audios ? '✅' : '❌'} *audios* 🔊

ℹ️ *Info sulle funzioni:*
✅ » Funzione attivata
❌ » Funzione disattivata

🛠️ *Uso del comando:*
✅ » \`${usedPrefix}attiva [funzione]\`
❌ » \`${usedPrefix}disabilita [funzione]\`

⚙️ *Info sullo stato del bot:*
🔍 » \`${usedPrefix}infostato\`

> _Tocca qui sotto per saperne di più!_ 👇
`;

    // Invia il messaggio
    conn.sendMessage(m.chat, {
        text: menuText.trim(),
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: newsletterJid, // Il JID del canale
                serverMessageId: '', // Lascia vuoto
                newsletterName: botNewsletterName // Il nome che apparirà come "mostra canale"
            },
            externalAdReply: {
                title: `⚙️ Stato Funzionalità - ${conn.user.name || 'Bot'}`, // Titolo dell'embed
                body: `Tocca qui per saperne di più!`, // Testo sotto il titolo dell'embed
                mediaType: 1, // Tipo di media (1 per immagine)
                renderLargerThumbnail: false, // Non renderizzare la thumbnail più grande
                previewType: "PHOTO", // Tipo di anteprima
                thumbnail: thumbnail, // La thumbnail scaricata
                sourceUrl: 'https://wa.me/' + conn.user.jid.split('@')[0] // Link del bot
            }
        }
    }); // Rimosso { quoted: fakeMessage }
};

handler.help = ["funzioni"];
handler.tags = ["main", "info"]; 
handler.command = /^(funzioni)$/i;

export default handler;
