import axios from 'axios';
import { isFunctionExpression } from 'typescript';

export default function () {
    const { $axios } = useNuxtApp()

    const discountCode = ref(null);

    const getDiscountCode = async (name) => {
        try{
            const response = await $axios.get(`/shopify/get-code/${name}`);
            discountCode.value = response.data;
            return response.data;

        } catch (error) {
            console.error('Erreur lors de la récupération du code promo :', error.response?.data || error.message);
        }
    }

    function generateRandomCode(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    const createPromoCode = async (code = `PROMO-${generateRandomCode()}`) => {
        try {
            const response = await $axios.post(`/shopify/discount-code`, {
              code, // Nom du code promo à créer
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création du code promo :', error.response?.data || error.message);
        }
    };


    const deletePromoCode = async (code) => {
        try {
            const discountCode = await getDiscountCode(code);
            if (!discountCode) {
                throw new Error('Code promo introuvable');
              }
              const response = await $axios.delete(`/shopify/delete-code/${discountCode.id}.json`);
              alert('Code promo supprimé');
              return response.data;
        } catch (error) {
            console.error('Erreur lors de la suppression du code promo :', error.response?.data || error.message);
        }
    };
    


    return {
        createPromoCode,
        discountCode,
        getDiscountCode,
        deletePromoCode
    }

 }