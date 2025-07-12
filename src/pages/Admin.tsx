import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Users, MessageSquare, Building, Plus, Edit, Trash2, Eye, CheckCircle, XCircle, LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Admin = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [selectedTab, setSelectedTab] = useState("dashboard");

  // Mock data - in real app this would come from API
  const [bookings] = useState([
    { id: 1, propertyName: "Huda Apartment", clientName: "Ahmed Hassan", date: "2024-01-15", status: "pending" },
    { id: 2, propertyName: "SYS Luxury", clientName: "Meron Tadesse", date: "2024-01-10", status: "confirmed" },
  ]);

  const [announcements, setAnnouncements] = useState([
    { id: 1, title: "New Property Launch", content: "Exciting new luxury apartments available now!", date: "2024-01-12", status: "published" },
    { id: 2, title: "Office Hours Update", content: "New operating hours effective next month", date: "2024-01-08", status: "draft" },
  ]);

  const [contacts] = useState([
    { id: 1, name: "Solomon Bekele", email: "solomon@email.com", message: "Interested in commercial properties", date: "2024-01-14", status: "new" },
    { id: 2, name: "Rahel Tesfaye", email: "rahel@email.com", message: "Looking for residential apartments", date: "2024-01-13", status: "responded" },
  ]);

  const [properties, setProperties] = useState([
    { id: 1, name: "Huda Apartment Building", type: "Residential", floors: "B+G+9", price: "251M ETB", status: "available" },
    { id: 2, name: "SYS Luxury Apartments", type: "Residential", floors: "2B+G+13", price: "350M ETB", status: "available" },
  ]);

  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [newProperty, setNewProperty] = useState({
    name: "",
    type: "",
    floors: "",
    price: "",
    description: ""
  });

  const handleAddProperty = () => {
    const property = {
      id: properties.length + 1,
      ...newProperty,
      status: "available"
    };
    setProperties([...properties, property]);
    setNewProperty({ name: "", type: "", floors: "", price: "", description: "" });
    setIsAddPropertyOpen(false);
  };

  const handleDeleteProperty = (id: number) => {
    setProperties(properties.filter(p => p.id !== id));
  };

  const stats = [
    { title: "Total Bookings", value: bookings.length, icon: Calendar, color: "text-blue-600" },
    { title: "Active Properties", value: properties.length, icon: Building, color: "text-green-600" },
    { title: "New Contacts", value: contacts.filter(c => c.status === "new").length, icon: MessageSquare, color: "text-purple-600" },
    { title: "Published Announcements", value: announcements.filter(a => a.status === "published").length, icon: Users, color: "text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="py-12 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {t("admin.title")}
              </h1>
              <p className="text-xl text-muted-foreground">
                Manage your property business efficiently
              </p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="bg-background/80 hover:bg-background"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t("auth.logout")}
            </Button>
          </div>
        </div>
      </section>

      {/* Admin Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">{t("admin.dashboard")}</TabsTrigger>
              <TabsTrigger value="bookings">{t("admin.bookings")}</TabsTrigger>
              <TabsTrigger value="announcements">{t("admin.announcements")}</TabsTrigger>
              <TabsTrigger value="contacts">{t("admin.contacts")}</TabsTrigger>
              <TabsTrigger value="properties">{t("admin.properties")}</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <Card key={index}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <IconComponent className={`h-4 w-4 ${stat.color}`} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">New Booking</Badge>
                      <span className="text-sm">Ahmed Hassan booked Huda Apartment</span>
                      <span className="text-xs text-muted-foreground ml-auto">2 hours ago</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">Contact</Badge>
                      <span className="text-sm">New contact form submission from Solomon</span>
                      <span className="text-xs text-muted-foreground ml-auto">5 hours ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.bookings")}</CardTitle>
                  <CardDescription>Manage property bookings and reservations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{booking.propertyName}</TableCell>
                          <TableCell>{booking.clientName}</TableCell>
                          <TableCell>{booking.date}</TableCell>
                          <TableCell>
                            <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Announcements Tab */}
            <TabsContent value="announcements" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t("admin.announcements")}</CardTitle>
                    <CardDescription>Create and manage announcements</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Announcement
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {announcements.map((announcement) => (
                        <TableRow key={announcement.id}>
                          <TableCell>{announcement.title}</TableCell>
                          <TableCell>{announcement.date}</TableCell>
                          <TableCell>
                            <Badge variant={announcement.status === "published" ? "default" : "secondary"}>
                              {announcement.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contacts Tab */}
            <TabsContent value="contacts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.contacts")}</CardTitle>
                  <CardDescription>View and respond to contact form submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell>{contact.name}</TableCell>
                          <TableCell>{contact.email}</TableCell>
                          <TableCell className="max-w-xs truncate">{contact.message}</TableCell>
                          <TableCell>{contact.date}</TableCell>
                          <TableCell>
                            <Badge variant={contact.status === "new" ? "destructive" : "default"}>
                              {contact.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Properties Tab */}
            <TabsContent value="properties" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t("admin.properties")}</CardTitle>
                    <CardDescription>Manage your property portfolio</CardDescription>
                  </div>
                  <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("admin.addProperty")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("admin.addProperty")}</DialogTitle>
                        <DialogDescription>Add a new property to your portfolio</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Property Name</Label>
                          <Input
                            id="name"
                            value={newProperty.name}
                            onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="type">Type</Label>
                          <Input
                            id="type"
                            value={newProperty.type}
                            onChange={(e) => setNewProperty({ ...newProperty, type: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="floors">Floors</Label>
                          <Input
                            id="floors"
                            value={newProperty.floors}
                            onChange={(e) => setNewProperty({ ...newProperty, floors: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Price</Label>
                          <Input
                            id="price"
                            value={newProperty.price}
                            onChange={(e) => setNewProperty({ ...newProperty, price: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newProperty.description}
                            onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                          />
                        </div>
                        <Button onClick={handleAddProperty} className="w-full">
                          Add Property
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Floors</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.map((property) => (
                        <TableRow key={property.id}>
                          <TableCell>{property.name}</TableCell>
                          <TableCell>{property.type}</TableCell>
                          <TableCell>{property.floors}</TableCell>
                          <TableCell>{property.price}</TableCell>
                          <TableCell>
                            <Badge variant="default">{property.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleDeleteProperty(property.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Admin;