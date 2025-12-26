import { useEffect } from "react";
import { initMercadoPago } from "@mercadopago/sdk-react";
import { useRouter } from "next/navigation";

const useMercadoPago = () => {
    const router = useRouter();

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY) {
            initMercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY);
        } else {
            console.warn("Mercado Pago Public Key not found in environment variables.");
        }
    }, []);

    async function createMercadoPagoCheckout(checkoutData) {
        try {
            const response = await fetch("/api/mercado-pago/create-checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(checkoutData),
            });

            const data = await response.json();

            if (data.initPoint) {
                router.push(data.initPoint);
            } else {
                console.error("Failed to create preference", data);
            }
        } catch (error) {
            console.error(error);
        }
    }

    return { createMercadoPagoCheckout };
};

export default useMercadoPago;
