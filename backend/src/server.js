require('dotenv').config();
const express = require('express');
const cors = require('cors');

const produtoRoutes = require('./routes/produtoRoutes');
const clienteRoutes = require('./routes/clienteRoutes.js');
const vendaRoutes = require('./routes/vendaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotas da API da CARV
app.use('/api/produtos', produtoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/vendas', vendaRoutes);

// Rota de Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API da CARV rodando perfeitamente!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});