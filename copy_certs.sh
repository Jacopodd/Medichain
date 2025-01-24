MEDICO_ADMINCERTS_SOURCE_FOLDER="/home/jacopodd/go/src/github.com/Jacopodd/fabric-samples/medichain-network2/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts"
MEDICO_ADMINKEY_SOURCE_FOLDER="/home/jacopodd/go/src/github.com/Jacopodd/fabric-samples/medichain-network2/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore"
MEDICO_ADMIN_DESTINATION_FOLDER="/home/jacopodd/go/src/github.com/Jacopodd/fabric-samples/medichain-network2/clients/MedicoClient/certs"

# Verifica se le cartelle esistono
if [ ! -d "$MEDICO_ADMINCERTS_SOURCE_FOLDER" ]; then
  echo "Errore: La cartella sorgente $MEDICO_ADMINCERTS_SOURCE_FOLDER non esiste!"
  exit 1
fi

if [ ! -d "$MEDICO_ADMINKEY_SOURCE_FOLDER" ]; then
  echo "Errore: La cartella sorgente $MEDICO_ADMINKEY_SOURCE_FOLDER non esiste!"
  exit 1
fi

if [ ! -d "$MEDICO_ADMIN_DESTINATION_FOLDER" ]; then
  echo "La cartella destinazione $MEDICO_ADMIN_DESTINATION_FOLDER non esiste. Creazione in corso..."
  mkdir -p "$MEDICO_ADMIN_DESTINATION_FOLDER"
fi

echo ">> Copia dei file dalla cartella $MEDICO_ADMINCERTS_SOURCE_FOLDER alla cartella $MEDICO_ADMIN_DESTINATION_FOLDER..."

# Copia di un file specifico
SPECIFIC_FILE="cert.pem"  # Nome del file specifico da copiare
if [ -f "$MEDICO_ADMINCERTS_SOURCE_FOLDER/$SPECIFIC_FILE" ]; then
  cp "$MEDICO_ADMINCERTS_SOURCE_FOLDER/$SPECIFIC_FILE" "$MEDICO_ADMIN_DESTINATION_FOLDER/"
  echo ">> File $SPECIFIC_FILE copiato in $MEDICO_ADMIN_DESTINATION_FOLDER."
  
  # Rinomina del file copiato
  BASENAME=$(basename "$SPECIFIC_FILE")
  NEWNAME="admin-cert.pem"
  mv "$MEDICO_ADMIN_DESTINATION_FOLDER/$BASENAME" "$MEDICO_ADMIN_DESTINATION_FOLDER/$NEWNAME"
  echo ">> File $BASENAME rinominato in $NEWNAME"
else
  echo "Errore: Il file $SPECIFIC_FILE non esiste nella cartella $MEDICO_ADMIN_DESTINATION_FOLDER!"
  exit 1
fi

echo ">> Copia dei file dalla cartella $MEDICO_ADMINKEY_SOURCE_FOLDER alla cartella $MEDICO_ADMIN_DESTINATION_FOLDER..."

# Recupero il file key.pem
# Individua l'unico file nella cartella sorgente
FILE_TO_COPY=$(ls "$MEDICO_ADMINKEY_SOURCE_FOLDER" | head -n 1)

if [ -z "$FILE_TO_COPY" ]; then
  echo "Errore: Nessun file trovato nella cartella $SOURCE_FOLDER!"
  exit 1
fi

# Copia il file nella cartella di destinazione
cp "$MEDICO_ADMINKEY_SOURCE_FOLDER/$FILE_TO_COPY" "$MEDICO_ADMIN_DESTINATION_FOLDER/"
echo ">> File $FILE_TO_COPY copiato in $MEDICO_ADMIN_DESTINATION_FOLDER."
# Rinomina il file copiato
NEW_NAME2="admin-key.pem"
mv "$MEDICO_ADMIN_DESTINATION_FOLDER/$FILE_TO_COPY" "$MEDICO_ADMIN_DESTINATION_FOLDER/$NEW_NAME2"
echo ">> File $FILE_TO_COPY rinominato in $NEW_NAME2"



