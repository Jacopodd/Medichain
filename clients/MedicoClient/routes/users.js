var express = require('express');
var router = express.Router();
const app = express();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// Rotta dinamica per i dettagli di un utente
router.get('/:id', function(req, res, next) {
  const userId = req.params.id;
  res.render(`creazioneRicetta`, {userId});
});



module.exports = router;
