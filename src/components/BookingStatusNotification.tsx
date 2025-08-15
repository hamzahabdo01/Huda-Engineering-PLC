import { useState, useEffect } from "react";
import { useBookingNotifications } from "@/hooks/useBookingNotifications";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Clock, Mail, Loader2 } from "lucide-react";

interface BookingStatusNotificationProps {
  userEmail?: string;
  className?: string;
}

export default function BookingStatusNotification({ 
  userEmail, 
  className = "" 
}: BookingStatusNotificationProps) {
  const [email, setEmail] = useState(userEmail || "");
  const [isChecking, setIsChecking] = useState(false);
  
  const { 
    bookingStatuses, 
    getBookingCounts, 
    loading, 
    refreshStatuses 
  } = useBookingNotifications(email);

  const counts = getBookingCounts();

  const handleCheckStatus = async () => {
    if (!email.trim()) return;
    
    setIsChecking(true);
    await refreshStatuses();
    setIsChecking(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">✅ Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">❌ Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Pending</Badge>;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Booking Status Checker
          </CardTitle>
          <CardDescription>
            Enter your email to check the status of your property booking requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleCheckStatus}
                disabled={!email.trim() || isChecking || loading}
              >
                {isChecking || loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Check Status
              </Button>
            </div>
          </div>

          {email && bookingStatuses.length > 0 && (
            <div className="space-y-4">
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-100 rounded-full"></div>
                  <span>{counts.pending} Pending</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-100 rounded-full"></div>
                  <span>{counts.approved} Approved</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-100 rounded-full"></div>
                  <span>{counts.rejected} Rejected</span>
                </div>
              </div>

              <div className="space-y-3">
                {bookingStatuses.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        <span className="font-medium">Booking #{booking.id.slice(-8)}</span>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      Last updated: {formatDate(booking.updated_at)}
                    </div>

                    {booking.status === 'approved' && (
                      <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                        <p className="text-green-800 font-medium">🎉 Congratulations!</p>
                        <p className="text-green-700">
                          Your booking has been approved. Our sales team will contact you within 24 hours.
                          Please check your email for detailed next steps.
                        </p>
                      </div>
                    )}

                    {booking.status === 'rejected' && booking.rejection_reason && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                        <p className="text-red-800 font-medium">Update Required</p>
                        <p className="text-red-700 mb-2">
                          Your booking requires review for the following reason:
                        </p>
                        <p className="text-red-800 italic">"{booking.rejection_reason}"</p>
                        <p className="text-red-700 mt-2">
                          Our team will contact you to discuss alternative options.
                        </p>
                      </div>
                    )}

                    {booking.status === 'pending' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                        <p className="text-yellow-800 font-medium">⏳ Under Review</p>
                        <p className="text-yellow-700">
                          Your booking is currently being reviewed by our team. 
                          You'll receive an email notification once there's an update.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {email && bookingStatuses.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No bookings found for this email address.</p>
              <p className="text-sm">Make sure you've entered the correct email used for booking.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}