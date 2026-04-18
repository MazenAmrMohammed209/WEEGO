import { supabase } from "./supabase";

export type BookingStatus = "pending" | "confirmed" | "assigned" | "in_progress" | "completed" | "cancelled";

export interface Booking {
  id: string;
  reference_number: string;
  customer_id: string;
  pickup_location: string;
  dropoff_location: string;
  scheduled_time: string;
  category_id?: string;
  vehicle_categories?: { id: string; name: string; capacity: number; };
  status: BookingStatus;
  price_estimated: number;
  price_final?: number;
  created_at: string;
}



export async function createBooking(
  pickup_location: string,
  dropoff_location: string,
  scheduled_time: string,
  reference_number: string,
  guest_name?: string,
  guest_phone?: string,
  guest_country?: string,
  passengers?: number,
  luggage?: number,
  customer_id?: string,
  category?: string,
  flight_number?: string,
  arrival_time?: string,
  category_id?: string,
  vehicle_id?: string,
  customer_email?: string
): Promise<{ data: string | null; error: Error | null }> {
  try {
    let customer_name = guest_name;
    let final_customer_email = customer_email;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      final_customer_email = final_customer_email || user.email;

      if (!customer_name || customer_name === "Unknown User") {
        customer_name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          "Unknown User";
      }
    }

    if (!customer_name) {
      customer_name = "Unknown User";
    }

    if (!final_customer_email) {
      final_customer_email = "unknown@weego.com";
    }

    const new_reference_number = "REF-" + crypto.randomUUID().split("-")[0].toUpperCase().substring(0, 6);

    const payload: Record<string, unknown> = {
      pickup_location,
      dropoff_location,
      scheduled_time,
      reference_number: reference_number || new_reference_number,
      status: 'pending',
      price_estimated: 0,
      customer_name: customer_name,
      customer_email: final_customer_email,
      full_name: guest_name,
      phone: guest_phone,
      customer_country: guest_country,
      passengers,
      luggage,
      category,
      flight_number,
      arrival_time,
      category_id,
      vehicle_id
    };
    if (customer_id) payload.customer_id = customer_id;

    if (!category_id) {
      throw new Error("Vehicle category is required.");
    }

    console.log("BOOKING PAYLOAD:", payload);

    const { data: insertData, error: insertError } = await supabase
      .from("bookings")
      .insert(payload)
      .select()
      .single();

    if (insertError) {
      console.error("Booking error:", JSON.stringify(insertError, null, 2));
      throw insertError;
    }

    return { data: insertData.id, error: null };
  } catch (err: unknown) {
    console.error("createBooking error:", err instanceof Error ? err.message : String(err));
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}


/**
 * Fetches the active user's bookings leveraging Supabase RLS policies.
 */
export async function fetchUserBookings(): Promise<{ data: Booking[] | null; error: Error | null }> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error("User must be authenticated to fetch bookings.");
    }

    const { data, error } = await supabase
      .from("bookings")
      .select("*, vehicle_categories(id, name, capacity)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (err: unknown) {
    console.error("fetchUserBookings error:", err instanceof Error ? err.message : String(err));
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  capacity: number;
  status: string;
  base_price: number;
  photo_url?: string;
  // Computed fields on frontend
  price?: number;
  bags?: number;
  features?: string[];
  name?: string;
  pax?: number;
}



