package main

import (
    "errors"
    "strings"
)

func ValidateIPFSHash(ipfsHash string) error {
    if len(ipfsHash) != 46 || !strings.HasPrefix(ipfsHash, "Qm") {
        return errors.New("invalid IPFS hash format")
    }
    return nil
}

func ValidatePatientID(patientID string) error {
    if len(patientID) == 0 {
        return errors.New("patientID is required")
    }
    return nil
}
