
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context";
import { Menu, ShoppingCart } from "lucide-react";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Don't show sign-in button on the auth page
  const isAuthPage = location.pathname === "/auth";
  
  return <div className="border-b bg-white sticky top-0 z-50">
      <div className="container py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="font-bold text-2xl">
            Spaan
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} aria-label="Toggle menu">
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList className="flex items-center space-x-6">
              <NavigationMenuItem>
                <Link to="/gigs" className="text-gray-700 hover:text-blue-600 transition-colors px-2 py-1">
                  Find Gigs
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/post-job" className="text-gray-700 hover:text-blue-600 transition-colors px-2 py-1">
                  Post a Job
                </Link>
              </NavigationMenuItem>

              {user ? (
                <>
                  <NavigationMenuItem>
                    <Link to="/cart" className="text-gray-700 hover:text-blue-600 transition-colors px-2 py-1">
                      <ShoppingCart className="h-5 w-5" />
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/profile" className="text-gray-700 hover:text-blue-600 transition-colors px-2 py-1">
                      Profile
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Button variant="outline" size="sm" onClick={signOut}>
                      Sign Out
                    </Button>
                  </NavigationMenuItem>
                </>
              ) : !isAuthPage && (
                <NavigationMenuItem>
                  <Link to="/auth">
                    <Button variant="primary" size="sm" className="bg-spaan-primary hover:bg-spaan-primary/90">
                      Sign In
                    </Button>
                  </Link>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
          
          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-md p-4 z-50 border-b">
              <nav className="flex flex-col space-y-4">
                <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/gigs" className="text-gray-700 hover:text-blue-600 transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Find Gigs
                </Link>
                <Link to="/post-job" className="text-gray-700 hover:text-blue-600 transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Post a Job
                </Link>
                {user ? (
                  <>
                    <Link to="/cart" className="text-gray-700 hover:text-blue-600 transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="flex items-center">
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        <span>Cart</span>
                      </div>
                    </Link>
                    <Link to="/profile" className="text-gray-700 hover:text-blue-600 transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>
                      Profile
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }} className="w-full">
                      Sign Out
                    </Button>
                  </>
                ) : !isAuthPage && (
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                    <Button variant="primary" size="sm" className="w-full bg-spaan-primary hover:bg-spaan-primary/90">
                      Sign In
                    </Button>
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>;
};

export default Navbar;