export async function fetchAllBookings(page = 1, limit = 5, search = "", statusFilter = "all", dateFilter = "") {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error("User must be authenticated to fetch bookings.");
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("bookings")
      .select(`
        *,
        users (first_name, last_name, phone),
        drivers (id, name, status),
        vehicle_categories (id, name, capacity)
      `, { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`pickup_location.ilike.%${search}%,dropoff_location.ilike.%${search}%,full_name.ilike.%${search}%,reference_number.ilike.%${search}%`);
    }
    
    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }
    
    if (dateFilter) {
      const startDate = new Date(dateFilter);
      startDate.setUTCHours(0,0,0,0);
      const endDate = new Date(dateFilter);
      endDate.setUTCHours(23,59,59,999);
      query = query.gte('scheduled_time', startDate.toISOString()).lte('scheduled_time', endDate.toISOString());
    }

    const { data, count, error } = await query.range(from, to).limit(limit);

    if (error) throw error;

    return { data, count, error: null };
  } catch (err: unknown) {
    console.error("fetchAllBookings error:", err instanceof Error ? err.message : String(err));
    return { data: null, count: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}


export async function fetchAdminDashboardStats() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { data: null, error: userError || new Error('Not authenticated') };

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearAgoISO = oneYearAgo.toISOString();

    const [
      { count: bookingsCount },
      { count: activeTripsCount },
      { count: airportPickups },
      { count: activeVehiclesCount },
      { count: corporateCount },
      { data: recentBookings },
      { data: popularDestDB },
      { data: recentInvoices },
      { data: recentPayments },
      { data: rpcData }
    ] = await Promise.all([
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['in_progress', 'assigned']),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).ilike('pickup_location', '%airport%'),
      supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('corporate_accounts').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*, users(first_name, last_name, phone)').order('created_at', { ascending: false }).limit(6),
      supabase.from('bookings').select('dropoff_location').not('dropoff_location', 'is', null).order('created_at', { ascending: false }).limit(300),
      supabase.from('invoices').select('amount, status, created_at').gte('created_at', oneYearAgoISO),
      supabase.from('payments').select('amount, status, created_at').gte('created_at', oneYearAgoISO),
      supabase.rpc('get_admin_dashboard_stats')
    ]);

    // Calculate destinations specifically off recent subset avoiding full db locks
    const destCounts: Record<string, number> = {};
    if (popularDestDB) {
      popularDestDB.forEach((b) => {
        if (b.dropoff_location) destCounts[b.dropoff_location] = (destCounts[b.dropoff_location] || 0) + 1;
      });
    }

    const popularDestinations = Object.entries(destCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({
        name, count, percent: Math.round((count / (popularDestDB?.length || 1)) * 100)
      }));

    let dynamicRevenue = 0;
    if (recentInvoices) {
      dynamicRevenue += recentInvoices.reduce((acc, curr) => curr.status === 'success' ? acc + Number(curr.amount || 0) : acc, 0);
    }
    const b2cRevenue = recentPayments?.reduce((acc, curr) => curr.status === 'completed' ? acc + Number(curr.amount || 0) : acc, 0) || 0;

    const stats = {
      totalRevenue: dynamicRevenue + b2cRevenue + (rpcData?.total_revenue || 0),
      totalBookings: bookingsCount || rpcData?.total_bookings || 0,
      totalUsers: rpcData?.total_users || 0,
      totalDrivers: rpcData?.total_drivers || 0,
      activeTrips: activeTripsCount || 0,
      activeVehicles: activeVehiclesCount || 0,
      airportPickups: airportPickups || 0,
      corporateClients: corporateCount || 0,
      bookings: recentBookings || [],
      popularDestinations,
      invoices: recentInvoices || [],
      payments: recentPayments || []
    };

    return { data: stats, error: null };
  } catch (error: unknown) {
    console.error('fetchAdminDashboardStats exception:', error);
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
}


