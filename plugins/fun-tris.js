import '@whiskeysockets/baileys'; // Necessario per i tipi Baileys, anche se non importato esplicitamente qui
import { performance } from 'perf_hooks'; // Solo se utile per debug o timing, altrimenti non strettamente necessario

// --- GLOBAL LOBBY STORAGE ---
// Questo oggetto memorizzerà tutte le lobby Tris attive.
// È CRUCIALE che 'global.trisLobbies' sia inizializzato una sola volta
// all'avvio del tuo bot (es. nel tuo main.js o index.js) per garantire la persistenza.
// Esempio nel tuo main.js:
// if (typeof global.trisLobbies === 'undefined') {
//     global.trisLobbies = {};
// }
if (typeof global.trisLobbies === 'undefined') {
    global.trisLobbies = {};
}

// --- EMOJIS E COSTANTI DI GIOCO ---
const NUM_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
const PLAYER_X_EMOJI = '❌';
const PLAYER_O_EMOJI = '⭕';
const WIN_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Righe
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colonne
    [0, 4, 8], [2, 4, 6]             // Diagonali
];

// --- FUNZIONI HELPER PER LA LOGICA DI GIOCO ---

/**
 * Formatta il tabellone di gioco come stringa di testo per WhatsApp.
 * @param {Array<string|null>} board - L'array che rappresenta il tabellone.
 * @returns {string} Il tabellone formattato.
 */
function getBoardDisplay(board) {
    let display = '';
    for (let i = 0; i < 9; i++) {
        // Se la cella è null, significa che è vuota o resetta dopo la mossa endless, mostra il numero
        const cellContent = board[i] === 'X' ? PLAYER_X_EMOJI : (board[i] === 'O' ? PLAYER_O_EMOJI : NUM_EMOJIS[i]);
        display += cellContent;
        if ((i + 1) % 3 === 0) {
            display += '\n'; // Nuova riga ogni 3 celle
        }
    }
    return display.trim();
}

/**
 * Controlla se c'è un vincitore sul tabellone.
 * @param {Array<string|null>} board - L'array che rappresenta il tabellone.
 * @param {string} playerSymbol - Il simbolo del giocatore da controllare ('X' o 'O').
 * @returns {boolean} True se il giocatore ha vinto, altrimenti false.
 */
function checkWin(board, playerSymbol) {
    const actualSymbol = playerSymbol === 'X' ? PLAYER_X_EMOJI : PLAYER_O_EMOJI;
    return WIN_COMBOS.some(combo => {
        return combo.every(index => board[index] === actualSymbol);
    });
}

/**
 * Controlla se la partita è in pareggio.
 * @param {Array<string|null>} board - L'array che rappresenta il tabellone.
 * @returns {boolean} True se è un pareggio, altrimenti false.
 */
function checkDraw(board) {
    // La partita è un pareggio se tutte le celle sono occupate (non sono numeri originali)
    // e non c'è un vincitore.
    return board.every((cell, index) => cell === PLAYER_X_EMOJI || cell === PLAYER_O_EMOJI);
}

// --- FUNZIONI DI GESTIONE LOBBY E STATO PARTITA ---

/**
 * Trova la lobby in cui si trova un giocatore specifico.
 * @param {string} playerId - Il JID del giocatore.
 * @param {string} chatId - L'ID della chat (per evitare conflitti tra chat).
 * @returns {Object|null} La lobby del giocatore o null se non è in nessuna.
 */
function getPlayerLobby(playerId, chatId) {
    for (const name in global.trisLobbies) {
        const lobby = global.trisLobbies[name];
        if ((lobby.player1 === playerId || lobby.player2 === playerId) && lobby.chatId === chatId) {
            return lobby;
        }
    }
    return null;
}

/**
 * Funzione per inviare l'aggiornamento del tabellone come messaggio embed.
 * @param {object} conn - L'oggetto di connessione Baileys.
 * @param {object} lobby - L'oggetto della lobby di gioco.
 * @param {string} statusMessage - Messaggio di stato da includere.
 * @param {boolean} isNewMessage - True se deve inviare un nuovo messaggio, False se deve editarne uno esistente.
 * @param {object} m - Il messaggio originale per contextInfo.
 */
