import { Request, Response } from "express";
import axios from "axios";
import { Loja } from "../models/loja";
import logger from "../logger";

const calcularDistanciaHaversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const cadastrarLoja = async (req: Request, res: Response) => {
    try {
        const { nome, cep, telefone, horario } = req.body;

        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (response.data.erro) throw new Error("CEP não encontrado.");

        const { logradouro, bairro, localidade, uf } = response.data;

        const geoResponse = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: { q: `${cep}, Brasil`, format: "json" }
        });

        if (!geoResponse.data.length) throw new Error("Não foi possível obter coordenadas do CEP.");

        const { lat, lon } = geoResponse.data[0];

        const novaLoja = new Loja({
            nome, cep, logradouro, bairro, localidade, uf, telefone, horario,
            latitude: parseFloat(lat), longitude: parseFloat(lon)
        });

        await novaLoja.save();
        logger.info(`Loja cadastrada: ${nome}`);
        res.status(201).json({ message: "Loja cadastrada com sucesso!" });
    } catch (error: any) {
        logger.error(`Erro ao cadastrar loja: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

export const buscarLojas = async (req: Request, res: Response) => {
    const { cep } = req.params;

    try {
        const geoResponse = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: { q: `${cep}, Brasil`, format: "json" }
        });

        if (!geoResponse.data.length) throw new Error("Não foi possível obter coordenadas do CEP.");

        const { lat: latOrigem, lon: lonOrigem } = geoResponse.data[0];

        const lojas = await Loja.find();
        if (!lojas.length) return res.status(404).json({ error: "Nenhuma loja cadastrada." });

        let lojasProximas = [];
        for (const loja of lojas) {
            const distancia = calcularDistanciaHaversine(
                parseFloat(latOrigem), parseFloat(lonOrigem), loja.latitude!, loja.longitude!
            );

            if (distancia <= 100) lojasProximas.push({ ...loja.toObject(), distancia });
        }

        if (!lojasProximas.length) {
            logger.info(`Nenhuma loja encontrada próxima ao CEP ${cep}`);
            return res.status(404).json({ error: "Nenhuma loja encontrada em um raio de 100km." });
        }

        lojasProximas.sort((a, b) => a.distancia - b.distancia);
        logger.info(`Lojas encontradas para o CEP ${cep}: ${JSON.stringify(lojasProximas)}`);
        res.json(lojasProximas);
    } catch (error: any) {
        logger.error(`Erro ao buscar lojas: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
