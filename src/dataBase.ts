import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "./logger";

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        logger.info("Banco de dados MongoDB conectado!");
    } catch (error) {
        logger.error("Erro ao conectar ao banco:", error);
        process.exit(1);
    }
};

export default connectDB;

