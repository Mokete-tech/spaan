
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Trash2, AlertCircle, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface CartItem {
  id: string;
  service_id: string;
  user_id: string;
  quantity: number;
  service: {
    id: string;
    title: string;
    price: number;
    currency: string;
    image_url: string | null;
    provider_id: string;
    provider?: {
      business_name: string;
    };
  };
}

const Cart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  
  useEffect(() => {
    if (!user) {
      navigate("/auth?redirect=cart");
      return;
    }
    
    const fetchCartItems = async () => {
      try {
        // In a real implementation, this would fetch from a cart table
        // For now, we'll just simulate with some dummy data
        setCartItems([
          {
            id: "cart1",
            service_id: "service1",
            user_id: user.id,
            quantity: 1,
            service: {
              id: "service1",
              title: "Website Development",
              price: 1200,
              currency: "ZAR",
              image_url: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2831&auto=format&fit=crop",
              provider_id: "provider1",
              provider: {
                business_name: "Digital Solutions"
              }
            }
          },
          {
            id: "cart2",
            service_id: "service2",
            user_id: user.id,
            quantity: 1,
            service: {
              id: "service2",
              title: "Logo Design",
              price: 550,
              currency: "ZAR",
              image_url: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?q=80&w=2940&auto=format&fit=crop",
              provider_id: "provider2",
              provider: {
                business_name: "Creative Studio"
              }
            }
          }
        ]);
      } catch (error) {
        console.error("Error fetching cart items:", error);
        toast({
          title: "Error",
          description: "Failed to load your cart items",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCartItems();
  }, [user, navigate, toast]);
  
  const removeItem = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart"
    });
  };
  
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };
  
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    
    // Simulate coupon application
    // In a real app, this would validate against the backend
    if (couponCode.toUpperCase() === "WELCOME10") {
      setDiscount(10);
      toast({
        title: "Coupon applied",
        description: "10% discount has been applied to your order"
      });
    } else {
      toast({
        title: "Invalid coupon",
        description: "The coupon code you entered is invalid or expired",
        variant: "destructive"
      });
    }
  };
  
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => 
      total + (item.service.price * item.quantity), 0
    );
  };
  
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = subtotal * (discount / 100);
    return subtotal - discountAmount;
  };
  
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before checking out",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // In a real app, this would create an order and redirect to payment processing
      // For demo purposes, we'll just simulate the process
      
      // Group items by provider
      const itemsByProvider = cartItems.reduce((acc, item) => {
        const providerId = item.service.provider_id;
        if (!acc[providerId]) {
          acc[providerId] = [];
        }
        acc[providerId].push(item);
        return acc;
      }, {} as Record<string, CartItem[]>);
      
      // For each provider, create a transaction in escrow
      for (const providerId in itemsByProvider) {
        const items = itemsByProvider[providerId];
        const totalAmount = items.reduce((sum, item) => 
          sum + (item.service.price * item.quantity), 0
        );
        
        // Call our edge function to process payment and create escrow
        const { data, error } = await supabase.functions.invoke("process-payment", {
          body: {
            action: "start_escrow",
            serviceId: items[0].service_id, // Using first service for demo
            buyerId: user?.id,
            providerId,
            amount: totalAmount * (1 - discount/100), // Apply discount
            currency: "ZAR",
            paymentMethod: "card", // This would normally come from payment form
          },
        });
        
        if (error) throw error;
        
        if (!data.success) {
          throw new Error(data.message || "Payment processing failed");
        }
      }
      
      toast({
        title: "Order placed successfully!",
        description: "Your payment is now in escrow and will be released when the service is completed",
      });
      
      // Clear cart and redirect to orders page
      setCartItems([]);
      navigate("/profile");
      
    } catch (error: any) {
      toast({
        title: "Checkout failed",
        description: error.message || "There was a problem processing your order",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 md:px-6 pt-32 pb-16">
          <div className="flex justify-center items-center h-64">
            <p>Loading your cart...</p>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-32 pb-16">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any services to your cart yet.</p>
            <Button onClick={() => navigate("/services")}>
              Browse Services
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Cart Items ({cartItems.length})</h2>
                  
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex flex-col md:flex-row border-b py-4 last:border-0 last:pb-0">
                      <div className="md:w-1/4 mb-4 md:mb-0">
                        <img 
                          src={item.service.image_url || "https://via.placeholder.com/150"}
                          alt={item.service.title}
                          className="w-full h-24 object-cover rounded-md"
                        />
                      </div>
                      <div className="md:w-3/4 md:pl-6 flex flex-col justify-between">
                        <div>
                          <h3 className="font-medium">{item.service.title}</h3>
                          <p className="text-sm text-gray-500 mb-2">
                            By {item.service.provider?.business_name}
                          </p>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <button 
                              className="w-8 h-8 flex items-center justify-center border rounded-l-md"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              −
                            </button>
                            <span className="w-10 h-8 flex items-center justify-center border-t border-b">
                              {item.quantity}
                            </span>
                            <button 
                              className="w-8 h-8 flex items-center justify-center border rounded-r-md"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium">
                              R{(item.service.price * item.quantity).toFixed(2)}
                            </span>
                            <button 
                              onClick={() => removeItem(item.id)}
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-5 w-5 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discount}%)</span>
                      <span>-R{(calculateSubtotal() * (discount / 100)).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>R{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex gap-2 mb-2">
                    <div className="flex-grow">
                      <Input
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleApplyCoupon}
                    >
                      Apply
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Try "WELCOME10" for 10% off</p>
                </div>
                
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  disabled={isProcessing || cartItems.length === 0}
                  onClick={handleCheckout}
                >
                  {isProcessing ? "Processing..." : "Proceed to Checkout"}
                </Button>
                
                <p className="text-xs text-center text-gray-500 mt-4">
                  Payments are held in escrow until services are completed
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;
