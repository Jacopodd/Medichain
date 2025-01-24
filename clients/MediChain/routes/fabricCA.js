const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

// Path al file connection-org3.json
const ccpPath = path.resolve(__dirname, '..', 'connection-org1.json'); // Modifica in base alla struttura dei tuoi file
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

// Configurazione Fabric CA
const caURL = ccp.certificateAuthorities['ca.org3.example.com'].url; // Modifica in base alla configurazione
const ca = new FabricCAServices(caURL);

// Esportare la connessione CA
module.exports = ca;
