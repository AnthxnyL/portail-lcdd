// 📄 server.js
import express from 'express';
import router from './router.js';
import { PORT } from './config/env.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import shopifyRoutes from './routes/shopifyRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use('/shopify', shopifyRoutes);

// Utilisation du routeur global
app.use('/api', router);

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
