import fetch from 'node-fetch';

export function getRole(userId, userDisplayName, groupAdmins, botJid) {
    if (global.owner.some(o => o[0] === userId.split('@')[0])) {
        return '👑 OWNER';
    }
    
    if (userDisplayName && (userDisplayName.includes('#FROST') || userDisplayName.includes('#frost'))) {
        return '❄️ FROST STAN';
    }
    
    if (userDisplayName && (userDisplayName.includes('#SPAWN') || userDisplayName.includes('#spawn'))) {
        return '꥟ SPAWN STAN';
    }

    if (groupAdmins && groupAdmins.includes(userId)) {
        return '🔨 ADMIN';
    }

    if (userId === botJid) {
        return '🤖 BOT';
    }

    if (global.db.data.users[userId] && global.db.data.users[userId].role === '🚫 BANNED') {
        return '🚫 BANNED';
    }

    return '👤 UTENTE';
}

let handler = async (m, { conn, text, participants, isAdmin }) => {
    try {
        let userId;
        let isSender = false;

        if (text) {
            userId = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            if (!global.db.data.users[userId]) {
                throw '*L\'utente taggato non è registrato nel database.*';
            }
        } else if (m.quoted && m.quoted.sender) {
            userId = m.quoted.sender;
            if (!global.db.data.users[userId]) {
                throw '*L\'utente a cui hai risposto non è registrato nel database.*';
            }
        } else {
            userId = m.sender;
            isSender = true;
        }

        let userData = global.db.data.users[userId];
        
        if (!userData) {
            global.db.data.users[userId] = {
                name: (await conn.getName(userId)) || 'Sconosciuto',
                messaggi: 0,
                warn: 0,
                blasphemy: 0,
                instagram: '',
                role: '👤 UTENTE'
            };
            userData = global.db.data.users[userId];
        }

        let userBlasphemy = userData.blasphemy || 0;
        let userWarns = userData.warn || 0;
        let userInstagram = userData.instagram ? `instagram.com/${userData.instagram}` : 'Non impostato';
        
        let groupAdmins = [];
        if (m.isGroup) {
            groupAdmins = participants.filter(p => p.admin).map(p => p.id);
        }
        
        let currentRole = getRole(userId, userData.name, groupAdmins, conn.user.jid);
        
        if (userData.role) {
            currentRole = userData.role;
        }

        let usernigger = userData.nigger || 0;
        
        let profileMessage = `
👤 *Utente: ${userData.name || 'Sconosciuto'}*
✨ *Ruolo: ${currentRole}* 
💬 *Messaggi: ${userData.messaggi || 0}*
⚠️ *Warns: ${userWarns}/3*
🤬 *Bestemmie: ${userBlasphemy}*
👨🏿 *N-Word:* ${usernigger}
📸 *Instagram:* ${userInstagram} 
 
> *Versione* ${global.vs || 'Sconosciuta'}
> _Tocca qui sotto per saperne di più!_ 👇
`;

        let profilePicUrl = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://telegra.ph/file/22b3e3d2a7b9f346e21b3.png');
        let imageBuffer = await fetch(profilePicUrl).then(res => res.buffer());

        await conn.sendMessage(m.chat, {
            text: profileMessage,
            contextInfo: {
                mentionedJid: [userId],
                externalAdReply: {
                    title: `👤 ${userData.name || 'Sconosciuto'} | Ruolo: ${currentRole}`,
                    body: `Messaggi: ${userData.messaggi || 0} | Ruolo: ${currentRole}`,
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    thumbnail: imageBuffer,
                    sourceUrl: `${userInstagram}`.startsWith('instagram.com') ? `https://${userInstagram}` : `https://instagram.com/${userInstagram}`
                },
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363399516098051@newsletter',
                    serverMessageId: '',
                    newsletterName: global.config?.bot?.name || 'GiuseMD-V3 → Info'
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error("Errore nel comando info:", error);
        conn.reply(m.chat, `❌ Errore nell'esecuzione del comando! ${error.message || ''}`, m);
    }
};

handler.command = /^(info)$/i;

export default handler;
