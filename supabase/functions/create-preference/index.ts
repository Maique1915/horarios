import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// MERCADO PAGO ACCESS TOKEN (Adicione isso usando: supabase secrets set MP_ACCESS_TOKEN=...)
// Para testes rápidos, você pode colocar aqui, mas NÃO COMITE!
// const MP_ACCESS_TOKEN = "seu_access_token_aqui";

serve(async (req: { method: string; json: () => PromiseLike<{ title: any; unit_price: any; quantity: any; email: any; name: any }> | { title: any; unit_price: any; quantity: any; email: any; name: any } }) => {
    // CORS Headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { title, unit_price, quantity, email, name, userId } = await req.json()
        const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')

        if (!MP_ACCESS_TOKEN) {
            throw new Error('MP_ACCESS_TOKEN not set in Supabase Secrets')
        }

        const preferenceData = {
            items: [
                {
                    id: "registration-fee",
                    title: title || "Taxa de Adesão",
                    quantity: quantity || 1,
                    currency_id: "BRL",
                    unit_price: unit_price || 2.00
                }
            ],
            payer: {
                name: name?.split(' ')[0] || "User",
                surname: name?.split(' ').slice(1).join(' ') || "",
                email: email || "email@test.com"
            },
            back_urls: {
                success: "https://horarios-cefet.vercel.app/login?status=success",
                failure: "https://horarios-cefet.vercel.app/login?status=failure",
                pending: "https://horarios-cefet.vercel.app/login?status=pending"
            },
            auto_return: "approved",
            external_reference: userId
        }

        // Call Mercado Pago API
        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
            },
            body: JSON.stringify(preferenceData)
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Mercado Pago Error:', data)
            throw new Error(data.message || 'Erro ao criar preferência no Mercado Pago')
        }

        // Return the Init Point (URL)
        return new Response(
            JSON.stringify({
                init_point: data.init_point,
                sandbox_init_point: data.sandbox_init_point,
                id: data.id
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
