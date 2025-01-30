package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

/*func (s *SmartContract) SaveTransactionWithFlag(ctx contractapi.TransactionContextInterface, ipfsHash string, patientID string, flag bool) error {
	if len(ipfsHash) == 0 || len(patientID) == 0 {
		return fmt.Errorf("ipfsHash e patientID sono richiesti")
	}

	transactionID := ctx.GetStub().GetTxID()
	tx := TransactionData{
		TransactionID: transactionID,
		IPFSHash:      ipfsHash,
		Flag:          flag,
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


// StoreTransaction salva una nuova transazione sulla blockchain
/*func (s *SmartContract) StoreTransaction(ctx contractapi.TransactionContextInterface, oldIPFSHash string, newIPFSHash string, isValid bool, patientID string) error {
	if len(patientID) == 0 {
		return fmt.Errorf("patientID is required")
	}

	transactionID := ctx.GetStub().GetTxID()

	transaction := TransactionData{
		TransactionID: transactionID,
		OldIPFSHash:   oldIPFSHash,
		IPFSHash:      newIPFSHash,
		IsValid:       isValid,
	}

	transactionBytes, err := json.Marshal(transaction)
	if err != nil {
		return fmt.Errorf("errore nella serializzazione dei dati della transazione: %v", err)
	}

	err = ctx.GetStub().PutState(transactionID, transactionBytes)
	if err != nil {
		return fmt.Errorf("errore nel salvataggio della transazione nella blockchain: %v", err)
	}

	// Recupera le transazioni esistenti per il paziente
	patientTransactionsJSON, err := ctx.GetStub().GetState(patientID)
	if err != nil {
		return fmt.Errorf("errore nel recupero delle transazioni del paziente: %v", err)
	}

	var patientTransactions []string
	if patientTransactionsJSON != nil {
		err = json.Unmarshal(patientTransactionsJSON, &patientTransactions)
		if err != nil {
			return fmt.Errorf("errore nella deserializzazione delle transazioni del paziente: %v", err)
		}
	}

	// Verifica se la transazione è già presente
	for _, t := range patientTransactions {
		if t == transactionID {
			return fmt.Errorf("transazione già registrata per questo paziente")
		}
	}

	// Aggiungi la nuova transazione alla lista del paziente
	patientTransactions = append(patientTransactions, transactionID)

	fmt.Printf("Transazioni aggiornate per paziente %s: %v\n", patientID, patientTransactions)

	updatedTransactionsJSON, err := json.Marshal(patientTransactions)
	if err != nil {
		return fmt.Errorf("errore nella serializzazione delle transazioni aggiornate: %v", err)
	}

	err = ctx.GetStub().PutState(patientID, updatedTransactionsJSON)
	if err != nil {
		return fmt.Errorf("errore nel salvataggio delle transazioni del paziente: %v", err)
	}

	return nil
}*/

func (s *SmartContract) InvalidateTransaction(ctx contractapi.TransactionContextInterface, transactionID string) error {
	if len(transactionID) == 0 {
		return fmt.Errorf("transactionID è richiesto")
	}

	// Recupera i dati della transazione esistente
	transactionBytes, err := ctx.GetStub().GetState(transactionID)
	if err != nil {
		return fmt.Errorf("errore nel recupero della transazione: %v", err)
	}

	if transactionBytes == nil {
		return fmt.Errorf("transazione con ID %s non trovata", transactionID)
	}

	// Deserializza i dati della transazione
	var transaction TransactionData
	err = json.Unmarshal(transactionBytes, &transaction)
	if err != nil {
		return fmt.Errorf("errore nella deserializzazione della transazione: %v", err)
	}

	// Modifica il valore di isValid a false
	transaction.IsValid = false

	// Serializza e aggiorna la transazione sulla blockchain
	updatedTransactionBytes, err := json.Marshal(transaction)
	if err != nil {
		return fmt.Errorf("errore nella serializzazione della transazione aggiornata: %v", err)
	}

	err = ctx.GetStub().PutState(transactionID, updatedTransactionBytes)
	if err != nil {
		return fmt.Errorf("errore nell'aggiornamento della transazione nella blockchain: %v", err)
	}

	fmt.Printf("Transazione %s invalidata con successo\n", transactionID)
	return nil
}