PAZIENTE_ADMINCERTS_SOURCE_FOLDER="/home/jacopodd/go/src/github.com/Jacopodd/fabric-samples/medichain-network2/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/signcerts"
PAZIENTE_ADMINKEY_SOURCE_FOLDER="/home/jacopodd/go/src/github.com/Jacopodd/fabric-samples/medichain-network2/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/keystore"
PAZIENTE_ADMIN_DESTINATION_FOLDER="/home/jacopodd/go/src/github.com/Jacopodd/fabric-samples/medichain-network2/clients/MedicoClient/certs/paziente"

# Verifica se le cartelle esistono
if [ ! -d "$PAZIENTE_ADMINCERTS_SOURCE_FOLDER" ]; then
  echo "Errore: La cartella sorgente $PAZIENTE_ADMINCERTS_SOURCE_FOLDER non esiste!"
  exit 1
fi

if [ ! -d "$PAZIENTE_ADMINKEY_SOURCE_FOLDER" ]; then
  echo "Errore: La cartella sorgente $PAZIENTE_ADMINKEY_SOURCE_FOLDER non esiste!"
  exit 1
fi

if [ ! -d "$PAZIENTE_ADMIN_DESTINATION_FOLDER" ]; then
  echo "La cartella destinazione $PAZIENTE_ADMIN_DESTINATION_FOLDER non esiste. Creazione in corso..."
  mkdir -p "$PAZIENTE_ADMIN_DESTINATION_FOLDER"
fi

echo ">> Copia dei file dalla cartella $PAZIENTE_ADMINCERTS_SOURCE_FOLDER alla cartella $PAZIENTE_ADMIN_DESTINATION_FOLDER..."

# Copia di un file specifico
SPECIFIC_FILE="cert.pem"  # Nome del file specifico da copiare
if [ -f "$PAZIENTE_ADMINCERTS_SOURCE_FOLDER/$SPECIFIC_FILE" ]; then
  cp "$PAZIENTE_ADMINCERTS_SOURCE_FOLDER/$SPECIFIC_FILE" "$PAZIENTE_ADMIN_DESTINATION_FOLDER/"
  echo ">> File $SPECIFIC_FILE copiato in $PAZIENTE_ADMIN_DESTINATION_FOLDER."
  
  # Rinomina del file copiato
  BASENAME=$(basename "$SPECIFIC_FILE")
  NEWNAME="admin-cert.pem"
  mv "$PAZIENTE_ADMIN_DESTINATION_FOLDER/$BASENAME" "$PAZIENTE_ADMIN_DESTINATION_FOLDER/$NEWNAME"
  echo ">> File $BASENAME rinominato in $NEWNAME"
else
  echo "Errore: Il file $SPECIFIC_FILE non esiste nella cartella $PAZIENTE_ADMIN_DESTINATION_FOLDER!"
  exit 1
fi

echo ">> Copia dei file dalla cartella $PAZIENTE_ADMINKEY_SOURCE_FOLDER alla cartella $PAZIENTE_ADMIN_DESTINATION_FOLDER..."

# Recupero il file key.pem
# Individua l'unico file nella cartella sorgente
FILE_TO_COPY=$(ls "$PAZIENTE_ADMINKEY_SOURCE_FOLDER" | head -n 1)

if [ -z "$FILE_TO_COPY" ]; then
  echo "Errore: Nessun file trovato nella cartella $SOURCE_FOLDER!"
  exit 1
fi

# Copia il file nella cartella di destinazione
cp "$PAZIENTE_ADMINKEY_SOURCE_FOLDER/$FILE_TO_COPY" "$PAZIENTE_ADMIN_DESTINATION_FOLDER/"
echo ">> File $FILE_TO_COPY copiato in $PAZIENTE_ADMIN_DESTINATION_FOLDER."
# Rinomina il file copiato
NEW_NAME2="admin-key.pem"
mv "$PAZIENTE_ADMIN_DESTINATION_FOLDER/$FILE_TO_COPY" "$PAZIENTE_ADMIN_DESTINATION_FOLDER/$NEW_NAME2"
echo ">> File $FILE_TO_COPY rinominato in $NEW_NAME2"