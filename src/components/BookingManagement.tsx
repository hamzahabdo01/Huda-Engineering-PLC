import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface PropertyBooking {
  id: string;
  property_id: string;
  full_name: string;
  email: string;
  phone: string;
  national_id: string;
  move_in_date: string | null;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  created_at: string;
  updated_at?: string;
  // Optional fields that might not exist in the current table
  unit_type?: string;
  secondary_phone?: string;
  preferred_contact?: string;
}

interface EmailLog {
  id: string;
  recipient_email: string;
  subject: string;
  status: string;
  created_at: string;
  booking_id: string;
}

export default function BookingManagement() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<PropertyBooking[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingBooking, setProcessingBooking] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<PropertyBooking | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showEmailLogs, setShowEmailLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch bookings and email logs
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching booking data...");
      
      // First, let's check what columns actually exist in the property_bookings table
      const { data: tableInfo, error: tableError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'property_bookings')
        .eq('table_schema', 'public');
      
      if (tableError) {
        console.warn("Could not fetch table schema:", tableError);
      } else {
        console.log("Available columns:", tableInfo);
      }
      
      // Fetch bookings with a simple query first
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("property_bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError);
        throw new Error(`Failed to fetch bookings: ${bookingsError.message}`);
      }

      console.log("Bookings fetched:", bookingsData);
      setBookings(bookingsData || []);

      // Try to fetch email logs if the table exists
      try {
        const { data: emailLogsData, error: emailLogsError } = await supabase
          .from("email_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (emailLogsError) {
          console.warn("Email logs table might not exist:", emailLogsError);
          setEmailLogs([]);
        } else {
          setEmailLogs(emailLogsData || []);
        }
      } catch (emailError) {
        console.warn("Email logs not available:", emailError);
        setEmailLogs([]);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to load booking data: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    fetchData();

    // Subscribe to booking changes
    const bookingChannel = supabase
      .channel('booking_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'property_bookings'
        },
        (payload) => {
          console.log('Booking change:', payload);
          fetchData(); // Refresh data when changes occur
        }
      )
      .subscribe();

    // Subscribe to email log changes (if table exists)
    const emailChannel = supabase
      .channel('email_log_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_logs'
        },
        (payload) => {
          console.log('Email log change:', payload);
          fetchData(); // Refresh data when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingChannel);
      supabase.removeChannel(emailChannel);
    };
  }, []);

  // Handle booking approval
  const handleApproveBooking = async (bookingId: string) => {
    setProcessingBooking(bookingId);
    try {
      // First try the enhanced function
      const { data, error } = await supabase.rpc('update_booking_status_with_enhanced_email', {
        p_booking_id: bookingId,
        p_status: 'approved'
      });

      if (error) {
        // Fallback to simple update if function doesn't exist
        console.warn("Enhanced function failed, trying simple update:", error);
        const { error: simpleError } = await supabase
          .from('property_bookings')
          .update({ 
            status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', bookingId);
        
        if (simpleError) throw simpleError;
        
        toast({
          title: "Booking Approved",
          description: "The booking has been approved.",
        });
      } else if (data?.success) {
        toast({
          title: "Booking Approved",
          description: "The booking has been approved and the customer has been notified via email.",
        });
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
      
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error approving booking:", error);
      toast({
        title: "Error",
        description: "Failed to approve booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingBooking(null);
    }
  };

  // Handle booking rejection
  const handleRejectBooking = async () => {
    if (!selectedBooking || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason.",
        variant: "destructive",
      });
      return;
    }

    setProcessingBooking(selectedBooking.id);
    try {
      // First try the enhanced function
      const { data, error } = await supabase.rpc('update_booking_status_with_enhanced_email', {
        p_booking_id: selectedBooking.id,
        p_status: 'rejected',
        p_rejection_reason: rejectionReason.trim()
      });

      if (error) {
        // Fallback to simple update if function doesn't exist
        console.warn("Enhanced function failed, trying simple update:", error);
        const { error: simpleError } = await supabase
          .from('property_bookings')
          .update({ 
            status: 'rejected',
            rejection_reason: rejectionReason.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedBooking.id);
        
        if (simpleError) throw simpleError;
        
        toast({
          title: "Booking Rejected",
          description: "The booking has been rejected.",
        });
      } else if (data?.success) {
        toast({
          title: "Booking Rejected",
          description: "The booking has been rejected and the customer has been notified via email.",
        });
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
      
      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedBooking(null);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error rejecting booking:", error);
      toast({
        title: "Error",
        description: "Failed to reject booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingBooking(null);
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600">Error Loading Data</h3>
          <p className="text-gray-600 mt-2">{error}</p>
          <Button onClick={fetchData} className="mt-4">
            <Loader2 className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Property Bookings</h2>
          <p className="text-gray-600">Manage and respond to property booking requests</p>
        </div>
        <Button onClick={() => setShowEmailLogs(true)} variant="outline">
          <Mail className="h-4 w-4 mr-2" />
          View Email Logs
        </Button>
      </div>

      {/* Debug Info */}
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-700">
            Total bookings loaded: {bookings.length} | 
            Email logs available: {emailLogs.length > 0 ? 'Yes' : 'No'}
          </p>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings ({bookings.length})</CardTitle>
          <CardDescription>
            Review and approve or reject property booking requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No bookings found</p>
              <p className="text-sm">New booking requests will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Property ID</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.full_name}</p>
                        <p className="text-sm text-gray-500">{booking.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.property_id}</p>
                        {booking.unit_type && (
                          <p className="text-sm text-gray-500">{booking.unit_type}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {booking.phone}
                        </div>
                        {booking.preferred_contact && (
                          <Badge variant="outline" className="text-xs">
                            {booking.preferred_contact}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell className="text-sm">
                      {formatDate(booking.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveBooking(booking.id)}
                              disabled={processingBooking === booking.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {processingBooking === booking.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowRejectDialog(true);
                              }}
                              disabled={processingBooking === booking.id}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Booking Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Full Name</Label>
                                <p className="text-sm">{booking.full_name}</p>
                              </div>
                              <div>
                                <Label>Email</Label>
                                <p className="text-sm">{booking.email}</p>
                              </div>
                              <div>
                                <Label>Phone Number</Label>
                                <p className="text-sm">{booking.phone}</p>
                                {booking.secondary_phone && (
                                  <p className="text-sm text-gray-500">{booking.secondary_phone}</p>
                                )}
                              </div>
                              <div>
                                <Label>National ID</Label>
                                <p className="text-sm">{booking.national_id}</p>
                              </div>
                              <div>
                                <Label>Property ID</Label>
                                <p className="text-sm">{booking.property_id}</p>
                              </div>
                              {booking.move_in_date && (
                                <div>
                                  <Label>Move-in Date</Label>
                                  <p className="text-sm">{booking.move_in_date}</p>
                                </div>
                              )}
                              {booking.notes && (
                                <div>
                                  <Label>Notes</Label>
                                  <p className="text-sm">{booking.notes}</p>
                                </div>
                              )}
                              {booking.rejection_reason && (
                                <div>
                                  <Label>Rejection Reason</Label>
                                  <p className="text-sm text-red-600">{booking.rejection_reason}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this booking. This will be sent to the customer via email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Please explain why this booking cannot be approved..."
              className="mt-2"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectBooking}
              disabled={!rejectionReason.trim() || processingBooking === selectedBooking?.id}
              className="bg-red-600 hover:bg-red-700"
            >
              {processingBooking === selectedBooking?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Reject Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Logs Dialog */}
      <Dialog open={showEmailLogs} onOpenChange={setShowEmailLogs}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Email Notification Logs</DialogTitle>
            <DialogDescription>
              Track all email notifications sent to customers
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {emailLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No email logs available</p>
                <p className="text-sm">Email logging may not be set up yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">{log.recipient_email}</TableCell>
                      <TableCell className="text-sm">{log.subject}</TableCell>
                      <TableCell>
                        <Badge 
                          className={log.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(log.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowEmailLogs(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}