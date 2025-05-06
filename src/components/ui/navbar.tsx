
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
import { Menu, User, LogOut, LogIn, Home, Briefcase, Search, ShoppingCart, CreditCard, UserCog } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const isMobile = useMobile();
  const location = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const menuItems = [
    { label: "Home", href: "/", icon: <Home className="mr-2 h-4 w-4" /> },
    { label: "Services", href: "/services", icon: <Briefcase className="mr-2 h-4 w-4" /> },
    { label: "Explore", href: "/explore", icon: <Search className="mr-2 h-4 w-4" /> },
    { label: "Post Job", href: "/post-job", icon: <Briefcase className="mr-2 h-4 w-4" /> },
    { label: "Providers", href: "/providers", icon: <UserCog className="mr-2 h-4 w-4" /> },
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

  const NavLinks = () => (
    <>
      {menuItems.map((item) => (
        <Link
          key={item.label}
          to={item.href}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            location.pathname === item.href
              ? "text-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="fixed top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-xl">Spaan</span>
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
                    className="flex items-center px-2 py-1 text-muted-foreground hover:text-foreground"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
                <div className="h-px bg-border my-4" />
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center px-2 py-1 text-muted-foreground hover:text-foreground"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      to="/cart"
                      className="flex items-center px-2 py-1 text-muted-foreground hover:text-foreground"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Cart
                    </Link>
                    <Link
                      to="/admin-dashboard"
                      className="flex items-center px-2 py-1 text-muted-foreground hover:text-foreground"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                    <button
                      onClick={signOut}
                      className="flex w-full items-center px-2 py-1 text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center px-2 py-1 text-muted-foreground hover:text-foreground"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <>
            <nav className="mr-4 hidden md:flex items-center gap-2 md:gap-1">
              <NavLinks />
            </nav>
            <div className="ml-auto flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ""} />
                        <AvatarFallback>
                          {getInitials(user.user_metadata?.name || user.email || "User")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.user_metadata?.name || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
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
                      className="cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild>
                  <Link to="/auth">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
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
