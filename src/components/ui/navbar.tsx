
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out py-4",
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-2"
            aria-label="Spaan logo"
          >
            <span className="font-bold text-2xl text-spaan-primary">Spaan</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/explore"
              className="text-sm font-semibold text-spaan-primary hover:text-spaan-primary/80 transition-colors"
            >
              Explore
            </Link>
            <Link
              to="/services"
              className="text-sm font-semibold text-spaan-primary hover:text-spaan-primary/80 transition-colors"
            >
              Services
            </Link>
            <Link
              to="/providers"
              className="text-sm font-semibold text-spaan-primary hover:text-spaan-primary/80 transition-colors"
            >
              Providers
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-spaan-primary">
                    <User className="h-4 w-4 mr-2" />
                    {profile?.first_name || "Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/providers/apply")}>
                    Become a Provider
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="text-sm font-medium border-spaan-primary text-spaan-primary hover:bg-spaan-primary/10"
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
                <Button 
                  className="bg-spaan-primary hover:bg-spaan-primary/90 text-white"
                  onClick={() => navigate("/auth?tab=register")}
                >
                  Join
                </Button>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-spaan-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="absolute top-16 right-0 z-50 w-full bg-white shadow-lg rounded-b-lg overflow-hidden fade-in">
            <div className="flex flex-col py-4 px-6 space-y-4">
              <Link
                to="/explore"
                className="py-2 text-base font-medium text-spaan-primary hover:text-spaan-primary/80"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore
              </Link>
              <Link
                to="/services"
                className="py-2 text-base font-medium text-spaan-primary hover:text-spaan-primary/80"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                to="/providers"
                className="py-2 text-base font-medium text-spaan-primary hover:text-spaan-primary/80"
                onClick={() => setMobileMenuOpen(false)}
              >
                Providers
              </Link>
              <hr className="border-gray-200" />
              {user ? (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-center border-spaan-primary text-spaan-primary hover:bg-spaan-primary/10"
                    onClick={() => {
                      navigate("/profile");
                      setMobileMenuOpen(false);
                    }}
                  >
                    My Profile
                  </Button>
                  <Button
                    className="w-full justify-center bg-red-500 hover:bg-red-600 text-white"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-center border-spaan-primary text-spaan-primary hover:bg-spaan-primary/10"
                    onClick={() => {
                      navigate("/auth");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full justify-center bg-spaan-primary hover:bg-spaan-primary/90 text-white"
                    onClick={() => {
                      navigate("/auth?tab=register");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Join
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
