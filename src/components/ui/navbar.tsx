
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "./sheet";
import { Menu, User, LogOut, LogIn, Briefcase, Search, ShoppingCart, CreditCard, UserCog } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "./navigation-menu";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const menuItems = [
    { label: "Find Gigs", href: "/explore", icon: <Search className="mr-2 h-4 w-4" /> },
    { label: "Post a Job", href: "/post-job", icon: <Briefcase className="mr-2 h-4 w-4" /> },
  ];

  const authMenuItems = user
    ? [
        { label: "Profile", href: "/profile", icon: <User className="mr-2 h-4 w-4" /> },
        { label: "Cart", href: "/cart", icon: <ShoppingCart className="mr-2 h-4 w-4" /> },
        { label: "Admin", href: "/admin-dashboard", icon: <CreditCard className="mr-2 h-4 w-4" /> },
        {
          label: "Logout",
          onClick: signOut,
          icon: <LogOut className="mr-2 h-4 w-4" />,
        },
      ]
    : [
        {
          label: "Login",
          href: "/auth",
          icon: <LogIn className="mr-2 h-4 w-4" />,
        },
      ];

  return (
    <header className="fixed top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-xl text-gray-900">Spaan</span>
        </Link>

        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="ml-auto">
                <Menu className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`flex items-center px-2 py-1 text-gray-800 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors ${
                      location.pathname === item.href ? "bg-gray-100 font-medium" : ""
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
                <div className="h-px bg-border my-4" />
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-2 py-3 mb-2 bg-gray-50 rounded-md">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ""} />
                        <AvatarFallback>
                          {getInitials(user.user_metadata?.name || user.email || "User")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {user.user_metadata?.name || "User"}
                        </span>
                        <span className="text-xs text-gray-600 truncate max-w-[160px]">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-2 py-1 text-gray-800 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      to="/cart"
                      className="flex items-center px-2 py-1 text-gray-800 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Cart
                    </Link>
                    <Link
                      to="/admin-dashboard"
                      className="flex items-center px-2 py-1 text-gray-800 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                    <button
                      onClick={signOut}
                      className="flex w-full items-center px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors mt-2"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <>
            <NavigationMenu className="mr-4 hidden md:flex">
              <NavigationMenuList>
                {menuItems.map((item) => (
                  <NavigationMenuItem key={item.label}>
                    <Link to={item.href}>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "text-gray-800 h-9 px-3",
                          location.pathname === item.href 
                            ? "bg-gray-100 font-semibold"
                            : "bg-transparent hover:bg-gray-50"
                        )}
                      >
                        {item.label}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
            <div className="ml-auto flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8 border border-gray-100">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ""} />
                        <AvatarFallback className="bg-blue-50 text-blue-700">
                          {getInitials(user.user_metadata?.name || user.email || "User")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-gray-900">
                          {user.user_metadata?.name || "User"}
                        </p>
                        <p className="text-xs leading-none text-gray-600">
                          {user.email || ""}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/cart" className="cursor-pointer">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Cart
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin-dashboard" className="cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={signOut}
                      className="cursor-pointer text-red-600 focus:text-red-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link to="/auth" className="flex items-center">
                    Sign In
                  </Link>
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
