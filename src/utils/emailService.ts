// Email service utility for sending booking notifications using Supabase
import { supabase } from '@/integrations/supabase/client';

export const sendBookingNotification = async (
  booking: {
    id: string;
    email: string;
    full_name: string;
    unit_type: string;
    projects?: {
      title: string;
      location: string;
    };
  },
  status: 'approved' | 'rejected',
  rejectionReason?: string
) => {
  try {
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('send-booking-email', {
      body: {
        to: booking.email,
        customerName: booking.full_name,
        propertyTitle: booking.projects?.title || 'Property',
        unitType: booking.unit_type,
        status: status,
        rejectionReason: rejectionReason,
        bookingId: booking.id,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to send email');
    }

    return { success: true, emailId: data?.emailId || 'sent' };

  } catch (error) {
    console.error('Error sending booking notification:', error);
    throw error;
  }
};