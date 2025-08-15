import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

export default function DatabaseConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setTesting(true);
    const testResults: TestResult[] = [];

    // Test 1: Basic connection
    try {
      const { data, error } = await supabase.from("projects").select("id").limit(1);
      testResults.push({
        name: "Basic Connection",
        status: error ? 'error' : 'success',
        message: error ? error.message : "Connection successful",
        data: data
      });
    } catch (err) {
      testResults.push({
        name: "Basic Connection",
        status: 'error',
        message: `Connection failed: ${err}`,
      });
    }

    // Test 2: Contact submissions
    try {
      const { data, error } = await supabase.from("contact_submissions").select("*").limit(1);
      testResults.push({
        name: "Contact Submissions",
        status: error ? 'error' : 'success',
        message: error ? error.message : `Found ${data?.length || 0} records`,
        data: data
      });
    } catch (err) {
      testResults.push({
        name: "Contact Submissions",
        status: 'error',
        message: `Query failed: ${err}`,
      });
    }

    // Test 3: Property bookings (simple)
    try {
      const { data, error } = await supabase.from("property_bookings").select("*").limit(1);
      testResults.push({
        name: "Property Bookings (Simple)",
        status: error ? 'error' : 'success',
        message: error ? error.message : `Found ${data?.length || 0} records`,
        data: data
      });
    } catch (err) {
      testResults.push({
        name: "Property Bookings (Simple)",
        status: 'error',
        message: `Query failed: ${err}`,
      });
    }

    // Test 4: Property bookings with join
    try {
      const { data, error } = await supabase
        .from("property_bookings")
        .select(`
          *,
          projects:property_id(title, location)
        `)
        .limit(1);
      testResults.push({
        name: "Property Bookings (With Join)",
        status: error ? 'error' : 'success',
        message: error ? error.message : `Join successful with ${data?.length || 0} records`,
        data: data
      });
    } catch (err) {
      testResults.push({
        name: "Property Bookings (With Join)",
        status: 'error',
        message: `Join failed: ${err}`,
      });
    }

    // Test 5: Projects
    try {
      const { data, error } = await supabase.from("projects").select("*").limit(1);
      testResults.push({
        name: "Projects",
        status: error ? 'error' : 'success',
        message: error ? error.message : `Found ${data?.length || 0} records`,
        data: data
      });
    } catch (err) {
      testResults.push({
        name: "Projects",
        status: 'error',
        message: `Query failed: ${err}`,
      });
    }

    // Test 6: Announcements
    try {
      const { data, error } = await supabase.from("announcements").select("*").limit(1);
      testResults.push({
        name: "Announcements",
        status: error ? 'error' : 'success',
        message: error ? error.message : `Found ${data?.length || 0} records`,
        data: data
      });
    } catch (err) {
      testResults.push({
        name: "Announcements",
        status: 'error',
        message: `Query failed: ${err}`,
      });
    }

    // Test 7: RPC functions
    try {
      const { data, error } = await supabase.rpc('send_enhanced_booking_email', {
        recipient_email: 'test@example.com',
        customer_name: 'Test User',
        property_title: 'Test Property',
        unit_type: 'Test Unit',
        booking_status: 'confirmed',
        booking_id: 'test-123'
      });
      testResults.push({
        name: "RPC Functions",
        status: error ? 'error' : 'success',
        message: error ? error.message : "RPC function available",
        data: data
      });
    } catch (err) {
      testResults.push({
        name: "RPC Functions",
        status: 'error',
        message: `RPC test failed: ${err}`,
      });
    }

    setResults(testResults);
    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Database Connection Test
        </CardTitle>
        <CardDescription>
          Test database connectivity and identify issues with admin dashboard data fetching
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Running Tests...
            </>
          ) : (
            "Run Database Tests"
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-lg">Test Results</h3>
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                {result.data && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      View Data
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Troubleshooting Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Check if database migrations have been applied</li>
              <li>• Verify Supabase connection settings</li>
              <li>• Ensure proper table permissions</li>
              <li>• Check if foreign key relationships exist</li>
              <li>• Verify RLS (Row Level Security) policies if enabled</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}