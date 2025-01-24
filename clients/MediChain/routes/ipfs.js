const { fetch } = require('undici');
const fs = require('fs');
const FormData = require('form-data');

async function uploadFileToIPFS(filePath) {

    try {
        // Controlla se il file esiste
        if (!fs.existsSync(filePath)) {
            throw new Error(`File non trovato: ${filePath}`);
        }

        // Crea il form-data e aggiungi il file
        const fileStream = fs.createReadStream(filePath);
        const formData = new FormData();
        formData.append('file', fileStream, { filename: filePath }); // Specifica il nome del file

        console.log('FormData creato. Headers:', formData.getHeaders());

        // Effettua la richiesta al nodo IPFS
        const response = await fetch('http://127.0.0.1:5001/api/v0/add', {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders(), // Imposta gli header per multipart
            duplex: 'half', // Necessario per Node.js >=18
        });

        // Gestisci la risposta
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Errore nella richiesta. Dettagli:', errorText);
            throw new Error(`Errore nella richiesta: ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        console.log('File caricato su IPFS. CID:', result.Hash);
        return result.Hash;
    } catch (error) {
        console.error('Error caricamento file su IPFS:', error);
        throw error;
    }
}

module.exports = { uploadFileToIPFS };