async function sendGameUpdate(conn, lobby, statusMessage, isNewMessage, m) {
    const player1Name = await conn.getName(lobby.player1);
    const player2Name = lobby.player2 ? await conn.getName(lobby.player2) : 'In attesa...';

    let gameText = `*🎮 Partita a Tris: ${lobby.name} (${lobby.mode === 'endless' ? 'Endless' : 'Standard'})*

${player1Name} (${PLAYER_X_EMOJI}) vs ${player2Name} (${PLAYER_O_EMOJI})

${statusMessage}
`;

    // Il tabellone va nel corpo dell'embed
    const boardDisplay = getBoardDisplay(lobby.board);

    const messagePayload = {
        text: gameText.trim(),
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363419284785624@newsletter', // Sostituisci con il tuo JID newsletter
                serverMessageId: '',
                newsletterName: "GiuseMD-V3 → Tris Game"
            },
            externalAdReply: {
                title: `✨ Tris Game - ${lobby.name} ✨`,
                body: boardDisplay, // Tabellone come corpo dell'embed
                mediaType: 1,
                renderLargerThumbnail: false,
                previewType: "PHOTO",
                thumbnail: await (await fetch("https://telegra.ph/file/22b3e3d2a7b9f346e21b3.png")).buffer(), // Sostituisci con URL immagine Tris
                sourceUrl: 'https://wa.me/' + conn.user.jid.split('@')[0] // Link generale del bot
            }
        }
    };

    if (!isNewMessage && lobby.messageId) {
        messagePayload.edit = lobby.messageId;
        await conn.sendMessage(lobby.chatId, messagePayload);
    } else {
        const sentMsg = await conn.sendMessage(lobby.chatId, messagePayload);
        lobby.messageId = sentMsg.key.id; // Salva l'ID del messaggio per future modifiche
    }
}

