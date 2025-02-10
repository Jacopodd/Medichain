package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

/*func (s *SmartContract) InvalidateTransaction(ctx contractapi.TransactionContextInterface, transactionID string) error {
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
}*/

func (s *SmartContract) InvalidateTransaction(ctx contractapi.TransactionContextInterface, transactionID string) error {
	if len(transactionID) == 0 {
		return fmt.Errorf("transactionID è richiesto")
	}

	mu.Lock()
	defer mu.Unlock()

	transactionBytes, err := ctx.GetStub().GetState(transactionID)
	if err != nil {
		return fmt.Errorf("errore nel recupero della transazione: %v", err)
	}

	if transactionBytes == nil {
		return fmt.Errorf("transazione con ID %s non trovata", transactionID)
	}

	var transaction TransactionData
	err = json.Unmarshal(transactionBytes, &transaction)
	if err != nil {
		return fmt.Errorf("errore nella deserializzazione della transazione: %v", err)
	}

	transaction.IsValid = false

	updatedTransactionBytes, err := json.Marshal(transaction)
	if err != nil {
		return fmt.Errorf("errore nella serializzazione della transazione aggiornata: %v", err)
	}

	err = ctx.GetStub().PutState(transactionID, updatedTransactionBytes)
	if err != nil {
		return fmt.Errorf("errore nell'aggiornamento della transazione nella blockchain: %v", err)
	}

	log.Printf("Transazione %s invalidata con successo", transactionID)
	return nil
}


