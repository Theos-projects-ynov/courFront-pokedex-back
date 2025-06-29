"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const ws_1 = require("./config/ws");
const port = process.env.PORT || 4000;
const wsPort = process.env.WS_PORT || 4001;
app_1.default.listen(port, () => {
    console.log(`REST API running on http://localhost:${port}`);
});
(0, ws_1.setupWebSocketServer)(wsPort);
