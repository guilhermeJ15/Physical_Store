import express from "express";
import { cadastrarLoja, buscarLojas } from "./controllers/controllers";

const router = express.Router();

router.post("/lojas", cadastrarLoja);
router.get("/lojas/:cep", async (req, res) => {await buscarLojas (req, res)});

export default router;
