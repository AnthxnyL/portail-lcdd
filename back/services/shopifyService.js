import axios from 'axios';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const SHOPIFY_BASE_URL = process.env.SHOPIFY_BASE_URL; // URL de base Shopify
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;   // Clé API Shopify
const SHOPIFY_PASSWORD = process.env.SHOPIFY_PASSWORD; // Mot de passe API Shopify

export const createShopifyDiscountCode = async (priceRuleId, code) => {
    try {
        const response = await axios.post(
            `https://${SHOPIFY_BASE_URL}/admin/api/2023-01/price_rules/${priceRuleId}/discount_codes.json`,
            {
                discount_code: { code }, // Objet contenant le code promo
            },
            {
                auth: {
                    username: SHOPIFY_API_KEY,
                    password: SHOPIFY_PASSWORD,
                },
            }
        );

        return response.data.discount_code; // Retourne le code promo créé
    } catch (error) {
        console.error('Erreur API Shopify pour créer un code promo :', error.response?.data || error.message);
        throw error;
    }
};

export const getShopifyDiscountCodes = async (priceRuleId) => {
    try {
        const response = await axios.get(
            `https://${SHOPIFY_BASE_URL}/admin/api/2025-01/price_rules/${priceRuleId}/discount_codes.json`,
            {
                auth: {
                    username: SHOPIFY_API_KEY,
                    password: SHOPIFY_PASSWORD,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération du code promo :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du code promo.' });
    }
}


export const getSales = async (req, res) => {
    try {
        const openedOrdersResponse = await axios.get(
            `https://${SHOPIFY_BASE_URL}/admin/api/2025-01/orders.json?status=opened`,
            {
                auth: {
                    username: SHOPIFY_API_KEY,
                    password: SHOPIFY_PASSWORD,
                },
            }
        );

        
        const closedOrdersResponse = await axios.get(
            `https://${SHOPIFY_BASE_URL}/admin/api/2025-01/orders.json?status=closed`,
            {
                auth: {
                    username: SHOPIFY_API_KEY,
                    password: SHOPIFY_PASSWORD,
                },
            }
        );
        
        const response = [
            ...openedOrdersResponse.data.orders, 
            ...closedOrdersResponse.data.orders
        ];        
        return response;
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des ventes.' });
    }
}


export const deleteShopifyDiscountCode = async (code, res) => {
    try {
        const priceRuleId = '2140950135119';
        const response = await axios.delete( `https://${SHOPIFY_BASE_URL}/admin/api/2023-01/price_rules/${priceRuleId}/discount_codes/${code}`,
            {
                auth: {
                    username: SHOPIFY_API_KEY,
                    password: SHOPIFY_PASSWORD,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression du code promo :', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du code promo.' });
    }
}