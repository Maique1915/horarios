import { useState } from 'react';
import { createPaymentPreference } from '../lib/paymentService';

export const usePayment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentLink, setPaymentLink] = useState(null);

    const createPreference = async (productTitle, price, userEmail, fullName, userId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await createPaymentPreference(
                productTitle,
                price,
                userEmail,
                fullName,
                userId
            );

            if (result.success) {
                setPaymentLink(result.init_point);
                return { success: true, init_point: result.init_point };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            setError(err.message || 'Erro inesperado ao criar pagamento');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const resetPayment = () => {
        setPaymentLink(null);
        setError(null);
        setLoading(false);
    }

    return {
        loading,
        error,
        paymentLink,
        createPreference,
        resetPayment
    };
};
