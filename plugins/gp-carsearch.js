import '@whiskeysockets/baileys'; // Importa le dipendenze necessarie per Baileys
import fetch from 'node-fetch';    // Necessario per effettuare richieste HTTP

// Handler principale del comando
let handler = async (m, { conn, text, usedPrefix }) => {
    const chatId = m.chat;

    if (!text) {
        return conn.reply(chatId, `🚗 *Specifiche Auto*\n\nPer ottenere le specifiche di un'auto, usa:\n\`${usedPrefix}car <modello_auto>\`\n\nEsempio: \`${usedPrefix}car Ferrari Roma\``, m);
    }

    const carModel = text.trim();
    let specs = {};
    let abstractText = ''; // Per memorizzare il testo astratto da DuckDuckGo

    try {
        // --- Ricerca delle specifiche dell'auto tramite DuckDuckGo Instant Answer API ---
        // Questa API è pensata per risposte dirette e "zero-click", non per scraping di pagine intere.
        // La sua efficacia per specifiche auto dettagliate potrebbe essere limitata.
        const duckduckgoQuery = `${carModel} specifiche auto scheda tecnica`;
        // 't=mybot' è un parametro di identificazione, puoi cambiarlo.
        const duckduckgoUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(duckduckgoQuery)}&format=json&pretty=1&t=mybot`;

        const response = await fetch(duckduckgoUrl);
        const data = await response.json();

        // L'API di DuckDuckGo Instant Answer restituisce 'AbstractText' o 'Abstract'
        if (data && data.AbstractText) {
            abstractText = data.AbstractText;
        } else if (data && data.Abstract) {
            abstractText = data.Abstract;
        } else {
            // Se non troviamo un abstract, significa che non ha una risposta diretta.
            return conn.reply(chatId, `❌ Non sono riuscito a trovare risposte dirette per "${carModel}" tramite DuckDuckGo. Prova con un modello più comune o riprova più tardi.`, m);
        }

        // Estrazione delle specifiche dal testo raccolto (euristica)
        // Questa estrazione è basata su pattern comuni e potrebbe non essere perfetta per tutti i modelli.
        // La precisione dipende dalla qualità della risposta di DuckDuckGo.
        specs.engine = abstractText.match(/motore:\s*([^,.\n]+)/i)?.[1]?.trim() || 'Non disponibile';
        specs.horsepower = abstractText.match(/(\d+)\s*cv|(\d+)\s*hp/i)?.[1] || abstractText.match(/potenza:\s*(\d+)/i)?.[1] || 'Non disponibile';
        specs.torque = abstractText.match(/(\d+)\s*nm/i)?.[1] || 'Non disponibile';
        specs.acceleration = abstractText.match(/0-100\s*km\/h\s*in\s*(\d+\.?\d*)\s*s/i)?.[1] || 'Non disponibile';
        specs.topSpeed = abstractText.match(/velocità\s*massima:\s*(\d+)\s*km\/h/i)?.[1] || 'Non disponibile';
        specs.consumption = abstractText.match(/consumo\s*medio:\s*(\d+\.?\d*)\s*l\/100km/i)?.[1] || abstractText.match(/consumo:\s*(\d+\.?\d*)\s*km\/l/i)?.[1] ? `${abstractText.match(/consumo:\s*(\d+\.?\d*)\s*km\/l/i)[1]} km/l` : 'Non disponibile';
        specs.dimensions = abstractText.match(/(lunghezza|dimensioni):\s*([^.\n]+)/i)?.[2]?.trim() || 'Non disponibile';
        specs.trunkVolume = abstractText.match(/bagagliaio:\s*(\d+)\s*l/i)?.[1] || 'Non disponibile';
        specs.seats = abstractText.match(/posti:\s*(\d+)/i)?.[1] || 'Non disponibile';
        specs.transmission = abstractText.match(/cambio:\s*([^,.\n]+)/i)?.[1]?.trim() || 'Non disponibile';
        specs.fuelType = abstractText.match(/alimentazione:\s*([^,.\n]+)/i)?.[1]?.trim() || 'Non disponibile';


        // --- Costruzione del messaggio di risposta ---
        let responseMessage = `🚗 *Specifiche Auto: ${carModel}*

*Motore:* ${specs.engine}
*Potenza:* ${specs.horsepower} CV
*Coppia:* ${specs.torque} Nm
*Accelerazione 0-100 km/h:* ${specs.acceleration} s
*Velocità Massima:* ${specs.topSpeed} km/h
*Consumo Medio:* ${specs.consumption}
*Dimensioni:* ${specs.dimensions}
*Volume Bagagliaio:* ${specs.trunkVolume} L
*Posti:* ${specs.seats}
*Cambio:* ${specs.transmission}
*Alimentazione:* ${specs.fuelType}

---

⚠️ *Nota sui Prezzi dei Componenti:*
Non è possibile fornire un elenco esaustivo e in tempo reale dei prezzi di ogni singolo componente tramite questa funzione. Questi dati sono specifici per produttore, modello, anno e mercato, e sono solitamente disponibili presso concessionari ufficiali, ricambisti specializzati o tramite database professionali.

Per prezzi di componenti specifici, si consiglia di consultare:
•  Siti web ufficiali dei produttori
•  Ricambisti auto autorizzati
•  Concessionari o officine specializzate
`;

        // --- PREPARA E INVIA IL MESSAGGIO CON EMBED E MOSTRA CANALE ---
        const thumbnailUrl = "https://i.ibb.co/vCsZYV3p/scroll-1f4dc.webp"; // Immagine per l'embed
        let thumbnailBuffer;
        try {
            thumbnailBuffer = await (await fetch(thumbnailUrl)).buffer();
        } catch (e) {
            console.error("Errore nel download della thumbnail:", e);
            thumbnailBuffer = Buffer.from('');
        }

        await conn.sendMessage(chatId, {
            text: responseMessage.trim(),
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363419284785624@newsletter', // Sostituisci con il tuo JID newsletter
                    serverMessageId: '',
                    newsletterName: "GiuseMD-V3 → Auto Specs" // Nome del canale/newsletter
                },
                externalAdReply: { // L'embed visivo
                    title: `🚗 ${carModel} - Specifiche`,
                    body: `Dettagli tecnici del veicolo.`,
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    previewType: "PHOTO",
                    thumbnail: thumbnailBuffer,
                    sourceUrl: 'https://wa.me/' + conn.user.jid.split('@')[0] // Link del bot
                }
            }
        }, { quoted: m }); // Quota il messaggio originale per un contesto
        
    } catch (error) {
        console.error("Errore nel comando .car:", error);
        conn.reply(chatId, `❌ Si è verificato un errore durante la ricerca delle specifiche per "${carModel}". Prova con un modello diverso o riprova più tardi. Dettagli: ${error.message}`, m);
    }
};

handler.help = ['car <model>'];
handler.tags = ['info', 'tools'];
handler.command = /^(car)$/i;

export default handler;
