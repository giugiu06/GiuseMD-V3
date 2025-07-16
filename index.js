import path, { join, dirname } from 'path';
import { createRequire } from 'module';
import { fileURLToPath as fileURLToPathNative } from 'node:url';
import { dirname as dirnameNative } from 'node:path';
import { setupMaster, fork } from 'cluster';
import { watchFile, unwatchFile } from 'fs';
import cfonts from 'cfonts';
import { createInterface } from 'readline';
import yargs from 'yargs';
import express from 'express';

// Configurazioni iniziali
const __filename = fileURLToPathNative(import.meta.url);
const __dirname = dirnameNative(__filename);
const require = createRequire(import.meta.url);
const { name, author } = require(join(__dirname, './package.json'));
const rl = createInterface(process.stdin, process.stdout);
const app = express();

// Lista delle porte da provare, in ordine di preferenza
const PORTS_TO_TRY = [
  process.env.PORT ? parseInt(process.env.PORT, 10) : 3000, // Prima la porta da variabile d'ambiente, altrimenti 3000
  8080, // Seconda opzione
  5000, // Terza opzione
  3001, // Quarta opzione (se la 3000 è occupata)
  3002,
  1041,
  1691,
  6969,
  5555,
];

// Funzione per avviare il server Express su una porta
function startWebServer(portToAttempt) {
  return new Promise((resolve, reject) => {
    const server = app.listen(portToAttempt, () => {
      console.log(`Server web in ascolto sulla porta ${portToAttempt}`);
      resolve(portToAttempt); // Risolvi con la porta che è stata usata con successo
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Porta ${portToAttempt} già in uso. Tentativo con la prossima...`);
        reject(new Error('Porta già in uso')); // Rifiuta la Promise per passare alla prossima porta
      } else {
        console.error(`🚨 Errore durante l'avvio del server sulla porta ${portToAttempt}:`, err);
        reject(err); // Rifiuta con altri errori
      }
    });
  });
}

// Funzione asincrona per provare le porte in sequenza
async function findAndStartServer() {
  let serverStarted = false;
  for (const port of PORTS_TO_TRY) {
    try {
      // Endpoint Express (necessario qui per renderlo disponibile per ogni porta tentata)
      app.get('/', (req, res) => {
        res.send(`Il bot WhatsApp GIUSEMD è attivo sulla porta "${port}" per qualunque problema contattare l'owner al seguente link: https://wa.me/393445461546`);
      });
      await startWebServer(port);
      serverStarted = true;
      break; // Se il server si avvia, esci dal ciclo
    } catch (e) {
      // Continua al prossimo ciclo se la porta è in uso
      if (e.message !== 'Porta già in uso') {
        // Se è un errore diverso da 'EADDRINUSE', fermati e logga
        console.error(`❌ Errore critico non di porta in uso:`, e);
        process.exit(1); // Esci con un codice di errore
      }
    }
  }

  if (!serverStarted) {
    console.error('❌ Tutte le porte tentate sono in uso o si è verificato un altro errore.');
    process.exit(1); // Esci con un codice di errore se nessuna porta è disponibile
  }
}

// Chiama la funzione per avviare il server
findAndStartServer();


// Funzione per messaggi animati
const animatedMessage = (text, font = 'block', colors = ['cyan', 'blue'], align = 'center') => {
  cfonts.say(text, {
    font,
    align,
    gradient: colors,
    transitionGradient: true,
  });
};

console.clear();
console.log(' ▄▄ • ▪  ▄• ▄▌.▄▄ · ▄▄▄ .• ▌ ▄ ·. ·▄▄▄▄')
console.log('▐█ ▀ ▪██ █▪██▌▐█ ▀. ▀▄.▀··██ ▐███▪██▪ ██')
console.log('▄█ ▀█▄▐█·█▌▐█▌▄▀▀▀█▄▐▀▀▪▄▐█ ▌▐▌▐█·▐█· ▐█▌')
console.log('▐█▄▪▐█▐█▌▐█▄█▌▐█▄▪▐█▐█▄▄▌██ ██▌▐█▌██. ██ ')
console.log('·▀▀▀▀ ▀▀▀ ▀▀▀  ▀▀▀▀  ▀▀▀ ▀▀  █▪▀▀▀▀▀▀▀▀• ')
console.log('\n🔥 Sistema in avvio...');
console.log('⏳ Preparazione dei moduli...');
console.log('©️ Crediti & Supporto bot:');
console.log('1️⃣ https://whatsapp.com/channel/0029Vb6YYdN6LwHeloTW8409');
console.log('2️⃣ https://whatsapp.com/channel/0029VaitzuD3mFYDnJJNWH3Q');
console.log('⚠️ Per qualsiasi informazione, contatta: +39 344 546 1546\n');

// Variabile per controllo dello stato
let isRunning = false;

/**
 * Avvia un file JavaScript
 * @param {String} file - Percorso del file da avviare.
 */
function start(file) {
  if (isRunning) return;
  isRunning = true;

  const args = [join(__dirname, file), ...process.argv.slice(2)];

  animatedMessage('Ediz by Giu', 'console', ['yellow', 'green']);
  console.log('🚀 Inizializzazione completata.\n');

  // Configurazione del cluster
  setupMaster({
    exec: args[0],
    args: args.slice(1),
  });

  let processInstance = fork();

  processInstance.on('message', (data) => {
    console.log('[📩 RICEVUTO]', data);
    switch (data) {
      case 'reset':
        console.log('🔄 Ricevuto comando di reset. Riavvio del worker...');
        processInstance.removeAllListeners(); // Rimuovi tutti i listener per evitare comportamenti imprevisti
        processInstance.kill();
        isRunning = false;
        start(file);
        break;
      case 'uptime':
        processInstance.send(process.uptime());
        break;
    }
  });

  processInstance.on('exit', (code) => {
    isRunning = false;
    console.error('❌ Errore inatteso del worker:', code);

    if (code !== 0) {
      console.log('⚠️ Rilevato un errore. Monitoraggio del file per il riavvio automatico...');
      watchFile(args[0], () => {
        unwatchFile(args[0]);
        console.log('✅ Il file è stato modificato. Tentativo di riavvio del worker...');
        start(file);
      });
    }
  });

  processInstance.on('error', (err) => {
    console.error('🚨 Errore nella comunicazione con il worker:', err);
    isRunning = false;
    // Potresti implementare qui una logica di riavvio più aggressiva se necessario
    console.log('⚠️ Tentativo di riavvio del worker a causa di un errore...');
    start(file);
  });

  // Gestione input da console
  let opts = new Object(
    yargs(process.argv.slice(2)).exitProcess(false).parse()
  );
  if (!opts['test']) {
    if (!rl.listenerCount('line')) {
      rl.on('line', (line) => {
        processInstance.emit('message', line.trim());
      });
    }
  }
}

// Avvio del file principale
start('main.js');
