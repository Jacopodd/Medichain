const { uploadFileToIPFS } = require('./ipfs'); // Importa la nuova funzione
const fs = require('fs');

async function uploadJsonToIPFS(data) {
    const fileName = `file-${Date.now()}.json`;
    const filePath = `./prescriptions/${fileName}`;

    try {
        if (!fs.existsSync('./prescriptions')) {
            fs.mkdirSync('./prescriptions', { recursive: true });
        }

        fs.writeFileSync(filePath, data);
        console.log(`File JSON creato con successo: ${filePath}`);

        // Verifica che il file sia leggibile
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        console.log('Contenuto del file JSON:', fileContent);


        const cid = await uploadFileToIPFS(filePath);

        fs.unlinkSync(filePath); // Rimuovi il file temporaneo
        return cid;
    } catch (error) {
        console.error('Error caricamento file su IPFS:', error);
        throw error;
    }
}

module.exports = { uploadJsonToIPFS };
