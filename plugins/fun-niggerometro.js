import fetch from 'node-fetch'; // Make sure fetch is imported

let handler = m => m; // Standard handler definition
handler.all = async function (m) {
    // Access chat data from global.db
    let chatData = global.db.data.chats[m.chat];

    // Check if it's a group and if 'bestemmiometro' is enabled for this chat
    // 'bestemmiometro' acts as the toggle for this profanity filter
    if (!m.isGroup || !chatData.bestemmiometro) {
        return null; // Do nothing if not a group or feature is disabled
    }

    // Regular expression to detect "n-words" (case-insensitive)
    const nWordRegex = /(?:nigger|negro|negra|niggeriano|niger|nigga)/i;

    // Check if the message text contains any of the defined "n-words"
    if (nWordRegex.test(m.text)) {
        // Access user data from global.db
        const userData = global.db.data.users[m.sender];

        // Initialize 'nigger' count if it doesn't exist, then increment
        userData.nigger = (userData.nigger || 0) + 1;

        let messageText;
        if (userData.nigger === 1) {
            messageText = `@${m.sender.split('@')[0]} 𝐡𝐚 𝐝𝐞𝐭𝐭𝐨 𝐥𝐚 𝐬𝐮𝐚 𝐩𝐫𝐢𝐦𝐚 𝐧-𝐰𝐨𝐫𝐝`;
        } else {
            messageText = `@${m.sender.split('@')[0]} 𝐡𝐚 𝐝𝐞𝐭𝐭𝐨 ${userData.nigger} 𝐧-𝐰𝐨𝐫𝐝`;
        }

        // Fetch the thumbnail for the 'Niggerometro' embed
        let niggerometroThumbnail;
        try {
            niggerometroThumbnail = await (await fetch("https://telegra.ph/file/ba01cc1e5bd64ca9d65ef.jpg")).buffer();
        } catch (e) {
            console.error("Errore nel caricamento dell'immagine del Niggerometro:", e);
            niggerometroThumbnail = Buffer.from(''); // Use an empty buffer if image fails to load
        }

        // Prepare the 'quoted' message options with the locationMessage embed
        let quotedMessageOptions = {
            key: {
                participants: "0@s.whatsapp.net",
                fromMe: false,
                id: "NiggerometroAlert" // Unique ID for this quoted message
            },
            message: {
                locationMessage: {
                    name: "𝐍𝐢𝐠𝐠𝐞𝐫𝐨𝐦𝐞𝐭𝐫𝐨", // Name displayed in the embed
                    jpegThumbnail: niggerometroThumbnail, // The image buffer
                    vcard: "BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\nX-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD"
                }
            },
            participant: '0@s.whatsapp.net'
        };

        // Send the message to the chat
        await conn.sendMessage(m.chat, {
            text: messageText,
            mentions: [m.sender] // Explicitly mention the sender
        }, {
            quoted: quotedMessageOptions // Use the prepared embed as the quoted message
        });
    }
};

export default handler;

// The pickRandom function seems unused in this specific handler, but can remain if used elsewhere
function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}
