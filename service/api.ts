import express from 'express';
import axios from 'axios';

const app = express();
const PORT = 3000;

app.get('/buscar-cep/:cep', async (req, res) => {
    const { cep } = req.params;

    try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar CEP' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
