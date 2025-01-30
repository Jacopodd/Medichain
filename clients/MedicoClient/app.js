var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const crypto = require('crypto');

// Importa i router
var indexRouter = require('./routes/index'); // Rotta per la home page
var usersRouter = require('./routes/users');
const fs = require("fs");
const FabricCAServices = require("fabric-ca-client");
const {Gateway} = require("fabric-network");

async function getIpfsClient() {
    const { create } = await import('ipfs-http-client');
    return create({ url: 'http://127.0.0.1:5001' });
}

var app = express();

// Imposta il motore di template (Pug)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.post('/api/loginPaziente', async (req, res) => {
    console.log(req.body);
    const username = req.body['user'];
    const password = req.body['pass'];

    console.log('Tentativo di login per il paziente: ${username}');
    var uniqueId;

    try {
        // Path al file connection-org1.json
        const ccpPath = path.resolve(__dirname, 'connection-org2.json');
        console.log('Connection Profile Path:', ccpPath);
        if (!fs.existsSync(ccpPath)) {
            throw new Error('Connection profile non trovato alla path: ${ccpPath}');
        }
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Ottenere i dettagli della CA
        const caInfo = ccp.certificateAuthorities['ca.org2.example.com'];
        const caTLSCACerts = fs.readFileSync(caInfo.tlsCACerts.path);
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Enroll dell'utente direttamente senza usare il wallet
        const enrollment = await ca.enroll({
            enrollmentID: username,
            enrollmentSecret: password,
        });

        console.log('Enroll Paziente riuscito per ${username}');

        // Crea direttamente un'identità X.509
        const userIdentity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org2MSP', // MSP ID per l'ID univoco
            type: 'X.509',
        };

        console.log("Apro il Gatway...");

        // Utilizzo diretto dei certificati (senza wallet)
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            identity: userIdentity, // Passa direttamente l'identità
            discovery: { enabled: true, asLocalhost: true },
        });

        console.log('Connessione riuscita alla rete Fabric con il paziente: ${username}');

        // Chiudi la connessione quando hai finito
        gateway.disconnect();


        // Generazione ID univoco
        uniqueId = crypto.createHash('sha256')
            .update(`${userIdentity.mspId}-${username}`)
            .digest('hex');

        console.log("ID: " + uniqueId);


    } catch (error) {
        console.error('Errore durante il login del paziente: ', error);
        return res.status(401).json({ message: 'Errore durante il login del paziente', error: error.message });
    }

    res.status(200).json({ message: uniqueId });
});

app.post('/api/loginFarmacista', async (req, res) => {
    console.log(req.body);
    const username = req.body['user'];
    const password = req.body['pass'];

    console.log('Tentativo di login per il farmacista: ${username}');
    var uniqueId;

    try {
        // Path al file connection-org1.json
        const ccpPath = path.resolve(__dirname, 'connection-org3.json');
        console.log('Connection Profile Path:', ccpPath);
        if (!fs.existsSync(ccpPath)) {
            throw new Error('Connection profile non trovato alla path: ${ccpPath}');
        }
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Ottenere i dettagli della CA
        const caInfo = ccp.certificateAuthorities['ca.org3.example.com'];
        const caTLSCACerts = fs.readFileSync(caInfo.tlsCACerts.path);
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Enroll dell'utente direttamente senza usare il wallet
        const enrollment = await ca.enroll({
            enrollmentID: username,
            enrollmentSecret: password,
        });

        console.log('Enroll Farmacista riuscito per ${username}');

        // Crea direttamente un'identità X.509
        const userIdentity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org3MSP', // MSP ID per l'ID univoco
            type: 'X.509',
        };

        console.log("Apro il Gatway...");

        // Utilizzo diretto dei certificati (senza wallet)
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            identity: userIdentity, // Passa direttamente l'identità
            discovery: { enabled: true, asLocalhost: true },
        });

        console.log('Connessione riuscita alla rete Fabric con il farmacista: ${username}');

        // Chiudi la connessione quando hai finito
        gateway.disconnect();


        // Generazione ID univoco
        uniqueId = crypto.createHash('sha256')
            .update(`${userIdentity.mspId}-${username}`)
            .digest('hex');

        console.log("ID: " + uniqueId);


    } catch (error) {
        console.error('Errore durante il login del farmacista: ', error);
        return res.status(401).json({ message: 'Errore durante il login del farmacista', error: error.message });
    }

    res.status(200).json({ message: uniqueId });
});

