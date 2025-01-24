#!/bin/bash

# Configurazione delle variabili globali
CHANNEL_NAME="mychannel"
CHAINCODE_NAME="ipfs"
CHAINCODE_VERSION="1.0"
CHAINCODE_SEQUENCE="1"
CHAINCODE_PACKAGE_ID="ipfs_1:2285e19ff7c1bc6507526626dda53129c4fb4f284f39955f1c6260bdb9f628ad"
ORDERER_CA="/home/jacopodd/go/src/github.com/Jacopodd/fabric-samples/medichain-network2/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
ORDERER_ADDRESS="localhost:7050"

# Funzione per configurare le variabili di un'organizzazione
setOrgEnv() {
  ORG_MSP=$1
  MSP_PATH=$2
  PEER_ADDRESS=$3
  TLS_ROOT_CERT=$4

  export CORE_PEER_LOCALMSPID=$ORG_MSP
  export CORE_PEER_MSPCONFIGPATH=$MSP_PATH
  export CORE_PEER_TLS_ROOTCERT_FILE=$TLS_ROOT_CERT
  export CORE_PEER_ADDRESS=$PEER_ADDRESS
}

# Funzione per approvare il chaincode per un'organizzazione
approveChaincodeForOrg() {
  echo "Approving chaincode for $CORE_PEER_LOCALMSPID..."

  peer lifecycle chaincode approveformyorg \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --version $CHAINCODE_VERSION \
    --package-id $CHAINCODE_PACKAGE_ID \
    --sequence $CHAINCODE_SEQUENCE \
    --tls \
    --cafile $ORDERER_CA

  echo "Chaincode approved for $CORE_PEER_LOCALMSPID"
}

# Funzione per committare il chaincode
commitChaincode() {
  echo "Committing chaincode to channel $CHANNEL_NAME..."

  peer lifecycle chaincode commit \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --version $CHAINCODE_VERSION \
    --sequence $CHAINCODE_SEQUENCE \
    --tls \
    --cafile $ORDERER_CA \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles /home/jacopodd/go/src/github.com/Jacopodd/fabric-samples/medichain-network2/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
    --peerAddresses localhost:8051 \
    --tlsRootCertFiles /home/jacopodd/go/src/github.com/Jacopodd/fabric-samples/medichain-network2/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt

  echo "Chaincode committed to channel $CHANNEL_NAME"
}

# Configurazione per Org1MSP
setOrgEnv \
  "Org1MSP" \
  "/home/jacopodd/go/src/github.com/Jacopodd/fabric-samples/medichain-network2/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" \
  "localhost:7051" \
  "/home/jacopodd/go/src/github.com/Jacopodd/fabric-samples/medichain-network2/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"

approveChaincodeForOrg

# Configurazione per Org2MSP
setOrgEnv \
  "Org2MSP" \
  "/home/jacopodd/go/src/github.com/Jacopodd/fabric-samples/medichain-network2/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp" \
  "localhost:8051" \
  "/home/jacopodd/go/src/github.com/Jacopodd/fabric-samples/medichain-network2/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"

approveChaincodeForOrg

# Commit del chaincode
commitChaincode
