var express = require('express');
var router = express.Router();
const FabricCAServices = require('fabric-ca-client');
const { User } = require('fabric-common');
const { Gateway, Wallets, X509WalletMixin  } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');


// Aggiungi una funzione asincrona per configurare IPFS
async function getIpfsClient() {
    const { create } = await import('ipfs-http-client');
    return create({ url: 'http://127.0.0.1:5001' });
}


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

// Rotta POST per gestire il login
/*router.post('/login', async (req, res) => {
  const {username, password} = req.body;
  console.log(`Username: ${username}, Password: ${password}`);

  try {
    // Path al file connection-org1.json
    const ccpPath = path.resolve(__dirname, '../connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Ottenere i dettagli della CA
    const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
    const caTLSCACerts = fs.readFileSync(caInfo.tlsCACerts.path);
    const ca = new FabricCAServices(caInfo.url, {trustedRoots: caTLSCACerts, verify: false}, caInfo.caName);

    // Autenticare l'utente tramite Fabric CA
    const enrollment = await ca.enroll({
      enrollmentID: username,
      enrollmentSecret: password,
    });

    console.log(`Autenticazione riuscita per ${username}`);

    // Crea un'identità temporanea utilizzando il certificato ottenuto
    const userIdentity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: 'Org1MSP',
      type: 'X.509',
    };

    // Reindirizza l'utente o restituisci una risposta positiva
    res.redirect('/listaUtenti');

  } catch (error) {
    console.error(`Errore durante il login: ${error.message}`);
    res.status(401).send(`Errore durante il login: ${error.message}`);
  }
});*/
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username e password richiesti' });
    }

    console.log(`Tentativo di login per il medico: ${username}`);

    try {
        // Path al file connection-org1.json
        const ccpPath = path.resolve(__dirname, '..', 'connection-org1.json');
        console.log('Connection Profile Path:', ccpPath);
        if (!fs.existsSync(ccpPath)) {
            throw new Error(`Connection profile non trovato alla path: ${ccpPath}`);
        }
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Ottenere i dettagli della CA
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = fs.readFileSync(caInfo.tlsCACerts.path);
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Enroll dell'utente direttamente senza usare il wallet
        const enrollment = await ca.enroll({
            enrollmentID: username,
            enrollmentSecret: password,
        });

        console.log(`Autenticazione riuscita per ${username}`);

        // Crea direttamente un'identità X.509
        const userIdentity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };

        // Utilizzo diretto dei certificati (senza wallet)
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            identity: userIdentity, // Passa direttamente l'identità
            discovery: { enabled: true, asLocalhost: true },
        });

        console.log(`Connessione riuscita alla rete Fabric con l'utente ${username}`);

        // Chiudi la connessione quando hai finito
        gateway.disconnect();

        return res.redirect('/listaUtenti');
    } catch (error) {
        console.error(`Errore durante il login: ${error.message}`);
        return res.status(401).json({ message: 'Errore durante il login', error: error.message });
    }
});

// Rotta GET per la lista utenti
router.get('/listaUtenti', (req, res) => {
    console.log("Inizio rotta listaUtenti");

    listUsersInOrg2()
        .then(userList => {
            // Mappa i dati recuperati nel formato richiesto
            const users = userList.map(user => ({
                id: user.id, // Usa l'ID univoco generato
                name: user.username // Nome utente leggibile
            }));

            // Stampa il risultato per verifica
            console.log('Lista utenti in Org2 formattata:', users);

            // Render della lista utenti
            res.render('listaUtenti', { users });
        })
        .catch(error => {
            console.error('Errore:', error.message);
            res.status(500).send('Errore nel recupero degli utenti');
        });
});

