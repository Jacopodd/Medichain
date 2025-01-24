ORIG_DIR=$(pwd)
echo "La directory originale è: $ORIG_DIR"
cd addOrg3 || { echo "Errore: impossibile cambiare cartella"; exit 1; }

echo ">> Arresto e avvio del Canale Org3 (Farmacisti)..."
./addOrg3.sh down
./addOrg3.sh up
echo ">> Canale Org3 (Farmacisti) creato e aggiunto al canale correttamente!"

cd "$ORIG_DIR" || { echo "Errore: impossibile tornare alla cartella originale"; exit 1; }
echo "Tornati alla directory: $ORIG_DIR"