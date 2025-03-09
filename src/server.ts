import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./dataBase";
import router from "./routes";
import logger from "./logger";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(router);

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
    app.listen(PORT, () => logger.info(`🚀 Servidor rodando na porta ${PORT}`));
});
