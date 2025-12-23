import { supabase } from '../lib/supabaseClient';

export const createPaymentPreference = async (productTitle, price, userEmail, fullName, userId) => {
    try {
        const { data, error } = await supabase.functions.invoke('create-preference', {
            body: {
                title: productTitle,
                unit_price: price,
                quantity: 1,
                email: userEmail,
                name: fullName,
                userId: userId
            }
        });

        if (error) throw error;

        return { success: true, init_point: data.init_point, sandbox_init_point: data.sandbox_init_point };
    } catch (error) {
        console.error('Erro ao criar preferência de pagamento:', error);
        return { success: false, error: error.message };
    }
};
