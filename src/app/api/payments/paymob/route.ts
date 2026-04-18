import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Using the provided basic client although it's createBrowserClient

export async function POST(req: Request) {
  try {
    const { amountCents, currency = "EGP", bookingId, customerDetails } = await req.json();

    const apiKey = process.env.PAYMOB_API_KEY;
    const integrationId = process.env.PAYMOB_INTEGRATION_ID;

    if (!apiKey || !integrationId) {
      return NextResponse.json({ error: "Paymob configuration is missing." }, { status: 500 });
    }

    // Step 1: Authentication
    const authRes = await fetch("https://accept.paymob.com/api/auth/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey }),
    });
    const authData = await authRes.json();
    const token = authData.token;

    if (!token) throw new Error("Failed to authenticate with Paymob");

    // Step 2: Order Registration
    const orderRes = await fetch("https://accept.paymob.com/api/ecommerce/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: token,
        delivery_needed: "false",
        amount_cents: amountCents,
        currency: currency,
        items: [],
      }),
    });
    const orderData = await orderRes.json();
    const orderId = orderData.id;

    if (!orderId) throw new Error("Failed to register order with Paymob");

    // Step 3: Payment Key Generation
    const paymentKeyRes = await fetch("https://accept.paymob.com/api/acceptance/payment_keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: token,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          apartment: "NA",
          email: customerDetails.email || "customer@weego.com",
          floor: "NA",
          first_name: customerDetails.firstName || "Weego",
          street: "NA",
          building: "NA",
          phone_number: customerDetails.phone || "+201000000000",
          shipping_method: "NA",
          postal_code: "NA",
          city: "Cairo",
          country: "EG",
          last_name: customerDetails.lastName || "Customer",
          state: "Cairo",
        },
        currency: currency,
        integration_id: parseInt(integrationId, 10),
      }),
    });
    const paymentKeyData = await paymentKeyRes.json();
    const paymentToken = paymentKeyData.token;

    if (!paymentToken) throw new Error("Failed to generate payment key");

    // Optional: Log intent to 'payments' table as pending
    // We will do actual confirmation in webhook
    if (bookingId) {
      // NOTE: RLS might block this server-side if it's using an un-authenticated browser client!
      // In production, we'd use a generic insert or rely solely on webhook.
    }

    const iframeId = process.env.PAYMOB_IFRAME_ID;
    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`;

    return NextResponse.json({ iframeUrl, orderId });
  } catch (error: any) {
    console.error("Paymob Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
