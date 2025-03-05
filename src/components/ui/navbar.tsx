
import React from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="border-b bg-white sticky top-0 z-50">
      <div className="container py-4">
        <div className="md:flex md:justify-between md:items-center">
          <Link to="/" className="font-bold text-2xl">
            Spaan
          </Link>

          <NavigationMenu>
            <NavigationMenuList className="md:flex md:items-center">
              <NavigationMenuItem>
                <Link to="/" className="nav-link">
                  Home
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/gigs" className="nav-link">
                  Find Gigs
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/post-job" className="nav-link">
                  Post a Job
                </Link>
              </NavigationMenuItem>

              {user ? (
                <>
                  <NavigationMenuItem>
                    <Link to="/profile" className="nav-link">
                      Profile
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Button variant="outline" size="sm" onClick={signOut}>
                      Sign Out
                    </Button>
                  </NavigationMenuItem>
                </>
              ) : (
                <NavigationMenuItem>
                  <Link to="/auth">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
