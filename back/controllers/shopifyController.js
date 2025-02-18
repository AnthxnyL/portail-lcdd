import { createShopifyDiscountCode, getShopifyDiscountCodes, getSales, deleteShopifyDiscountCode } from '../services/shopifyService.js';

export const createDiscountCode = async (req, res) => {
    try {
        const { code } = req.body; 
        const priceRuleId = '2140950135119';
        const discountCode = await createShopifyDiscountCode(priceRuleId, code);
        
        res.status(201).json(discountCode);
        return discountCode;
    } catch (error) {
        console.error('Erreur lors de la création du code promo :', error);
        res.status(500).json({ error: 'Erreur lors de la création du code promo.' });
    }
};

export const getDiscountCodeByName = async (req, res) => {
    try{
        const { code } = req.params;
        const priceRuleId = '2140950135119'; 
        const discountCodes = await getShopifyDiscountCodes(priceRuleId)
        const discountCodesList = discountCodes.discount_codes || [];
        const matchingCode = discountCodesList.find(discountCode => discountCode.code === code);
        if (matchingCode) {
            res.status(200).json(matchingCode);
        } else {
            res.status(404).json({ error: 'Code promo introuvable.' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du code promo :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du code promo.' });
    }
}

export const getSalesByDiscountCode = async (req, res) => {
    try{
        const { code } = req.params;
        const sales = await getSales()
        const salesWithDiscountCode = sales.filter(sale => sale.discount_codes.some(discountCode => discountCode.code === code));
        res.status(200).json(salesWithDiscountCode);
    
    } catch (error) {
        console.error('Erreur lors de la récupération des ventes par code promo :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des ventes par code promo.' });
    }
}


export const deleteDiscountCode = async (req, res) => {
    try {
        const code = await deleteShopifyDiscountCode(req.params.code);

        if (code) {
            res.status(204).end();
        } else {
            res.status(404).json({ error: 'Code promo introuvable.' });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du code promo :', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du code promo.' });
    }
}