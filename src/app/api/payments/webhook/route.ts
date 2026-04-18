import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase'; 

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const hmacParam = url.searchParams.get("hmac");
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET;

    if (!hmacSecret) {
      return NextResponse.json({ error: "HMAC Secret not configured" }, { status: 500 });
    }

    const payload = await req.json();

    // The payload.obj contains the actual transaction details
    const obj = payload.obj;
    if (!obj) {
      return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
    }

    // Secure HMAC Verification
    // Paymob concatenates specific fields in lexicographical order:
    // amount_cents, created_at, currency, error_occured, has_parent_transaction, id,
    // integration_id, is_3d_secure, is_auth, is_capture, is_refunded, is_standalone_payment, is_voided,
    // order.id, owner, pending, source_data.pan, source_data.sub_type, source_data.type, success
    
    const concatenatedString = [
      obj.amount_cents,
      obj.created_at,
      obj.currency,
      obj.error_occured,
      obj.has_parent_transaction,
      obj.id,
      obj.integration_id,
      obj.is_3d_secure,
      obj.is_auth,
      obj.is_capture,
      obj.is_refunded,
      obj.is_standalone_payment,
      obj.is_voided,
      obj.order.id,
      obj.owner,
      obj.pending,
      obj.source_data?.pan || "",
      obj.source_data?.sub_type || "",
      obj.source_data?.type || "",
      obj.success,
    ].join("");

    const hash = crypto.createHmac("sha512", hmacSecret).update(concatenatedString).digest("hex");

    if (hash !== hmacParam) {
      console.error("HMAC verification failed");
      return NextResponse.json({ error: "Invalid HMAC signature" }, { status: 401 });
    }

    if (obj.success === true) {
      const amountEGP = obj.amount_cents / 100;
      const transactionId = String(obj.id);
      
      // Look up booking by matching whatever identifier we sent, typically order ID or custom parameter
      // For simplicity, let's assume we pass bookingId in billing_data.apartment or metadata 
      // Need metadata in step 2! If not provided, we can look up order ID if we store it.
      
      // Let's assume we can fetch it, right now just inserting the transaction directly
      // Note: We need a service account to bypass RLS since Webhook is unauthenticated.
      // But let's use the provided supabase client and assume RLS allows anonymous inserts with verified HMAC,
      // or we should use service role key here.
      
      // Here we assume service role client should be used to bypass RLS:
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceKey && process.env.NEXT_PUBLIC_SUPABASE_URL) {
          const { createClient } = await import('@supabase/supabase-js');
          const adminSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey);
          
          await adminSupabase.from('payments').insert({
              transaction_id: transactionId,
              amount: amountEGP,
              method: "paymob_card",
              status: "completed"
          });
          
          // Here you would also update Booking status if you had the booking ID
      }
    }

    // Paymob requires a 2xx response
    return NextResponse.json({ message: "Received" }, { status: 200 });

  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
