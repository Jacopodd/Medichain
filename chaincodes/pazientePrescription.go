package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func (s *SmartContract) QueryTransactionsByPatientID(ctx contractapi.TransactionContextInterface, patientID string) ([]TransactionData, error) {
	patientTransactionsJSON, err := ctx.GetStub().GetState(patientID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve patient transactions: %v", err)
	}

	if patientTransactionsJSON == nil {
		return nil, fmt.Errorf("no transactions found for patient: %s", patientID)
	}

	var patientTransactions []string
	err = json.Unmarshal(patientTransactionsJSON, &patientTransactions)
	if err != nil {
		return nil, fmt.Errorf("failed to deserialize patient transactions: %v", err)
	}

	fmt.Printf("Transazioni trovate per il paziente %s: %v\n", patientID, patientTransactions)

	var transactionDetailsList []TransactionData
	for _, transactionID := range patientTransactions {
		transactionJSON, err := ctx.GetStub().GetState(transactionID)
		if err != nil {
			return nil, fmt.Errorf("failed to retrieve transaction details for ID %s: %v", transactionID, err)
		}

		if transactionJSON == nil {
			return nil, fmt.Errorf("transaction not found for ID: %s", transactionID)
		}

		var transactionDetails TransactionData
		err = json.Unmarshal(transactionJSON, &transactionDetails)
		if err != nil {
			return nil, fmt.Errorf("failed to deserialize transaction details for ID %s: %v", transactionID, err)
		}

		transactionDetailsList = append(transactionDetailsList, transactionDetails)
	}

	return transactionDetailsList, nil
}

/*func (s *SmartContract) QueryTransactionsByPatientID(ctx contractapi.TransactionContextInterface, patientID string) ([]TransactionData, error) {
	patientTransactionsJSON, err := ctx.GetStub().GetState(patientID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve patient transactions: %v", err)
	}

	if patientTransactionsJSON == nil {
		return nil, fmt.Errorf("no transactions found for patient: %s", patientID)
	}

	var patientTransactions []string
	err = json.Unmarshal(patientTransactionsJSON, &patientTransactions)
	if err != nil {
		return nil, fmt.Errorf("failed to deserialize patient transactions: %v", err)
	}

	fmt.Printf("Transazioni trovate per il paziente %s: %v\n", patientID, patientTransactions)

	var transactionDetailsList []TransactionData
	for _, transactionID := range patientTransactions {
		transactionJSON, err := ctx.GetStub().GetState(transactionID)
		if err != nil {
			return nil, fmt.Errorf("failed to retrieve transaction details for ID %s: %v", transactionID, err)
		}

		if transactionJSON == nil {
			fmt.Printf("Transaction not found for ID: %s\n", transactionID)
			continue
		}

		var transactionDetails TransactionData
		err = json.Unmarshal(transactionJSON, &transactionDetails)
		if err != nil {
			return nil, fmt.Errorf("failed to deserialize transaction details for ID %s: %v", transactionID, err)
		}

		// Filtra solo le transazioni con isValid == false
		if !transactionDetails.IsValid {
			transactionDetailsList = append(transactionDetailsList, transactionDetails)
		}
	}

	return transactionDetailsList, nil
}*/