export async function fetchAdminVehicles(page = 1, limit = 5, search = "") {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) return { data: null, count: null, error: new Error("Unauthorized") };

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("vehicles")
      .select(`
        *,
        vehicle_categories (id, name, slug, capacity)
      `, { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`make.ilike.%${search}%,model.ilike.%${search}%,license_plate.ilike.%${search}%`);
    }

    const { data, count, error } = await query.range(from, to).limit(limit);

    if (error) throw error;
    return { data, count, error: null };
  } catch (err: unknown) {
    console.error("fetchAdminVehicles error:", err instanceof Error ? err.message : String(err));
    return { data: null, count: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

export async function fetchAdminDrivers(page = 1, limit = 5, search = "") {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) return { data: null, count: null, error: new Error("Unauthorized") };

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("drivers")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,national_id.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, count, error } = await query.range(from, to);

    if (error) throw error;
    
    return { data, count, error: null };
  } catch (err: unknown) {
    console.error("fetchAdminDrivers error:", err instanceof Error ? err.message : String(err));
    return { data: null, count: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

export async function fetchAdminAirportRequests(searchQuery?: string, statusFilter?: string) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) return { data: null, error: new Error("Unauthorized") };

  let query = supabase
    .from("bookings")
    .select(`
      *,
      users(first_name, last_name, phone)
    `)
    .eq("category", "airport_pickup")
    .order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.ilike("full_name", `%${searchQuery}%`);
  }

  if (statusFilter && statusFilter.toLowerCase() !== "all") {
    query = query.eq("status", statusFilter.toLowerCase());
  }

  const { data, error } = await query;

  return { data, error };
}

export async function fetchAdminPayments() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) return { data: null, error: new Error("Unauthorized") };

  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      bookings(reference_number, users(first_name, last_name))
    `)
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function fetchAdminCRM() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) return { data: null, error: new Error("Unauthorized") };

  const { data, error } = await supabase
    .from("corporate_accounts")
    .select("*")
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function fetchAdminStaff() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) return { data: null, error: new Error("Unauthorized") };

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .in("role", ["admin", "staff", "corporate_manager", "driver"])
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function fetchAdminTickets() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) return { data: null, error: new Error("Unauthorized") };

  const { data, error } = await supabase
    .from("support_tickets")
    .select(`
      *,
      users!support_tickets_customer_id_fkey(first_name, last_name, phone)
    `)
    .order("created_at", { ascending: false });

  return { data, error };
}

/**
 * Processes an airport request cleanly with exact DB matching schema.
 */
export async function createAirportRequest(
  booking_id: string,
  flight_number: string,
  arrival_time: string,
  passenger_count: number,
  luggage_count: number,
  ticket_file_url: string | null = null
): Promise<{ success: boolean; error: Error | null }> {
  let retries = 3;
  let lastError: Error | null = null;

  while (retries > 0) {
    try {
      const payload = {
        booking_id,
        flight_number,
        arrival_time,
        passenger_count,
        luggage_count,
        ticket_file_url
      };

      console.log("[Create Airport Request] Payload:", payload);

      const { data, error } = await supabase
        .from("airport_requests")
        .insert(payload)
        .select()
        .single();

      if (!error && data) {
        console.log("[Create Airport Request] Success:", data);
        return { success: true, error: null };
      }

      // console.warn(`[Create Airport Request] attempt failed (${retries} left):`, error?.message);
      lastError = error;
    } catch (err: unknown) {
      const currentErr = err instanceof Error ? err : new Error(String(err));
      // console.warn(`[Create Airport Request] exception (${retries} left):`, currentErr.message);
      lastError = currentErr;
    }

    retries--;
    if (retries > 0) {
      // Wait 1s before retrying
      await new Promise(res => setTimeout(res, 1000));
    }
  }

  return { success: false, error: lastError || new Error("Failed to insert into airport_requests after multiple retries") };
}

export async function fetchFinanceData() {
  const [invRes, pointsRes] = await Promise.all([
    supabase.from("invoices").select("*").order("created_at", { ascending: false }),
    supabase.from("loyalty_points").select("total_points")
  ]);

  if (invRes.error) {
    console.error("Failed to fetch invoices:", invRes.error);
    throw invRes.error;
  }

  const total = pointsRes.data ? pointsRes.data.reduce((sum, record) => sum + (record.total_points || 0), 0) : 0;

  return {
    invoices: invRes.data || [],
    totalPoints: total
  };
}