// --- HANDLER DEL COMANDO PRINCIPALE ---
let handler = async (m, { conn, text, usedPrefix, isOwner }) => {
    const args = text.split(' ').filter(s => s);
    const command = args[0]?.toLowerCase();
    const senderId = m.sender;
    const chatId = m.chat;

    let senderLobby = getPlayerLobby(senderId, chatId);

    // --- .tris (Spiegazioni) ---
    if (!command) {
        let infoMessage = `
*🎮 Tris (Tic-Tac-Toe) 1v1*

Questo è un gioco a turni contro un altro giocatore!

*Comandi:*
• *${usedPrefix}tris <nome_lobby>*: Crea una nuova lobby standard.
  Esempio: \`${usedPrefix}tris la_mia_partita\`
• *${usedPrefix}tris <nome_lobby> endless*: Crea una nuova lobby in modalità Endless.
  Esempio: \`${usedPrefix}tris sfida_senza_fine endless\`
• *${usedPrefix}tris entra <nome_lobby>*: Entra in una lobby esistente.
  Esempio: \`${usedPrefix}tris entra la_mia_partita\`
• *${usedPrefix}tris esci*: Esci dalla tua lobby corrente.
• *${usedPrefix}tris <numero_cella>*: Fai la tua mossa (rispondi al messaggio della partita con il numero da 1 a 9).
  Esempio: \`${usedPrefix}tris 5\` (per occupare la casella centrale)

*Modalità Endless:*
Quando un giocatore fa la sua quarta mossa, la sua mossa meno recente viene rimossa dal tabellone, lasciando libera la casella corrispondente al numero.

*Stato Lobbies Attive in questa chat:*
`;
        const activeLobbiesInChat = Object.values(global.trisLobbies).filter(lobby => lobby.chatId === chatId);
        if (activeLobbiesInChat.length > 0) {
            activeLobbiesInChat.forEach(lobby => {
                infoMessage += `\n➡️ *${lobby.name}* (${lobby.mode === 'endless' ? 'Endless' : 'Standard'}) - Stato: ${lobby.status === 'waiting' ? 'In attesa di P2' : 'In gioco'}`;
            });
        } else {
            infoMessage += `\n_Nessuna lobby attiva in questa chat._`;
        }

        // Invia il messaggio di info con l'embed
        return conn.sendMessage(m.chat, {
            text: infoMessage.trim(),
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363419284785624@newsletter', // Sostituisci
                    serverMessageId: '',
                    newsletterName: "GiuseMD-V3 → Tris"
                },
                externalAdReply: {
                    title: `🎮 Tris - Regole del Gioco`,
                    body: `Pronto a giocare?`,
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    previewType: "PHOTO",
                    thumbnail: await (await fetch("https://telegra.ph/file/22b3e3d2a7b9f346e21b3.png")).buffer(), // Immagine Tris
                    sourceUrl: 'https://wa.me/' + conn.user.jid.split('@')[0] // Link al bot
                }
            }
        });
    }

    // --- .tris <lobbyName> / .tris <lobbyName> endless (Crea Lobby) ---
    // Questo gestisce sia ".tris nome" che ".tris nome endless"
    const potentialLobbyName = command; // Il primo argomento potrebbe essere il nome della lobby
    const potentialMode = args[1]?.toLowerCase(); // Il secondo argomento potrebbe essere 'endless'

    if (!isNaN(parseInt(potentialLobbyName))) { // Se è un numero, è una mossa, non una creazione di lobby
        // Cadrà nel blocco delle mosse più in basso
    } else if (
        (args.length === 1 && potentialLobbyName) || // .tris <nome> (standard)
        (args.length === 2 && potentialMode === 'endless') // .tris <nome> endless
    ) {
        const lobbyName = potentialLobbyName;
        const selectedMode = potentialMode === 'endless' ? 'endless' : 'standard';

        if (senderLobby) {
            return conn.reply(m.chat, `❌ Sei già in una lobby: *${senderLobby.name}*. Esci prima di crearne una nuova con \`${usedPrefix}tris esci\`.`, m);
        }
        if (global.trisLobbies[lobbyName]) {
            return conn.reply(m.chat, `❌ Una lobby con il nome *${lobbyName}* esiste già in questo server. Prova un altro nome o unisciti con \`${usedPrefix}tris entra ${lobbyName}\`.`, m);
        }

        const newBoard = Array(9).fill(null); // Inizialmente tutte le celle sono null
        global.trisLobbies[lobbyName] = {
            name: lobbyName,
            chatId: chatId,
            player1: senderId,
            player2: null,
            board: newBoard,
            currentPlayer: senderId, // Player 1 (X) inizia
            mode: selectedMode,
            status: 'waiting',
            movesPlayer1: [], // Per endless mode (memorizza indici 0-8)
            movesPlayer2: [], // Per endless mode (memorizza indici 0-8)
            messageId: null // Per l'ID del messaggio da modificare
        };

        return conn.reply(m.chat, `🎉 Lobby *${lobbyName}* (${selectedMode === 'endless' ? 'Endless' : 'Standard'}) creata! In attesa del secondo giocatore.
Per unirti: \`${usedPrefix}tris entra ${lobbyName}\``, m);
    }

    // --- .tris entra <lobbyName> (Entra in Lobby) ---
    if (command === 'entra' && args.length === 2) {
        const lobbyName = args[1];
        const lobbyToJoin = global.trisLobbies[lobbyName];

        if (!lobbyToJoin) {
            return conn.reply(m.chat, `❌ La lobby *${lobbyName}* non esiste.`, m);
        }
        if (lobbyToJoin.chatId !== chatId) {
             return conn.reply(m.chat, `❌ La lobby *${lobbyName}* si trova in un'altra chat o server.`, m);
        }
        if (lobbyToJoin.player1 === senderId) {
            return conn.reply(m.chat, `❌ Sei già il creatore di questa lobby.`, m);
        }
        if (lobbyToJoin.player2) {
            return conn.reply(m.chat, `❌ La lobby *${lobbyName}* è già piena.`, m);
        }
        if (senderLobby) {
            return conn.reply(m.chat, `❌ Sei già in un'altra lobby: *${senderLobby.name}*. Esci prima con \`${usedPrefix}tris esci\`.`, m);
        }

        lobbyToJoin.player2 = senderId;
        lobbyToJoin.status = 'playing';

        const player1Name = await conn.getName(lobbyToJoin.player1);
        const player2Name = await conn.getName(lobbyToJoin.player2);

        let statusMsg = `Inizia la partita! Turno di ${player1Name} (${PLAYER_X_EMOJI})`;
        await sendGameUpdate(conn, lobbyToJoin, statusMsg, true, m); // Invia un nuovo messaggio del tabellone

        return; // Esci dall'handler dopo aver inviato il messaggio di gioco
    }

    // --- .tris esci (Esci dalla Lobby) ---
    if (command === 'esci' && args.length === 1) {
        if (!senderLobby) {
            return conn.reply(m.chat, `❌ Non sei in nessuna lobby.`, m);
        }
        if (senderLobby.chatId !== chatId) {
            return conn.reply(m.chat, `❌ Non puoi uscire da una lobby in un'altra chat.`, m);
        }

        const lobbyName = senderLobby.name;
        const opponentId = senderLobby.player1 === senderId ? senderLobby.player2 : senderLobby.player1;
        
        delete global.trisLobbies[lobbyName]; // Rimuove la lobby

        await conn.reply(chatId, `👋 La lobby *${lobbyName}* è stata chiusa.`, m);
        if (opponentId && senderLobby.status === 'playing') {
            await conn.reply(opponentId, `ℹ️ Il tuo avversario ha lasciato la lobby *${lobbyName}*. La partita è terminata.`, m);
        }
        return;
    }

    // --- .tris <numero> (Fai una Mossa) ---
    const move = parseInt(command);
    if (!isNaN(move) && move >= 1 && move <= 9) {
        if (!senderLobby) {
            return conn.reply(m.chat, `❌ Non sei in nessuna partita attiva in questa chat.`, m);
        }
        if (senderLobby.chatId !== chatId) {
            return conn.reply(m.chat, `❌ Non puoi fare mosse per una partita in un'altra chat.`, m);
        }
        if (senderLobby.status !== 'playing') {
            return conn.reply(m.chat, `❌ La lobby *${senderLobby.name}* non è ancora in gioco (in attesa di P2).`, m);
        }
        if (senderLobby.currentPlayer !== senderId) {
            const currentTurnPlayerName = await conn.getName(senderLobby.currentPlayer);
            const currentTurnPlayerSymbol = senderLobby.currentPlayer === senderLobby.player1 ? PLAYER_X_EMOJI : PLAYER_O_EMOJI;
            return conn.reply(m.chat, `⏳ Non è il tuo turno. Aspetta ${currentTurnPlayerName} (${currentTurnPlayerSymbol}).`, m);
        }

        const boardIndex = move - 1; // Converti numero da 1-9 a indice da 0-8
        
        // Verifica se la cella è già occupata da X o O
        if (senderLobby.board[boardIndex] === PLAYER_X_EMOJI || senderLobby.board[boardIndex] === PLAYER_O_EMOJI) {
            return conn.reply(m.chat, `❌ La casella ${move} è già occupata. Scegli una casella libera.`, m);
        }

        // Determina il simbolo del giocatore corrente ('X' o 'O')
        const playerSymbol = senderLobby.currentPlayer === senderLobby.player1 ? 'X' : 'O';
        const displaySymbol = playerSymbol === 'X' ? PLAYER_X_EMOJI : PLAYER_O_EMOJI;

        // Applica la mossa sul tabellone
        senderLobby.board[boardIndex] = displaySymbol;

        // --- Logica Endless Mode ---
        if (senderLobby.mode === 'endless') {
            const playerMovesArray = senderLobby.currentPlayer === senderLobby.player1 ? senderLobby.movesPlayer1 : senderLobby.movesPlayer2;
            playerMovesArray.push(boardIndex); // Memorizza l'indice della mossa (0-indexed)

            if (playerMovesArray.length > 3) {
                const oldestMoveIndex = playerMovesArray.shift(); // Rimuovi la mossa più vecchia
                senderLobby.board[oldestMoveIndex] = null; // Resetta la casella a null (sarà ridisegnata come numero)
            }
        }

        // --- Controlla Vittoria/Pareggio ---
        let gameOutcome = null;
        let winnerName = null;
        if (checkWin(senderLobby.board, playerSymbol)) {
            gameOutcome = 'win';
            winnerName = await conn.getName(senderId);
        } else if (checkDraw(senderLobby.board)) {
            gameOutcome = 'draw';
        }

        // --- Prepara il messaggio di stato ---
        let statusMessage = '';
        if (gameOutcome === 'win') {
            statusMessage = `🎉 *VITTORIA!* 🎉 ${winnerName} (${displaySymbol}) ha vinto la partita!`;
            senderLobby.status = 'finished';
        } else if (gameOutcome === 'draw') {
            statusMessage = `🤝 *PAREGGIO!* 🤝 La partita è finita in parità!`;
            senderLobby.status = 'finished';
        } else {
            // Cambia turno
            senderLobby.currentPlayer = senderLobby.currentPlayer === senderLobby.player1 ? senderLobby.player2 : senderLobby.player1;
            const nextPlayerName = await conn.getName(senderLobby.currentPlayer);
            const nextPlayerSymbol = senderLobby.currentPlayer === senderLobby.player1 ? PLAYER_X_EMOJI : PLAYER_O_EMOJI;
            statusMessage = `Turno di ${nextPlayerName} (${nextPlayerSymbol})`;
        }

        // Invia l'aggiornamento del gioco (modificando il messaggio precedente se possibile)
        await sendGameUpdate(conn, senderLobby, statusMessage, false, m);

        // Se la partita è finita, pulisci la lobby dopo un breve ritardo
        if (gameOutcome) {
            setTimeout(async () => {
                delete global.trisLobbies[senderLobby.name];
                await conn.reply(chatId, `La lobby *${senderLobby.name}* è stata chiusa automaticamente dopo la fine della partita.`, m);
            }, 10000); // Pulisce dopo 10 secondi
        }

        return; // Esci dall'handler
    }

    // --- Fallback per comandi non riconosciuti ---
    conn.reply(m.chat, `Comando Tris non riconosciuto. Usa \`${usedPrefix}tris\` per le istruzioni.`, m);
};

handler.command = /^(tris)$/i;
// handler.owner = true; // Rimuovi il commento se vuoi che solo l'owner possa usare questo comando
handler.fail = null;

export default handler;