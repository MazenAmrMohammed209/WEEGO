import { supabase } from './supabase';
import { Vehicle } from './supabaseActions';
import { createClient } from '@supabase/supabase-js';

// VEHICLE Mutations
export async function createVehicle(data: Partial<Vehicle>) {
  return await supabase.from('vehicles').insert([data]).select().single();
}

export async function updateVehicle(id: string, updates: Partial<Vehicle>) {
  return await supabase.from('vehicles').update(updates).eq('id', id).select().single();
}

export async function deleteVehicle(id: string) {
  return await supabase.from('vehicles').delete().eq('id', id);
}

// DRIVER Mutations
export async function assignDriverToTrip(bookingId: string, driverId: string, vehicleId?: string) {
  return await supabase.from('trip_assignments').insert([{
    booking_id: bookingId,
    driver_id: driverId,
    vehicle_id: vehicleId,
  }]).select().single();
}

export async function updateDriverStatus(userId: string, status: 'available' | 'on_trip' | 'offline') {
  return await supabase.from('drivers').update({ status }).eq('id', userId).select().single();
}

export async function createDriver(data: {
  full_name: string;
  phone: string;
}) {
  const { data: finalRes, error } = await supabase.from('drivers').insert([{
    name: data.full_name,
    phone: data.phone,
    status: 'available'
  }]).select().single();

  if (error) {
    console.error("Driver insert error:", error.message);
    throw error;
  } else {
    console.log("Driver created successfully");
  }

  return { success: true, data: finalRes };
}

// BOOKING Mutations
export async function updateBookingStatus(bookingId: string, status: string) {
  return await supabase.from('bookings').update({ status }).eq('id', bookingId).select().single();
}

// SUPPORT TICKET Mutations
export async function updateTicketStatus(ticketId: string, status: 'open' | 'in_progress' | 'resolved' | 'closed') {
  return await supabase.from('support_tickets').update({ status }).eq('id', ticketId).select().single();
}

// STAFF Mutations
export async function updateUserRole(userId: string, role: string) {
  // typically this requires edge function or service role since normal users cannot elevate privileges
  return await supabase.from('users').update({ role }).eq('id', userId).select().single();
}
