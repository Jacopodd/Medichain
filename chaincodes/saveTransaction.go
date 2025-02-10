package main

import (
	"encoding/json"
	"fmt"
	"log"     
	"sync"    

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

var mu sync.Mutex // Mutex per evitare race conditions

func (s *SmartContract) SaveTransaction(ctx contractapi.TransactionContextInterface, ipfsHash string, patientID string) error {
	// Validazione input
	if err := ValidateIPFSHash(ipfsHash); err != nil {
		return err
	}
	if err := ValidatePatientID(patientID); err != nil {
		return err
	}

	transactionID := ctx.GetStub().GetTxID()
	tx := TransactionData{
		TransactionID: transactionID,
		IPFSHash:      ipfsHash,
		IsValid:       true,
	}

	txJSON, err := json.Marshal(tx)
	if err != nil {
		log.Printf("Error serializing transaction data: %v", err)
		return fmt.Errorf("failed to serialize transaction data: %v", err)
	}

	err = ctx.GetStub().PutState(transactionID, txJSON)
	if err != nil {
		log.Printf("Error saving transaction: %v", err)
		return fmt.Errorf("failed to save transaction: %v", err)
	}

	// Gestione race conditions con mutex
	mu.Lock()
	defer mu.Unlock()

	patientTransactionsJSON, err := ctx.GetStub().GetState(patientID)
	if err != nil {
		return fmt.Errorf("failed to retrieve patient transactions: %v", err)
	}

	var patientTransactions []string
	if patientTransactionsJSON != nil {
		err = json.Unmarshal(patientTransactionsJSON, &patientTransactions)
		if err != nil {
			return fmt.Errorf("failed to deserialize patient transactions: %v", err)
		}
	}

	// Verifica duplicati
	for _, t := range patientTransactions {
		if t == transactionID {
			return fmt.Errorf("transaction already recorded for this patient")
		}
	}

	patientTransactions = append(patientTransactions, transactionID)

	updatedTransactionsJSON, err := json.Marshal(patientTransactions)
	if err != nil {
		return fmt.Errorf("failed to serialize updated transactions: %v", err)
	}

	err = ctx.GetStub().PutState(patientID, updatedTransactionsJSON)
	if err != nil {
		return fmt.Errorf("failed to save patient transactions: %v", err)
	}

	log.Printf("Transaction %s successfully saved for patient %s", transactionID, patientID)
	return nil
}


/*func (s *SmartContract) SaveTransaction(ctx contractapi.TransactionContextInterface, ipfsHash string, patientID string) error {
	if len(ipfsHash) == 0 || len(patientID) == 0 {
		return fmt.Errorf("ipfsHash e patientID sono richiesti")
	}

	transactionID := ctx.GetStub().GetTxID()
	tx := TransactionData{
		TransactionID: transactionID,
		IPFSHash:      ipfsHash,
		IsValid:       true, 
	}
	txJSON, err := json.Marshal(tx)
	if err != nil {
		return fmt.Errorf("failed to serialize transaction data: %v", err)
	}
	err = ctx.GetStub().PutState(transactionID, txJSON)
	if err != nil {
		return fmt.Errorf("failed to save transaction: %v", err)
	}

	patientTransactionsJSON, err := ctx.GetStub().GetState(patientID)
	if err != nil {
		return fmt.Errorf("failed to retrieve patient transactions: %v", err)
	}

	var patientTransactions []string
	if patientTransactionsJSON != nil {
		err = json.Unmarshal(patientTransactionsJSON, &patientTransactions)
		if err != nil {
			return fmt.Errorf("failed to deserialize patient transactions: %v", err)
		}
	}

	patientTransactions = append(patientTransactions, transactionID)

	updatedTransactionsJSON, err := json.Marshal(patientTransactions)
	if err != nil {
		return fmt.Errorf("failed to serialize updated transactions: %v", err)
	}

	err = ctx.GetStub().PutState(patientID, updatedTransactionsJSON)
	if err != nil {
		return fmt.Errorf("failed to save patient transactions: %v", err)
	}

	return nil
}*/
