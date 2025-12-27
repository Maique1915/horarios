import { NextResponse } from "next/server";
import { Preference } from "mercadopago";
import mpClient from "@/lib/mercado-pago";

export async function POST(req) {
    const { testeId, userEmail } = await req.json();

    try {
        console.log("Create Checkout API called with:", { testeId, userEmail });
        console.log("MP Client initialized:", !!mpClient);

        const preference = new Preference(mpClient);

        const createdPreference = await preference.create({
            body: {
                external_reference: testeId, // ID da compra/usuário no nosso sistema
                metadata: {
                    testeId,
                    // userEmail: userEmail,
                },
                ...(userEmail && {
                    payer: {
                        email: userEmail,
                    },
                }),

                items: [
                    {
                        id: "plano-semestral",
                        description: "Acesso semestral ao Gerador de Horários",
                        title: "Assinatura Semestral",
                        quantity: 1,
                        unit_price: 3.00,
                        currency_id: "BRL",
                        category_id: "services",
                    },
                ],
                payment_methods: {
                    installments: 12,
                },
                auto_return: "approved",
                back_urls: {
                    success: `${req.headers.get("origin")}/?status=sucesso`,
                    failure: `${req.headers.get("origin")}/?status=falha`,
                    pending: `${req.headers.get("origin")}/api/mercado-pago/pending`,
                },
            },
        });

        if (!createdPreference.id) {
            throw new Error("No preferenceID");
        }

        return NextResponse.json({
            preferenceId: createdPreference.id,
            initPoint: createdPreference.init_point,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.error();
    }
}
