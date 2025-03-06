
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Trash2, AlertCircle, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import PaymentProcessor from "@/components/payments/PaymentProcessor";

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
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);
  const [selectedService, setSelectedService] = useState<CartItem | null>(null);
  
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
  
  const handleProceedToCheckout = (item: CartItem) => {
    setSelectedService(item);
    setShowPaymentProcessor(true);
  };
  
  const handleBuyAll = () => {
    // For demo purposes, we'll just take the first item
    // In a real app, you would handle multiple items
    if (cartItems.length > 0) {
      handleProceedToCheckout(cartItems[0]);
    }
  };
  
  const handlePaymentSuccess = (transactionId: string) => {
    toast({
      title: "Payment successful!",
      description: "Your payment has been processed and is being held in escrow until service completion.",
    });
    
    // Remove the purchased item from the cart
    if (selectedService) {
      removeItem(selectedService.id);
    }
    
    setShowPaymentProcessor(false);
    setSelectedService(null);
  };
  
  const handlePaymentCancel = () => {
    setShowPaymentProcessor(false);
    setSelectedService(null);
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
  
  // If payment processor is showing, render it
  if (showPaymentProcessor && selectedService) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="container mx-auto px-4 md:px-6 pt-32 pb-16">
          <PaymentProcessor 
            paymentDetails={{
              serviceId: selectedService.service.id,
              providerId: selectedService.service.provider_id,
              amount: selectedService.service.price * selectedService.quantity * (1 - discount/100),
              currency: selectedService.service.currency,
              description: selectedService.service.title
            }}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
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
                        
                        <Button 
                          onClick={() => handleProceedToCheckout(item)}
                          variant="outline" 
                          className="mt-3"
                        >
                          Checkout This Item
                        </Button>
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
                  onClick={handleBuyAll}
                >
                  {isProcessing ? "Processing..." : "Checkout All Items"}
                </Button>
                
                <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                  <p className="text-sm text-yellow-700">
                    <strong>Payment Notice:</strong> SA clients use PayFast (EFT/cards), international clients use Payoneer. 
                    Payments are held in escrow until service completion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;
