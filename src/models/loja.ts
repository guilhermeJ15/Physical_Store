import mongoose from "mongoose";

const LojaSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    cep: { type: String, required: true },
    logradouro: String,
    bairro: String,
    localidade: String,
    uf: String,
    telefone: String,
    horario: String,
    latitude: Number,
    longitude: Number
});

export const Loja = mongoose.model("Loja", LojaSchema);
