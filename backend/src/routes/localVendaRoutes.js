const express = require('express');
const router = express.Router();
const localVendaController = require('../controllers/localVendaController');

router.get('/', localVendaController.listar);
router.get('/:id', localVendaController.buscarPorId);
router.post('/', localVendaController.criar);
router.put('/:id', localVendaController.atualizar);
router.delete('/:id', localVendaController.deletar);

module.exports = router;
