const express = require('express');
const router = express.Router();
const vendaController = require('../controllers/vendaController');

router.get('/', vendaController.listarVendas);
router.get('/:id', vendaController.buscarVendaPorId);
router.post('/', vendaController.cadastrarVenda);

module.exports = router;