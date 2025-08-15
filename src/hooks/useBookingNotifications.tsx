import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BookingNotification {
  id: string;
  booking_id: string;
  status: 'approved' | 'rejected';
  message: string;
  created_at: string;
  read: boolean;
}

interface BookingStatus {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  updated_at: string;
}

export function useBookingNotifications(userEmail?: string) {
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const [bookingStatuses, setBookingStatuses] = useState<Record<string, BookingStatus>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user's booking statuses
  const fetchBookingStatuses = useCallback(async () => {
    if (!userEmail) return;

    try {
      const { data, error } = await supabase
        .from('property_bookings')
        .select('id, status, rejection_reason, updated_at')
        .eq('email', userEmail);

      if (error) throw error;

      const statusMap: Record<string, BookingStatus> = {};
      data?.forEach((booking) => {
        statusMap[booking.id] = booking;
      });

      setBookingStatuses(statusMap);
    } catch (error) {
      console.error('Error fetching booking statuses:', error);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // Show notification toast for status changes
  const showStatusNotification = useCallback((booking: BookingStatus) => {
    if (booking.status === 'approved') {
      toast({
        title: "🎉 Booking Approved!",
        description: "Great news! Your property booking has been approved. Check your email for details.",
        duration: 10000,
      });
    } else if (booking.status === 'rejected') {
      toast({
        title: "📋 Booking Update",
        description: "Your booking status has been updated. Please check your email for details and alternative options.",
        variant: "destructive",
        duration: 10000,
      });
    }
  }, [toast]);

  // Set up real-time subscription for booking changes
  useEffect(() => {
    if (!userEmail) return;

    fetchBookingStatuses();

    const channel = supabase
      .channel('user_booking_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'property_bookings',
          filter: `email=eq.${userEmail}`
        },
        (payload) => {
          console.log('Booking status changed:', payload);
          
          const updatedBooking = payload.new as BookingStatus;
          const previousBooking = bookingStatuses[updatedBooking.id];

          // Update local state
          setBookingStatuses(prev => ({
            ...prev,
            [updatedBooking.id]: updatedBooking
          }));

          // Show notification if status changed from pending
          if (previousBooking?.status === 'pending' && updatedBooking.status !== 'pending') {
            showStatusNotification(updatedBooking);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userEmail, fetchBookingStatuses, showStatusNotification, bookingStatuses]);

  // Get booking status by ID
  const getBookingStatus = useCallback((bookingId: string) => {
    return bookingStatuses[bookingId];
  }, [bookingStatuses]);

  // Check if user has any pending bookings
  const hasPendingBookings = useCallback(() => {
    return Object.values(bookingStatuses).some(booking => booking.status === 'pending');
  }, [bookingStatuses]);

  // Get count of bookings by status
  const getBookingCounts = useCallback(() => {
    const counts = { pending: 0, approved: 0, rejected: 0 };
    Object.values(bookingStatuses).forEach(booking => {
      counts[booking.status]++;
    });
    return counts;
  }, [bookingStatuses]);

  // Subscribe to email notifications for a specific booking
  const subscribeToBookingEmail = useCallback(async (bookingId: string) => {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const latestEmail = data[0];
        return {
          subject: latestEmail.subject,
          status: latestEmail.status,
          sent_at: latestEmail.created_at
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching email logs:', error);
      return null;
    }
  }, []);

  return {
    bookingStatuses: Object.values(bookingStatuses),
    getBookingStatus,
    hasPendingBookings,
    getBookingCounts,
    subscribeToBookingEmail,
    loading,
    refreshStatuses: fetchBookingStatuses
  };
}