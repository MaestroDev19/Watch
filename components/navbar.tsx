"use client";

import { Tv, LogOut } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import { login, logout } from "@/lib/actions";

export function Nav() {
  return (
    <nav className="flex justify-between items-center p-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-medium">Picks</h1>
      </div>
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
    </nav>
  );
}

export function PrivateNav({ user }: { user: User | undefined }) {
  return (
    <nav className="flex justify-between items-center p-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-medium">Picks</h1>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm">{user?.email ?? "Guest"}</p>
        <Button onClick={async () => await logout()}>
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </nav>
  );
}
