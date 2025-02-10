export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=${PWD}/compose/docker/peercfg
CHANNEL_NAME="mychannel"
CREATE_PRESCRIPTION_CHAINCODE_NAME="savePrescription"
CREATE_PRESCRIPTION_CHAINCODE_NAME2="chaincodes"
CHAINCODE_VERSION="1.0"
CREATE_CHAINCODE_PATH="./chaincodes/savePrescrition"
CHAINCODE_LANGUAGE="golang"
ORDERER_ADDRESS="localhost:7050" #verificato, orderer.example.com:7050 da errore
CC_SEQUENCE="1"
CORE_PEER_MSPCONFIGPATH=/home/jacopodd/go/src/github.com/Jacopodd/fabric-samples/medichain-network2/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
ORIG_DIR=$(pwd)


# Configurazione Variabili 
# $PWD = /home/jacopodd/go/src/github.com/Jacopodd/fabric-samples/medichain-network2
setGlobals() {
  ORG=$1
  if [ "$ORG" == "Org1" ]; then
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
    echo ">> Variabili Org1 impostati correttamente"
  elif [ "$ORG" == "Org2" ]; then
    export CORE_PEER_LOCALMSPID="Org2MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
    echo ">> Variabili Org2 impostati correttamente"
  elif [ "$ORG" == "Org3" ]; then
    export CORE_PEER_LOCALMSPID="Org3MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp
    export CORE_PEER_ADDRESS=localhost:11051
    echo ">> Variabili Org3 impostate correttamente"
  else
    echo "Errore: Organizzazione sconosciuta: $ORG"
    exit 1
  fi
}

# 1. Stop e riavvio della rete Fabric
echo ">> Arresto e avvio della rete Fabric con creazione del canale..."
./network.sh down
./network.sh up createChannel -c ${CHANNEL_NAME} -ca
echo ">> Rete e Canale avviati correttamente!"

#2. Aggiunta Org3 (Farmacisti) alla rete Fabric
echo ">> Arresto e avvio del Canale Org3 (Farmacisti)..."
cd addOrg3 || { echo "Errore: impossibile cambiare cartella"; exit 1; }
./addOrg3.sh up -ca
echo ">> Canale Org3 (Farmacisti) creato e aggiunto al canale correttamente!"
cd "$ORIG_DIR" || { echo "Errore: impossibile tornare alla cartella originale"; exit 1; }

# 3. Avvio IPFS
echo ">> Avvio IPFS daemon..."
nohup ipfs daemon > ipfs.log 2>&1 &
sleep 5
echo ">> IPFS avviato correttamente!"

# 4. Packaging dei chaincodes 
echo ">> Creazione del pacchetto chaincode..."
#peer lifecycle chaincode package ${CREATE_PRESCRIPTION_CHAINCODE_NAME}.tar.gz --path ${CREATE_CHAINCODE_PATH} --lang ${CHAINCODE_LANGUAGE} --label ${CREATE_PRESCRIPTION_CHAINCODE_NAME}_${CHAINCODE_VERSION}
peer lifecycle chaincode package chaincodes.tar.gz --path ./chaincodes --lang ${CHAINCODE_LANGUAGE} --label chaincodes_${CHAINCODE_VERSION}
echo ">> Canale Pacchettizzato correttamente!"

# 5. Installazione su Org1 e Org2 
for ORG in Org1 Org2 Org3; do
  echo ">> Installazione del chaincode su $ORG..."
  setGlobals $ORG
  #peer lifecycle chaincode install ${CREATE_PRESCRIPTION_CHAINCODE_NAME}.tar.gz
  peer lifecycle chaincode install chaincodes.tar.gz
done
echo ">> Installazione su entrambi i canali avvenuto correttamente!"

# 6. Recupero del Package ID 
setGlobals Org1
#PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep "${CREATE_PRESCRIPTION_CHAINCODE_NAME}_${CHAINCODE_VERSION}" | awk '{print $3}' | sed 's/,//')
PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep "${CREATE_PRESCRIPTION_CHAINCODE_NAME2}_${CHAINCODE_VERSION}" | awk '{print $3}' | sed 's/,//')
echo ">> Package ID: ${PACKAGE_ID}"

# 6. Approvazione del chaincode su Org1 e Org2 
for ORG in Org1 Org2 Org3; do
  echo ">> Approvazione del chaincode su $ORG..."
  setGlobals $ORG
  #peer lifecycle chaincode approveformyorg -o ${ORDERER_ADDRESS} --channelID ${CHANNEL_NAME} --name ${CREATE_PRESCRIPTION_CHAINCODE_NAME} --version ${CHAINCODE_VERSION} --package-id ${PACKAGE_ID} --sequence ${CC_SEQUENCE} --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
  peer lifecycle chaincode approveformyorg -o ${ORDERER_ADDRESS} --channelID ${CHANNEL_NAME} --name ${CREATE_PRESCRIPTION_CHAINCODE_NAME2} --version ${CHAINCODE_VERSION} --package-id ${PACKAGE_ID} --sequence ${CC_SEQUENCE} --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
done
echo ">> Chaincode SavePrescription accettato da tutte e tre le organizzazioni!"

# 7. Commit del chaincode 
echo ">> Commit del chaincode..."
setGlobals Org1
#peer lifecycle chaincode commit -o ${ORDERER_ADDRESS} --channelID ${CHANNEL_NAME} --name ${CREATE_PRESCRIPTION_CHAINCODE_NAME} --version ${CHAINCODE_VERSION} --sequence ${CC_SEQUENCE} --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
peer lifecycle chaincode commit -o ${ORDERER_ADDRESS} --channelID ${CHANNEL_NAME} --name ${CREATE_PRESCRIPTION_CHAINCODE_NAME2} --version ${CHAINCODE_VERSION} --sequence ${CC_SEQUENCE} --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
echo ">> Il Commit è stato eseguito!"

# 8. Verifica del chaincode committato
echo ">> Verifica chaincode committato..."
#peer lifecycle chaincode querycommitted --channelID ${CHANNEL_NAME} --name ${CREATE_PRESCRIPTION_CHAINCODE_NAME}
peer lifecycle chaincode querycommitted --channelID ${CHANNEL_NAME} --name ${CREATE_PRESCRIPTION_CHAINCODE_NAME2}
echo ">> Approvato da entrambi!"

echo ">> Chaincode ${CREATE_PRESCRIPTION_CHAINCODE_NAME} installato e committato con successo su ${CHANNEL_NAME}!"


echo ">> Rimuovo i certificati vecchi..."
./remove_certs.sh
echo ">> Copio i nuovi certificati..."
./copy_certs.sh