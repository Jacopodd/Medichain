package main

type TransactionData struct {
	TransactionID string `json:"transactionID"`
	OldIPFSHash      string `json:"oldIPFSHash"`
	IPFSHash      string `json:"IPFSHash"`
	IsValid          bool   `json:"isValid"`
}