"use client";

import { Tv, Menu } from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Watchlist", href: "/watchlist" },
  { label: "Search", href: "/search" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <nav className="flex justify-between items-center p-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium">Picks</h1>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {navLinks.map((link) => (
            <Link
              href={link.href}
              key={link.label}
              className="text-sm text-foreground hover:underline underline-offset-4"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-6">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col space-y-6">
                {/* Mobile Navigation Links */}
                <div className="space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="flex items-center space-x-3 text-lg font-medium text-foreground p-2"
                    >
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
