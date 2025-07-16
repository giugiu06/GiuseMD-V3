import fs from 'fs';
import path from 'path';

// Define the path for the slot database file.
// It will be created in the same directory as your bot's main file (e.g., main.js or index.js).
const SLOT_DATABASE_FILE = path.resolve('./slotdata.json'); 

// Initialize global.slotDb only if it hasn't been defined yet.
// This prevents overwriting if the module is imported multiple times.
if (typeof global.slotDb === 'undefined') {
    try {
        if (fs.existsSync(SLOT_DATABASE_FILE)) {
            // If the file exists, load it
            global.slotDb = JSON.parse(fs.readFileSync(SLOT_DATABASE_FILE, 'utf8'));
            console.log(`[SLOT DB] Slot database loaded from ${SLOT_DATABASE_FILE}`);
        } else {
            // If the file does not exist, create a new empty database
            global.slotDb = { data: { users: {} } }; // Structure to store user data
            fs.writeFileSync(SLOT_DATABASE_FILE, JSON.stringify(global.slotDb, null, 2), 'utf8');
            console.log(`[SLOT DB] New slot database created in ${SLOT_DATABASE_FILE}`);
        }
    } catch (e) {
        // Handle loading/parsing errors for the JSON
        console.error(`[SLOT DB ERROR] Error loading/creating slot database:`, e);
        // Fallback to an in-memory database in case of a critical error
        global.slotDb = { data: { users: {} } }; 
    }
}

/**
 * Function to save the current state of the slot database to disk.
 */
function saveSlotDatabase() {
    try {
        // Save only if global.slotDb and its data are defined
        if (global.slotDb && global.slotDb.data) { 
            fs.writeFileSync(SLOT_DATABASE_FILE, JSON.stringify(global.slotDb, null, 2), 'utf8');
            // You can uncomment the following line for frequent save logs
            // console.log(`[SLOT DB] Slot database saved successfully.`); 
        }
    } catch (e) {
        console.error(`[SLOT DB ERROR] Error saving slot database:`, e);
    }
}

// --- Configure automatic saving ---

// Save the database periodically (every 5 seconds in this example)
// This ensures that changes are not lost in case of unexpected crashes.
setInterval(saveSlotDatabase, 5 * 1000); 

// Save the database when the process exits (e.g., Ctrl+C or server shutdown)
// This is crucial to avoid losing the latest data.
process.on('exit', () => {
    console.log('[SLOT DB] Final save of slot database before exiting...');
    saveSlotDatabase();
});

// Also capture the SIGINT signal (typical for Ctrl+C in terminals)
process.on('SIGINT', () => {
    console.log('[SLOT DB] SIGINT received, saving and exiting...');
    saveSlotDatabase();
    process.exit();
});

// We don't export anything because we directly modify global.slotDb
// This module must be imported/executed once when the bot starts.