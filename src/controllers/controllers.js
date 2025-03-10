"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarLojas = exports.cadastrarLoja = void 0;
const axios_1 = __importDefault(require("axios"));
const loja_1 = require("../models/loja");
const logger_1 = __importDefault(require("../logger"));
const calcularDistanciaHaversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
const cadastrarLoja = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nome, cep, telefone, horario } = req.body;
        const response = yield axios_1.default.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (response.data.erro)
            throw new Error("CEP não encontrado.");
        const { logradouro, bairro, localidade, uf } = response.data;
        const geoResponse = yield axios_1.default.get("https://nominatim.openstreetmap.org/search", {
            params: { q: `${cep}, Brasil`, format: "json" }
        });
        if (!geoResponse.data.length)
            throw new Error("Não foi possível obter coordenadas do CEP.");
        const { lat, lon } = geoResponse.data[0];
        const novaLoja = new loja_1.Loja({
            nome, cep, logradouro, bairro, localidade, uf, telefone, horario,
            latitude: parseFloat(lat), longitude: parseFloat(lon)
        });
        yield novaLoja.save();
        logger_1.default.info(`Loja cadastrada: ${nome}`);
        res.status(201).json({ message: "Loja cadastrada com sucesso!" });
    }
    catch (error) {
        logger_1.default.error(`Erro ao cadastrar loja: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});
exports.cadastrarLoja = cadastrarLoja;
const buscarLojas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cep } = req.params;
    try {
        const geoResponse = yield axios_1.default.get("https://nominatim.openstreetmap.org/search", {
            params: { q: `${cep}, Brasil`, format: "json" }
        });
        if (!geoResponse.data.length)
            throw new Error("Não foi possível obter coordenadas do CEP.");
        const { lat: latOrigem, lon: lonOrigem } = geoResponse.data[0];
        const lojas = yield loja_1.Loja.find();
        if (!lojas.length)
            return res.status(404).json({ error: "Nenhuma loja cadastrada." });
        let lojasProximas = [];
        for (const loja of lojas) {
            const distancia = calcularDistanciaHaversine(parseFloat(latOrigem), parseFloat(lonOrigem), loja.latitude, loja.longitude);
            if (distancia <= 100)
                lojasProximas.push(Object.assign(Object.assign({}, loja.toObject()), { distancia }));
        }
        if (!lojasProximas.length) {
            logger_1.default.info(`Nenhuma loja encontrada próxima ao CEP ${cep}`);
            return res.status(404).json({ error: "Nenhuma loja encontrada em um raio de 100km." });
        }
        lojasProximas.sort((a, b) => a.distancia - b.distancia);
        logger_1.default.info(`Lojas encontradas para o CEP ${cep}: ${JSON.stringify(lojasProximas)}`);
        res.json(lojasProximas);
    }
    catch (error) {
        logger_1.default.error(`Erro ao buscar lojas: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});
exports.buscarLojas = buscarLojas;