app.post('/api/getPrescriptions', async (req, res) => {
    const { uniqueId } = req.body;

    let transactions = []; // Dichiarazione come array vuoto
    let ipfsIds = []; // Array per raccogliere gli ID IPFS

    console.log('Inizio ricerca prescrizioni ricette per il paziente: ' + uniqueId);

    try{
        const gateway = await configurazioneFabric();

        // Ottieni il network e il chaincode
        const network = await gateway.getNetwork('mychannel');
        console.log('Canale mychannel ottenuto.');
        const contract = network.getContract('chaincodes'); //savePrescription
        console.log('Chaincode ottenuto.');

        // Invoca il chaincode
        console.log(`Invocazione del chaincode con ID Paziente: ${uniqueId}`);

        try {
            // Invoca la funzione QueryTransactionsByPatientID sul chaincode
            const result = await contract.submitTransaction('QueryTransactionsByPatientID', uniqueId);

            // Deserializza il risultato in un array di stringhe
            transactions = JSON.parse(result.toString());

            // Verifica e stampa il risultato
            if (transactions && transactions.length > 0) {
                console.log('Transaction IDs:', transactions);

                let prescriptions = [];
                let olderPrescriptions = [];
                let isOlder = false;

                let truePrescriptions = getTruePrescription(transactions);
                console.log("Le prescrizioni da validare sono: " + truePrescriptions.length);
                for (let t of truePrescriptions) {
                    console.log("TransactionID: " + t);
                    console.log('Transazione: ' + t.transactionID);

                    try {
                        // Estrai l'ID IPFS (assumendo che sia presente un campo "ipfsID" nei dettagli)
                        console.log("IPFS HASH: " + t["IPFSHash"]);
                        const newHash = t["IPFSHash"];
                        if (newHash) {
                            const json = await getFileFromIPFS(newHash);
                            console.log('PROVA: ' + JSON.stringify(json));
                            if (json) {
                                json.ipfsHash = newHash;
                                json.transactionID = t.transactionID;
                                console.log('PROVA2: ' + JSON.stringify(json));

                                prescriptions.push(json);
                            } else {
                                console.warn(`Nessun dato trovato per il CID: ${t.ipfsHash}`);
                            }

                        } else {
                            console.warn(`Nessun ID IPFS trovato per la transazione ${t}`);
                        }
                    } catch (err) {
                        console.error(`Errore durante il recupero dei dettagli per la transazione ${transactionID}:`, err);
                    }
                }

                // Itera su ciascun ID di transazione e recupera i dettagli
                /*for (let transactionID of transactions) {
                    console.log("TransactionID: " + transactionID);
                    if (transactionID["oldIPFSHash"].length > 0) {
                        console.log("C'è una vecchia versione per l'Hash: ");
                        olderPrescriptions.push(transactionID);
                        continue;
                    } else {
                        console.log("Non c'è una vecchia versione");
                        isOlder = checkOlderPrescription(transactionID, olderPrescriptions);

                        if (isOlder) continue;
                    }
                    console.log('Transazione: ' + transactionID.transactionID);

                    try {
                        // Estrai l'ID IPFS (assumendo che sia presente un campo "ipfsID" nei dettagli)
                        console.log("IPFS HASH: " + transactionID["IPFSHash"]);
                        const newHash = transactionID["IPFSHash"];
                        if (newHash) {
                            const json = await getFileFromIPFS(newHash);
                            console.log('PROVA: ' + JSON.stringify(json));
                            if (json) {
                                json.ipfsHash = newHash;
                                console.log('PROVA2: ' + JSON.stringify(json));

                                prescriptions.push(json);

                                ultimateCheckPrescription(prescriptions, olderPrescriptions);
                                printList(prescriptions);

                            } else {
                                console.warn(`Nessun dato trovato per il CID: ${transactionID.ipfsHash}`);
                            }

                        } else {
                            console.warn(`Nessun ID IPFS trovato per la transazione ${transactionID}`);
                        }
                    } catch (err) {
                        console.error(`Errore durante il recupero dei dettagli per la transazione ${transactionID}:`, err);
                    }
                }*/

                console.log(`Transazione completata con successo.`);


                // Disconnetti il gateway
                await gateway.disconnect();

                if (prescriptions.length > 0) {
                    res.status(200).json(prescriptions);
                } else {
                    res.status(200).json({message: 'Non sono state trovate ricette per te'});
                }

            } else {
                console.log(`Nessuna transazione trovata per il paziente con ID: ${uniqueId}`);
            }
        } catch (err) {
            // Gestione degli errori
            console.error('Errore durante l\'invocazione del chaincode:', err);
            throw err;
        }

    } catch (error) {
        return res.status(500).json({
            message: 'Errore durante il caricamento su IPFS e blockchain',
            error: error.message,
        });
    }
});

