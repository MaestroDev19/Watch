"use client";

import { useState } from "react";
import { Tv, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import { login, logout } from "@/lib/actions";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "./ui/sheet";

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

        {/* Desktop Login Button */}
        <div className="hidden md:block">
          <Button onClick={async () => await login()} variant="outline">
            {/* Google "G" logo SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 48 48"
              fill="none"
            >
              <g>
                <path
                  fill="#4285F4"
                  d="M43.611 20.083H42V20H24v8h11.303C34.73 32.364 29.816 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c2.938 0 5.624 1.044 7.736 2.764l6.571-6.571C34.583 5.053 29.555 3 24 3 12.954 3 4 11.954 4 23s8.954 20 20 20c11.045 0 19.824-7.969 19.824-19.824 0-1.324-.138-2.338-.213-3.093z"
                />
                <path
                  fill="#34A853"
                  d="M6.306 14.691l6.571 4.822C14.655 16.084 19.001 13 24 13c2.938 0 5.624 1.044 7.736 2.764l6.571-6.571C34.583 5.053 29.555 3 24 3c-7.732 0-14.41 4.388-17.694 10.691z"
                />
                <path
                  fill="#FBBC05"
                  d="M24 43c5.616 0 10.32-1.86 13.76-5.07l-6.36-5.21C29.816 36 24 36 18.697 32.364l-6.571 5.071C9.59 38.612 16.268 43 24 43z"
                />
                <path
                  fill="#EA4335"
                  d="M43.611 20.083H42V20H24v8h11.303c-1.94 4.364-6.854 8-11.303 8-2.938 0-5.624-1.044-7.736-2.764l-6.571 5.071C9.59 38.612 16.268 43 24 43c7.732 0 14.41-4.388 17.694-10.691z"
                />
              </g>
            </svg>
            Login with Google
          </Button>
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

                {/* Mobile Auth Button */}
                <div className="space-y-3 pt-6 border-t">
                  <Button
                    onClick={async () => await login()}
                    className="w-full"
                    variant="outline"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 48 48"
                      fill="none"
                      className="mr-2"
                    >
                      <g>
                        <path
                          fill="#4285F4"
                          d="M43.611 20.083H42V20H24v8h11.303C34.73 32.364 29.816 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c2.938 0 5.624 1.044 7.736 2.764l6.571-6.571C34.583 5.053 29.555 3 24 3 12.954 3 4 11.954 4 23s8.954 20 20 20c11.045 0 19.824-7.969 19.824-19.824 0-1.324-.138-2.338-.213-3.093z"
                        />
                        <path
                          fill="#34A853"
                          d="M6.306 14.691l6.571 4.822C14.655 16.084 19.001 13 24 13c2.938 0 5.624 1.044 7.736 2.764l6.571-6.571C34.583 5.053 29.555 3 24 3c-7.732 0-14.41 4.388-17.694 10.691z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M24 43c5.616 0 10.32-1.86 13.76-5.07l-6.36-5.21C29.816 36 24 36 18.697 32.364l-6.571 5.071C9.59 38.612 16.268 43 24 43z"
                        />
                        <path
                          fill="#EA4335"
                          d="M43.611 20.083H42V20H24v8h11.303c-1.94 4.364-6.854 8-11.303 8-2.938 0-5.624-1.044-7.736-2.764l-6.571 5.071C9.59 38.612 16.268 43 24 43c7.732 0 14.41-4.388 17.694-10.691z"
                        />
                      </g>
                    </svg>
                    Login with Google
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

export function PrivateNav({ user }: { user: User | undefined }) {
  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <nav className="flex justify-between items-center p-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium">Picks</h1>
        </div>

        {/* Desktop Navigation */}
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

        {/* Desktop User Menu */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          <Avatar>
            <AvatarImage src={user?.user_metadata.avatar_url} />
            <AvatarFallback>
              {user?.user_metadata.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <Button onClick={async () => await logout()}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
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

                {/* Mobile User Section */}
                <div className="space-y-3 pt-6 border-t">
                  <div className="flex items-center space-x-3 p-2">
                    <Avatar>
                      <AvatarImage src={user?.user_metadata.avatar_url} />
                      <AvatarFallback>
                        {user?.user_metadata.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {user?.user_metadata.name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={async () => await logout()}
                    className="w-full"
                    variant="outline"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
