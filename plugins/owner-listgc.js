import '@whiskeysockets/baileys'; 
import fs from 'fs'; 
import path from 'path'; 

// Definisci il percorso del file JSON per salvare i dati dei gruppi
const groupsDbPath = path.join(process.cwd(), 'linkgruppi.json');

// Definisci un ritardo MAGGIORE per le chiamate API per prevenire l'overlimit
const API_CALL_DELAY_MS = 1000; // Ritardo in millisecondi (1 secondo)

let handler = async (m, { conn, isOwner, args }) => {
    if (!isOwner) {
        return conn.reply(m.chat, `🚫 *ACCESSO NEGATO* 🚫
Questo comando può essere usato solo dal *proprietario* del bot.`, m);
    }

    let targetChat = m.chat; 
    let sendPrivatelyFromGroup = false;

    if (m.isGroup) {
        targetChat = m.sender; 
        sendPrivatelyFromGroup = true;
    }

    try {
        const rawGroups = Object.values(await conn.groupFetchAllParticipating());
        const totalGroups = rawGroups.length;

        const allGroupsFormatted = [];
        for (const group of rawGroups) {
            let inviteLink = 'N/A';
            try {
                // *** AGGIUNTA QUI: INTRODUZIONE DEL RITARDO MAGGIORE ***
                await new Promise(resolve => setTimeout(resolve, API_CALL_DELAY_MS)); 
                
                const inviteCode = await conn.groupInviteCode(group.id);
                inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
            } catch (e) {
                console.error(`Impossibile ottenere il link di invito per il gruppo "${group.subject}" (${group.id}):`, e.message);
                if (e.message.includes('overlimit') || e.message.includes('too many requests')) {
                    inviteLink = 'Link non disponibile (Limite di richieste raggiunto)';
                } else if (e.message.includes('forbidden') || e.message.includes('not-authorized')) {
                    inviteLink = 'Link non disponibile (il bot non è admin o non autorizzato)';
                } else {
                    inviteLink = 'Link non disponibile (errore sconosciuto)';
                }
            }
            
            allGroupsFormatted.push({
                subject: group.subject,
                participants: group.participants.length,
                description: group.desc || 'Nessuna descrizione',
                link: inviteLink,
                id: group.id
            });
        }

        const jsonOutput = allGroupsFormatted.map(g => ({
            Nome: g.subject,
            Membri: g.participants,
            Descrizione: g.description,
            Link: g.link
        }));

        try {
            await fs.promises.writeFile(groupsDbPath, JSON.stringify(jsonOutput, null, 2));
            console.log(`Dati dei gruppi aggiornati e salvati in ${groupsDbPath}`);
        } catch (fileError) {
            console.error(`Errore nel salvataggio dei dati dei gruppi in JSON:`, fileError);
        }

        const groupsPerPage = 15;
        let page = parseInt(args[0]) || 1; 
        if (page < 1) page = 1; 

        const totalPages = Math.ceil(totalGroups / groupsPerPage);

        if (page > totalPages && totalPages > 0) {
            page = totalPages;
        } else if (totalPages === 0 && page === 1) {
            // Nessun gruppo trovato, la pagina 1 è corretta
        } else if (totalPages === 0) { 
            page = 1; 
        }

        const startIndex = (page - 1) * groupsPerPage;
        const endIndex = startIndex + groupsPerPage;
        const paginatedGroups = allGroupsFormatted.slice(startIndex, endIndex); 

        const botName = conn.user.name || 'Bot'; 

        let responseMessage = `📋 *LISTA GRUPPI BOT* 📋
🤖 *Nome Bot:* ${botName}
📊 *Gruppi Totali:* ${totalGroups}
`;
        if (totalGroups > 0) {
            responseMessage += `
*Pagina ${page}/${totalPages}*`;
        } else {
            responseMessage += `
_Nessun gruppo trovato._`;
        }
        responseMessage += `\n`; 

        if (paginatedGroups.length > 0) {
            for (let i = 0; i < paginatedGroups.length; i++) {
                const group = paginatedGroups[i];
                responseMessage += `
*─── Gruppo N°${startIndex + i + 1} ───*
📝 *Nome:* ${group.subject}
👥 *Membri:* ${group.participants}
🆔 *ID:* ${group.id}
🔗 *Link:* ${group.link}
`;
            }
        }

        if (totalPages > 1) {
            responseMessage += `
*─── Navigazione Pagine ───*
➡️ Usa *.listgc ${page + 1 > totalPages ? totalPages : page + 1}* per la prossima pagina.
⬅️ Usa *.listgc ${page - 1 < 1 ? 1 : page - 1}* per la pagina precedente.`;
        }

        await conn.reply(targetChat, responseMessage.trim(), m);

        if (sendPrivatelyFromGroup) {
            await conn.reply(m.chat, `📝 La lista dei gruppi è stata inviata nella tua chat privata.`, m);
        }

    } catch (e) {
        console.error('Errore durante il recupero o il salvataggio dei gruppi:', e);
        await conn.reply(targetChat, `❌ *ERRORE!* ❌
Si è verificato un errore durante il recupero della lista dei gruppi o il salvataggio dei dati. Riprova più tardi.`, m);
        
        if (sendPrivatelyFromGroup) {
            await conn.reply(m.chat, `❌ Si è verificato un errore durante l'esecuzione del comando. Controlla la tua chat privata.`, m);
        }
    }
};

handler.command = /^(listgc)$/i;
handler.owner = true;
handler.fail = null;

export default handler;