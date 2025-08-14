// Email service utility for sending booking notifications
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
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-booking-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: booking.email,
        customerName: booking.full_name,
        propertyTitle: booking.projects?.title || 'Property',
        unitType: booking.unit_type,
        status: status,
        rejectionReason: rejectionReason,
        bookingId: booking.id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }

    const result = await response.json();
    return { success: true, emailId: result.emailId };

  } catch (error) {
    console.error('Error sending booking notification:', error);
    throw error;
  }
};