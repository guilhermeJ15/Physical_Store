"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = require("winston");
var logger = winston_1.default.createLogger({
    level: "info",
    format: winston_1.default.format.json(),
    transports: [
        new winston_1.default.transports.File({ filename: "logs.json" }),
        new winston_1.default.transports.Console({ format: winston_1.default.format.simple() })
    ]
});
exports.default = winston_1.default;
