let handler = m => m; // Questo handler viene eseguito per ogni messaggio.

handler.all = async function (m) {
    // m.chat è il JID della chat
    const jid = m.chat;

    // Controlla se il JID appartiene a un gruppo (@g.us) o a un canale (@newsletter)
    // o se m.isChannel è true per versioni più recenti.
    const isGroup = jid.endsWith('@g.us');
    const isChannel = jid.endsWith('@newsletter') || m.isChannel; // m.isChannel come fallback

    if (isGroup || isChannel) {
        let chatType = '';
        if (isGroup) {
            chatType = 'Gruppo';
        } else if (isChannel) {
            chatType = 'Canale';
        }
        
        console.log(`JID ${chatType}: ${jid}`);
    }

    // È importante restituire 'true' per permettere ad altri handler di essere eseguiti.
    return true;
};

// Questo handler non ha un comando specifico, si attiva su ogni messaggio.
export default handler;