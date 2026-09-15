const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');

// Mapeamento das rotas de Produtos
router.get('/', produtoController.listarProdutos);
router.get('/:id', produtoController.buscarProdutoPorId);
router.post('/', produtoController.cadastrarProduto);
router.put('/:id', produtoController.atualizarProduto);
router.delete('/:id', produtoController.deletarProduto);

module.exports = router;