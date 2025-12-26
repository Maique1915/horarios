import { NextResponse } from "next/server";
import { Payment } from "mercadopago";
import mpClient, { verifyMercadoPagoSignature } from "@/lib/mercado-pago";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request) {
    try {
        // 1. Verificar assinatura (Descomente se tiver WEBHOOK_SECRET configurado no .env)
        const verification = verifyMercadoPagoSignature(request);
        if (verification) return verification; // Retorna erro se falhar

        const body = await request.json();
        const { type, data } = body;

        switch (type) {
            case "payment":
                const payment = new Payment(mpClient);
                const paymentData = await payment.get({ id: data.id });

                if (
                    paymentData.status === "approved" ||
                    (paymentData.status === "pending" && paymentData.payment_method_id === "pix") // Exemplo
                ) {
                    // Atualizar status do usuário no Supabase
                    const userId = paymentData.external_reference;

                    if (userId) {
                        const { error } = await supabase
                            .from('users')
                            .update({ is_paid: true }) // Assumindo que criamos essa coluna
                            .eq('id', userId);

                        if (error) {
                            console.error("Erro ao atualizar usuário no webhook:", error);
                            return NextResponse.json({ error: "Database update failed" }, { status: 500 });
                        }
                        console.log(`Usuário ${userId} atualizado para is_paid=true`);
                    }
                }
                break;
            default:
                console.log("Unhandled event type:", type);
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        console.error("Error handling webhook:", error);
        return NextResponse.json(
            { error: "Webhook handler failed" },
            { status: 500 }
        );
    }
}