async function getOlderPrescription(olderCid) {
    const jsonData = await getFileFromIPFS(olderCid);
    console.log('JSON recuperato dal paziente:\n', jsonData);

    return jsonData;
}

function checkOlderPrescription(prescription, olderPrescriptions) {
    for (const p of olderPrescriptions) {
        if(p["oldIPFSHash"] == prescription["oldIPFSHash"]) return true;
    }
    return false;
}

function ultimateCheckPrescription(prescriptions, olderPrescriptions) {
    for (const p of prescriptions) {
        for (const older of olderPrescriptions) {
            if (p["ipfsHash"] == olderPrescriptions["oldIPFSHash"]) {
                const cid = p["ipfsHash"];
                prescriptions = prescriptions.filter(p => p.ipfsHash !== cid);
            }
        }
    }
}

function getTruePrescription(prescriptions) {
    let truePrescriptions = [];
    for (const p of prescriptions) {
        if (p["isValid"]) truePrescriptions.push(p);
    }

    return truePrescriptions;
}

app.post('/api/getPrescriptionByIPFSHash', async (req, res) => {
    const { ipfsHashScanned } = req.body;

    console.log("IPFS Hash Scanned and Send: " + ipfsHashScanned);

    const jsonData = await getFileFromIPFS(ipfsHashScanned);


    console.log('JSON recuperato dal farmacista:\n', jsonData);

    if (Object.keys(jsonData).length === 0) {
        res.status(404).json({message: "L'oggetto JSON è vuoto"});
    } else {
        res.status(200).json(jsonData);
        console.log("L'oggetto JSON è pieno");
    }

});

app.post('/api/validationPrescription', async (req, res) => {
    const prescriptionJson  = req.body;

    console.log("Prescription: ", prescriptionJson);

    const patientID = req.body.patientID;
    const ipfsHash = req.body.ipfsHash;
    const isValid = req.body.isValid;
    console.log(isValid);
    const transactionID = req.body.transactionID;

    try {
        //Salvo su IPFS
        /*const ipfs = await getIpfsClient();
        const prescriptionString = JSON.stringify(prescriptionJson);
        const result = await ipfs.add(prescriptionString);
        console.log(`Caricato su IPFS con successo: ${result.path}`);
        const cid = result.path;*/

        const gateway = await configurazioneFabric();

        // Ottieni il network e il chaincode
        const network = await gateway.getNetwork('mychannel');
        console.log('Canale mychannel ottenuto.');
        const contract = network.getContract('chaincodes'); //savePrescription
        console.log('Chaincode ottenuto.');



        // Invoca il chaincode
        try {
            // Invoca la funzione StoreTransaction sul chaincode
            //await contract.submitTransaction('StoreTransaction', ipfsHash, cid, isValid, patientID);
            await contract.submitTransaction('InvalidateTransaction', transactionID);

            res.status(200).json({message: 'Ricetta Validata con successo!'});

        } catch (err) {
            // Gestione degli errori
            console.error('Errore durante l\'invocazione del chaincode:', err);
            throw err;
        }

    } catch (error) {
        return res.status(500).json({
            message: 'Errore durante il caricamento su IPFS e blockchain',
            error: error.message,
        });
    }
});


