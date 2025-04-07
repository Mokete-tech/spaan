
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context";
import { Menu, ShoppingCart, X, User } from "lucide-react";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  // Handle scrolling effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Don't show sign-in button on the auth page
  const isAuthPage = location.pathname === "/auth";
  
  return (
    <div className={`border-b sticky top-0 z-50 transition-all duration-200 ${scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-white"}`}>
      <div className="container py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="font-bold text-2xl text-spaan-primary">
            Spaan
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} aria-label="Toggle menu">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList className="flex items-center space-x-6">
              <NavigationMenuItem>
                <Link to="/gigs" className="text-gray-700 hover:text-spaan-primary transition-colors px-2 py-1">
                  Find Gigs
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/post-job" className="text-gray-700 hover:text-spaan-primary transition-colors px-2 py-1">
                  Post a Job
                </Link>
              </NavigationMenuItem>

              {user ? (
                <>
                  <NavigationMenuItem>
                    <Link to="/cart" className="text-gray-700 hover:text-spaan-primary transition-colors p-2 rounded-full hover:bg-gray-100">
                      <ShoppingCart className="h-5 w-5" />
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/profile" className="flex items-center text-gray-700 hover:text-spaan-primary transition-colors px-3 py-1 rounded-full hover:bg-gray-100">
                      <User className="h-4 w-4 mr-2" />
                      <span>Profile</span>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Button variant="outline" size="sm" onClick={signOut} className="border-spaan-primary text-spaan-primary hover:bg-spaan-primary/10 hover:text-spaan-primary">
                      Sign Out
                    </Button>
                  </NavigationMenuItem>
                </>
              ) : !isAuthPage && (
                <NavigationMenuItem>
                  <Link to="/auth">
                    <Button variant="default" size="sm" className="bg-spaan-primary hover:bg-spaan-primary/90 text-white">
                      Sign In
                    </Button>
                  </Link>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
          
          {/* Mobile Navigation */}
          <div className={`md:hidden fixed inset-0 bg-white z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex justify-between items-center p-4 border-b">
              <Link to="/" className="font-bold text-2xl text-spaan-primary" onClick={() => setIsMobileMenuOpen(false)}>
                Spaan
              </Link>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu} aria-label="Close menu">
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="p-4">
              <nav className="flex flex-col space-y-4">
                <Link to="/" className="text-gray-700 hover:text-spaan-primary transition-colors py-2 border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/gigs" className="text-gray-700 hover:text-spaan-primary transition-colors py-2 border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                  Find Gigs
                </Link>
                <Link to="/post-job" className="text-gray-700 hover:text-spaan-primary transition-colors py-2 border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                  Post a Job
                </Link>
                {user ? (
                  <>
                    <Link to="/cart" className="text-gray-700 hover:text-spaan-primary transition-colors py-2 border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="flex items-center">
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        <span>Cart</span>
                      </div>
                    </Link>
                    <Link to="/profile" className="text-gray-700 hover:text-spaan-primary transition-colors py-2 border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        <span>Profile</span>
                      </div>
                    </Link>
                    <Button variant="outline" className="mt-4 border-spaan-primary text-spaan-primary hover:bg-spaan-primary/10" onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}>
                      Sign Out
                    </Button>
                  </>
                ) : !isAuthPage && (
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="w-full mt-4">
                    <Button variant="default" size="sm" className="w-full bg-spaan-primary hover:bg-spaan-primary/90 text-white">
                      Sign In
                    </Button>
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
