// 📄 server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './router.js';
import { PORT } from './config/env.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Utilisation du routeur global
app.use('/api', router);

app.use('/assets/pictures', express.static(path.join(__dirname, 'assets/pictures')));



// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
