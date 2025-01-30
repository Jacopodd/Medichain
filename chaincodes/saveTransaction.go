package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func (s *SmartContract) SaveTransaction(ctx contractapi.TransactionContextInterface, ipfsHash string, patientID string) error {
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
}
