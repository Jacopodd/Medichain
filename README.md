# 🏥 Medichain - Blockchain per la gestione sicura delle ricette mediche

Benvenuto in **Medichain**, un progetto che sfrutta la tecnologia **Hyperledger Fabric**, **IPFS** e **Go** per creare un sistema decentralizzato e sicuro per la gestione dei dati sanitari. 🏥🔗

## 📌 Requisiti

Prima di avviare il progetto, assicurati di avere installato:

- **Node.js** (ultima versione consigliata) 📦
- **Go** (per eseguire gli smart contract) 🛠️
- **Hyperledger Fabric** (per la gestione della blockchain) 🔗
- **IPFS** (per l'archiviazione decentralizzata) 📁

## 🚀 Installazione e Avvio del Progetto

### 1️⃣ Clona il repository
Scarica il progetto direttamente da GitHub con il comando:

```sh
git clone https://github.com/Jacopodd/Medichain.git
cd Medichain
```

### 2️⃣ **Scarica il secondo repository necessario**
Per il corretto funzionamento del progetto, è necessario clonare un altro repository. Scaricalo da qui:
👉[LINK] 

### 3️⃣ **Configura le Path**
Prima di avviare l'applicazione, assicurati di modificare le path nei file di configurazione per indicare correttamente le directory di Fabric, Go e IPFS.

### 4️⃣ **Avvia la Blockchain**
Nella cartella principale del progetto esegui:

```sh
./setup_initial.sh
```

### 5️⃣ **Installa le dipendenze**
Vai nella cartella del client ed esegui:

```sh
cd clients/MedicoClient
npm install
```

### 6️⃣ **Avvia il Server Express**
Il backend è scritto in JavaScript con Express. Per avviare il server, esegui:

```sh
node app.js
```

## 🔗 Smart Contracts
All'interno della cartella **`chaincodes/`** troverai gli smart contract scritti in Go. Questi vengono utilizzati per gestire le transazioni e le operazioni sulla blockchain.

## 📬 Contatti
Per qualsiasi problema o domanda, apri una Issue su GitHub o contattami! 😊
💡 Contribuisci: Se vuoi migliorare il progetto, sentiti libero di fare una Pull Request! 🚀

# ⚡ Medichain - La Blockchain per la Sanità del Futuro ⚡