async function configurazioneFabric(){
    // Configura il client Fabric per invocare il chaincode
    const ccpPath = path.resolve(__dirname, 'connection-org2.json');
    console.log('Connection Profile Path:', ccpPath);
    if (!fs.existsSync(ccpPath)) {
        throw new Error(`Connection profile non trovato alla path: ${ccpPath}`);
    }
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Inizializza direttamente l'identità senza wallet
    const certificatePath = path.resolve(__dirname,  'certs/paziente', 'admin-cert.pem');
    const privateKeyPath = path.resolve(__dirname,  'certs/paziente', 'admin-key.pem');

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
        mspId: 'Org2MSP',
        type: 'X.509',
    };

    // Connetti al gateway Hyperledger Fabric
    const gateway = new Gateway();
    await gateway.connect(ccp, {
        identity: userIdentity,
        discovery: { enabled: true, asLocalhost: true }, // Usa `asLocalhost` per sviluppo locale
    });

    console.log('Gateway connesso con successo.');
    console.log('Percorso Certificato TLS:', ccp.peers['peer0.org2.example.com'].tlsCACerts.path);
    return gateway;
}

async function configurazioneFabricOrg3(){
    // Configura il client Fabric per invocare il chaincode
    const ccpPath = path.resolve(__dirname, 'connection-org3.json');
    console.log('Connection Profile Path:', ccpPath);
    if (!fs.existsSync(ccpPath)) {
        throw new Error(`Connection profile non trovato alla path: ${ccpPath}`);
    }
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Inizializza direttamente l'identità senza wallet
    const certificatePath = path.resolve(__dirname,  'certs/farmacista', 'admin-cert.pem');
    const privateKeyPath = path.resolve(__dirname,  'certs/farmacista', 'admin-key.pem');

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
        mspId: 'Org3MSP',
        type: 'X.509',
    };

    // Connetti al gateway Hyperledger Fabric
    const gateway = new Gateway();
    await gateway.connect(ccp, {
        identity: userIdentity,
        discovery: { enabled: true, asLocalhost: true }, // Usa `asLocalhost` per sviluppo locale
    });

    console.log('Gateway connesso con successo.');
    console.log('Percorso Certificato TLS:', ccp.peers['peer0.org3.example.com'].tlsCACerts.path);
    return gateway;
}

async function getFileFromIPFS(cid) {
    try {
        // Configura il client IPFS
        const ipfs = await getIpfsClient();

        // Recupera il file dal CID
        const stream = ipfs.cat(cid);
        const chunks = [];

        // Leggi tutti i chunk e accumulali in un array
        for await (const chunk of stream) {
            chunks.push(chunk);
        }

        // Concatena i chunk e convertili in una stringa
        const data = Buffer.concat(chunks).toString('utf-8');
        console.log('Contenuto recuperato:', data);

        // Parsing del JSON
        const jsonData = JSON.parse(data.trim());
        console.log('JSON parsato correttamente:', jsonData);

        return jsonData;
    } catch (error) {
        console.error('Errore nel recupero del file da IPFS:', error);
    }
}

function printList(prescriptions) {
    console.log("PRESCRIZIONI DA INVIARE: \n");
    for (const p of prescriptions) {
        console.log(p + "\n");
    }
}

// Usa i router
app.use('/', indexRouter); // Home page
app.use('/users', usersRouter);

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


app.listen(process.env.PORT || 3000,()=>{
    console.log('Ascolto sulla porta: 3000');
})


module.exports = app;


//"npm --prefix \"$RESOURCE_DIR\" run lint"
