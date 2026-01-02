import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  ShoppingCart, 
  User, 
  Package, 
  Truck, 
  MessageSquare, 
  Settings, 
  Users, 
  Image, 
  FileText,
  Search,
  Star,
  Phone,
  MapPin,
  Clock,
  Shield,
  CreditCard
} from "lucide-react";
import logo from "@/assets/alpenstore-logo.png";

const Documentation = () => {
  const handleDownloadPDF = () => {
    // Create a printable version
    window.print();
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-accent to-background">
        <div className="container-alpen">
          <div className="max-w-3xl mx-auto text-center">
            <img src={logo} alt="ALPEN STORE LTD" className="h-16 w-auto mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Website <span className="text-primary">Documentation</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Complete guide for customers and administrators
            </p>
            <Button onClick={handleDownloadPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Download as PDF
            </Button>
          </div>
        </div>
      </section>

      {/* Documentation Content */}
      <section className="py-12">
        <div className="container-alpen">
          <Tabs defaultValue="customer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="customer" className="text-base">Customer Guide</TabsTrigger>
              <TabsTrigger value="admin" className="text-base">Admin Manual</TabsTrigger>
            </TabsList>

            {/* Customer Guide */}
            <TabsContent value="customer" className="space-y-8">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-serif font-bold text-foreground mb-6">Customer Guide</h2>
                <p className="text-muted-foreground mb-8">
                  Welcome to ALPEN STORE LTD! This guide will help you navigate our website and make purchases easily.
                </p>
              </div>

              {/* Getting Started */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Getting Started - Creating an Account
                  </CardTitle>
                  <CardDescription>How to register and sign in to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">To Create a New Account:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Click the <strong>"Sign In"</strong> button in the top right corner of the website</li>
                      <li>Click <strong>"Sign Up"</strong> tab on the authentication page</li>
                      <li>Enter your email address and create a password</li>
                      <li>Click <strong>"Create Account"</strong> to complete registration</li>
                      <li>You will be automatically signed in after registration</li>
                    </ol>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">To Sign In:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Click the <strong>"Sign In"</strong> button</li>
                      <li>Enter your email and password</li>
                      <li>Click <strong>"Sign In"</strong> to access your account</li>
                    </ol>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-amber-800 text-sm">
                      <strong>Note:</strong> You must be signed in to add products to your cart and place orders.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Browsing Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Browsing Products
                  </CardTitle>
                  <CardDescription>How to find and view products</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Finding Products:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Click <strong>"Shop"</strong> in the navigation menu to view all products</li>
                      <li>Use the <strong>search bar</strong> to search for specific products by name</li>
                      <li>Use <strong>category filters</strong> to browse by: Arabian Perfumes, Islamic Wellness, Cosmetics & Beauty, or Dates</li>
                      <li>Use the <strong>sort dropdown</strong> to sort by: Newest, Price (Low to High), or Price (High to Low)</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Viewing Product Details:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Click on any product card to view full details</li>
                      <li>See larger product images, full description, and price</li>
                      <li>Read customer reviews and ratings</li>
                      <li>View related product recommendations</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Shopping Cart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Shopping Cart
                  </CardTitle>
                  <CardDescription>How to manage your cart</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Adding Items to Cart:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Sign in to your account (required)</li>
                      <li>Browse to the product you want to purchase</li>
                      <li>Select the quantity (on product detail page)</li>
                      <li>Click <strong>"Add to Cart"</strong></li>
                      <li>A confirmation message will appear</li>
                    </ol>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Viewing Your Cart:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Click the <strong>cart icon</strong> in the top navigation</li>
                      <li>A side panel will show all items in your cart</li>
                      <li>Adjust quantities or remove items as needed</li>
                      <li>View the total price at the bottom</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Placing Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Placing an Order
                  </CardTitle>
                  <CardDescription>How to complete your purchase via WhatsApp</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Checkout Process:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Click <strong>"Checkout"</strong> from your cart</li>
                      <li>Fill in your delivery information (phone number, address)</li>
                      <li>Choose delivery method: <strong>Branch Pickup</strong> or <strong>Home Delivery</strong></li>
                      <li>Add any special notes for your order</li>
                      <li>Click <strong>"Place Order via WhatsApp"</strong></li>
                      <li>WhatsApp will open with your order details pre-filled</li>
                      <li>Send the message to complete your order</li>
                    </ol>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 text-sm">
                      <strong>Payment:</strong> Payment is made upon delivery or pickup. We accept cash and bank transfers.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Tracking Your Order
                  </CardTitle>
                  <CardDescription>How to check your order status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Order Statuses:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Pending:</strong> Order received, awaiting confirmation</li>
                      <li><strong>Processing:</strong> Order is being prepared</li>
                      <li><strong>Shipped:</strong> Order is on the way (for delivery orders)</li>
                      <li><strong>Delivered:</strong> Order has been delivered/picked up</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">To View Order History:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Click your <strong>account icon</strong> in the navigation</li>
                      <li>Go to <strong>"Order History"</strong></li>
                      <li>View all your past and current orders</li>
                      <li>Click on an order to see full details and live status updates</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {/* Product Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Writing Product Reviews
                  </CardTitle>
                  <CardDescription>Share your experience with other customers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">How to Leave a Review:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>You must have <strong>purchased the product</strong> to leave a review</li>
                      <li>Go to the product page</li>
                      <li>Scroll down to the <strong>Reviews</strong> section</li>
                      <li>Enter your name and rating (1-5 stars)</li>
                      <li>Write your review text (optional)</li>
                      <li>Click <strong>"Submit Review"</strong></li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Contact & Support
                  </CardTitle>
                  <CardDescription>How to reach us</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Contact Methods:</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li><strong>Phone/WhatsApp:</strong> 09168877858</li>
                        <li><strong>Email:</strong> info@alpenstore.com.ng</li>
                        <li>Use the <strong>Contact Us</strong> page to send a message</li>
                        <li>Click the <strong>WhatsApp button</strong> (bottom right) for instant chat</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Branch Locations:</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                        <li>Head Office - Gwarzo Road, Kabuga</li>
                        <li>Hajj Camp Branch - Sale Mai Gwnjo Plaza</li>
                        <li>Zoo Road Branch - Ado Bayero Mall</li>
                        <li>Audu Bako Branch - Audu Bako Way</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Admin Manual */}
            <TabsContent value="admin" className="space-y-8">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-serif font-bold text-foreground mb-6">Admin Manual</h2>
                <p className="text-muted-foreground mb-8">
                  This guide covers all administrative functions for managing the ALPEN STORE website.
                </p>
              </div>

              {/* Admin Access */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Accessing the Admin Panel
                  </CardTitle>
                  <CardDescription>How to log in as an administrator</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Admin Login URL:</h4>
                    <p className="text-muted-foreground">
                      The admin panel is <strong>hidden from public navigation</strong> for security. To access it:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Go to: <code className="bg-muted px-2 py-1 rounded">/admin/login</code></li>
                      <li>Enter your admin email and password</li>
                      <li>Click <strong>"Sign In"</strong> to access the dashboard</li>
                    </ol>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">
                      <strong>Security Note:</strong> Never share the admin URL publicly. Only provide it to authorized staff members.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Managing Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Managing Products
                  </CardTitle>
                  <CardDescription>Add, edit, and delete products</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Adding a New Product:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Go to <strong>Admin Dashboard → Products</strong></li>
                      <li>Click <strong>"Add Product"</strong></li>
                      <li>Fill in the product details:
                        <ul className="list-disc list-inside ml-4 mt-1">
                          <li>Name (required)</li>
                          <li>Price in Naira (required)</li>
                          <li>Category: Arabian Perfumes, Islamic Wellness, Cosmetics & Beauty, or Dates</li>
                          <li>Description</li>
                          <li>Upload product image</li>
                        </ul>
                      </li>
                      <li>Set <strong>"In Stock"</strong> status</li>
                      <li>Check <strong>"Featured"</strong> to show on homepage (max 4 featured)</li>
                      <li>Click <strong>"Save Product"</strong></li>
                    </ol>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Editing Products:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Click on any product in the products list</li>
                      <li>Modify the fields you want to change</li>
                      <li>Click <strong>"Save Changes"</strong></li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Deleting Products:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Click the <strong>delete icon</strong> next to the product</li>
                      <li>Confirm the deletion when prompted</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Managing Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Managing Orders
                  </CardTitle>
                  <CardDescription>View and update order statuses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Viewing Orders:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Go to <strong>Admin Dashboard → Orders</strong></li>
                      <li>View all orders with customer details and status</li>
                      <li>Click on an order to see full details including items</li>
                    </ol>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Updating Order Status:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Find the order you want to update</li>
                      <li>Use the <strong>status dropdown</strong> to change status:</li>
                      <ul className="list-disc list-inside ml-4">
                        <li><strong>Pending</strong> → Order just received</li>
                        <li><strong>Processing</strong> → Order is being prepared</li>
                        <li><strong>Shipped</strong> → Order is on delivery</li>
                        <li><strong>Delivered</strong> → Order completed</li>
                        <li><strong>Cancelled</strong> → Order cancelled</li>
                      </ul>
                      <li>Status changes are reflected in customer's order history in real-time</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {/* Managing Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Managing Users
                  </CardTitle>
                  <CardDescription>Staff account management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">User Roles:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Admin:</strong> Full access to all features</li>
                      <li><strong>Moderator:</strong> Limited admin access</li>
                      <li><strong>User:</strong> Regular customer (no admin access)</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Managing Staff:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Go to <strong>Admin Dashboard → Users</strong></li>
                      <li>View all user accounts with their roles</li>
                      <li>Change user roles using the dropdown</li>
                      <li>Block/unblock users as needed</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {/* Managing Gallery */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5 text-primary" />
                    Managing Gallery
                  </CardTitle>
                  <CardDescription>Upload and manage gallery images</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Uploading Images:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Go to <strong>Admin Dashboard → Gallery</strong></li>
                      <li>Click <strong>"Upload Image"</strong></li>
                      <li>Select an image file from your device</li>
                      <li>Add a title/description (optional)</li>
                      <li>Click <strong>"Upload"</strong></li>
                    </ol>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Managing Images:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>View all uploaded images in the gallery</li>
                      <li>Delete images by clicking the delete icon</li>
                      <li>Images appear on the public Gallery page</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Site Settings
                  </CardTitle>
                  <CardDescription>Configure website settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Available Settings:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Go to <strong>Admin Dashboard → Settings</strong></li>
                      <li>Configure store information</li>
                      <li>Update contact details</li>
                      <li>Manage branch information</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Best Practices */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Best Practices
                  </CardTitle>
                  <CardDescription>Tips for effective admin management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Product Management:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Always upload clear, high-quality product images</li>
                      <li>Keep product descriptions accurate and detailed</li>
                      <li>Update stock status promptly when items sell out</li>
                      <li>Limit featured products to 4 for best homepage display</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Order Processing:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Check for new orders regularly (multiple times daily)</li>
                      <li>Update order status promptly as it changes</li>
                      <li>Contact customers via WhatsApp for order confirmations</li>
                      <li>Keep notes on special customer requests</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Security:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Never share the admin URL publicly</li>
                      <li>Use strong, unique passwords</li>
                      <li>Log out when finished with admin tasks</li>
                      <li>Only grant admin access to trusted staff</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Print Styles */}
      <style>{`
        @media print {
          header, footer, .no-print, button {
            display: none !important;
          }
          body {
            font-size: 12pt;
          }
          .container-alpen {
            max-width: 100%;
            padding: 0;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Documentation;