async function listUsersInOrg2() {
    try {
        console.log("Inizio funzione listaUsersInOrg2");

        // Percorso al file di configurazione della connessione Org2
        const ccpPath = path.resolve(__dirname, '../connection-org2.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Dettagli della CA di Org2
        const caInfo = ccp.certificateAuthorities['ca.org2.example.com'];
        const caTLSCACerts = fs.readFileSync(caInfo.tlsCACerts.path);
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Login come amministratore di Org2
        const adminEnrollment = await ca.enroll({
            enrollmentID: 'admin',
            enrollmentSecret: 'adminpw',
        });

        console.log("Login admin Org2 effettuato con successo");

        // Creazione di un'istanza adminUser
        const adminUser = new User('admin');
        adminUser.setCryptoSuite(FabricCAServices.newCryptoSuite());
        await adminUser.setEnrollment(adminEnrollment.key, adminEnrollment.certificate, 'Org2MSP');

        // Creazione del servizio Identity
        const identityService = ca.newIdentityService();

        // Recupero degli utenti registrati
        const usersResponse = await identityService.getAll(adminUser);
        console.log("usersResponse: ", JSON.stringify(usersResponse, null, 2));

        // Mappatura degli utenti
        const users = usersResponse.result.identities
            .filter(user => {
                // Filtra solo utenti con tipo "client"
                const userType = user.attrs?.find(attr => attr.name === 'hf.Type')?.value || 'unknown';
                return userType === 'client';
            })
            .map(user => {
                const username = user.attrs?.find(attr => attr.name === 'hf.EnrollmentID')?.value || user.id;
                const mspId = user.mspId || 'Org2MSP';

                console.log(`mspId: '${mspId}', username: '${username}'`);

                // Generazione ID univoco
                const uniqueId = crypto.createHash('sha256')
                    .update(`${mspId}-${username}`)
                    .digest('hex');

                return {
                    id: uniqueId, // ID univoco generato
                    username: username // Nome utente leggibile
                };
            });

        console.log("Utenti filtrati:", JSON.stringify(users, null, 2));


        return users;

    } catch (error) {
        console.error('Errore nel recupero degli utenti:', error.message);
        throw error;
    }
}

// Rotta POST per l'acquisizione della ricetta
router.post('/users/ricetta', async (req, res) => {
    const { prescription, userId } = req.body;

    console.log("INIZIO CREAZIONE RICETTA");

    if (!Array.isArray(prescription) || prescription.length === 0 || !userId) {
        return res.status(400).json({ message: 'Parametri non validi forniti' });
    }

    console.log('Ricetta ricevuta per userId:', userId);
    console.log('Dati della ricetta:', prescription);

    const currantDate = new Date();

    // Creazione JSON della ricetta
    const prescriptionData = {
        patientID: userId,
        data: currantDate,
        prescription: prescription,
    };

    const prescriptionJson = JSON.stringify(prescriptionData, null, 2);

    try {
        // Creare un file JSON
        const fileName = `file-${Date.now()}.json`;
        const filePath = `./prescriptions/${fileName}`;

        // Assicurati che la directory esista
        if (!fs.existsSync('./prescriptions')) {
            fs.mkdirSync('./prescriptions', { recursive: true });
            console.log('Cartella "prescriptions" creata.');
        }

        // Scrivi il file JSON
        fs.writeFileSync(filePath, prescriptionJson);
        console.log(`File JSON creato con successo: ${filePath}`);

        // Configura il client IPFS
        const ipfs = await getIpfsClient();

        // Leggi il contenuto del file e caricalo su IPFS
        const fileBuffer = fs.readFileSync(filePath);
        const result = await ipfs.add(fileBuffer);

        console.log(`Caricato su IPFS con successo: ${result.path}`);
        const ipfsHash = result.path;

        // Configura il client Fabric per invocare il chaincode
        const ccpPath = path.resolve(__dirname, '..', 'connection-org1.json');
        console.log('Connection Profile Path:', ccpPath);
        if (!fs.existsSync(ccpPath)) {
            throw new Error(`Connection profile non trovato alla path: ${ccpPath}`);
        }
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Inizializza direttamente l'identità senza wallet
        const certificatePath = path.resolve(__dirname, '..', 'certs', 'admin-cert.pem');
        const privateKeyPath = path.resolve(__dirname, '..', 'certs', 'admin-key.pem');

        console.log(`Percorso Certificato: ${certificatePath}`);
        console.log(`Percorso Chiave Privata: ${privateKeyPath}`);

        // Controlla se i file esistono
        if (!fs.existsSync(certificatePath)) {
            console.error(`Errore: Certificato non trovato al percorso: ${certificatePath}`);
        } else {
            console.log(`Certificato trovato con successo.`);
        }

        if (!fs.existsSync(privateKeyPath)) {
            console.error(`Errore: Chiave privata non trovata al percorso: ${privateKeyPath}`);
        } else {
            console.log(`Chiave privata trovata con successo.`);
        }

        const certificate = fs.readFileSync(certificatePath).toString();
        const privateKey = fs.readFileSync(privateKeyPath).toString();

        // Configura l'identità X.509
        const userIdentity = {
            credentials: {
                certificate: certificate,
                privateKey: privateKey,
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };

        // Connetti al gateway Hyperledger Fabric
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            identity: userIdentity,
            discovery: { enabled: true, asLocalhost: true }, // Usa `asLocalhost` per sviluppo locale
        });

        console.log('Gateway connesso con successo.');
        console.log('Percorso Certificato TLS:', ccp.peers['peer0.org1.example.com'].tlsCACerts.path);


        // Ottieni il network e il chaincode
        const network = await gateway.getNetwork('mychannel');
        console.log('Canale mychannel ottenuto.');
        const contract = network.getContract('chaincodes'); //savePrescription
        console.log('Chaincode ottenuto.');

        // Invoca il chaincode per salvare l'hash IPFS
        console.log(`Invocazione del chaincode con hash IPFS: ${ipfsHash}`);
        try {
            const result = await contract.submitTransaction('SaveTransaction', ipfsHash, userId);
            console.log('Transaction ID:', result.toString());
        } catch (err) {
            console.error('Errore durante l\'invocazione del chaincode:', err);
            throw err;
        }

        console.log(`Transazione completata con successo.`);


        // Disconnetti il gateway
        await gateway.disconnect();

        return res.status(200).json({
            message: 'File caricato su IPFS e blockchain con successo',
            cid: ipfsHash,
        });
    } catch (error) {
        console.error('Errore durante il caricamento su IPFS e blockchain:', error.message);

        return res.status(500).json({
            message: 'Errore durante il caricamento su IPFS e blockchain',
            error: error.message,
        });
    }
});

module.exports = router;
