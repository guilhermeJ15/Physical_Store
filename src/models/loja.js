"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loja = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const LojaSchema = new mongoose_1.default.Schema({
    nome: { type: String, required: true },
    cep: { type: String, required: true },
    logradouro: String,
    bairro: String,
    localidade: String,
    uf: String,
    latitude: Number,
    longitude: Number
});
exports.Loja = mongoose_1.default.model("Loja", LojaSchema);
