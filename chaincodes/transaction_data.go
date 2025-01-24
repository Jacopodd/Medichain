package main

type TransactionData struct {
	TransactionID string `json:"transactionID"`
	IPFSHash      string `json:"ipfsHash"`
	Flag          bool   `json:"flag"`
}