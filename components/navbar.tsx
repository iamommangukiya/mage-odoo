"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Menu, Moon, Sun, User, LogOut, Settings, MessageSquare } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { NotificationDropdown } from './NotificationDropdown';

const notifications = [
  {
    id: 1,
    message: "Sarah wants to swap React for Python",
    time: "2 min ago",
    unread: true,
  },
  {
    id: 2,
    message: "Your swap request was accepted!",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    message: "New message from John",
    time: "3 hours ago",
    unread: false,
  },
]

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { user } = useFirebaseUser();
  const isLoggedIn = !!user;
  const [profile, setProfile] = useState<{ photo_url?: string } | null>(null);
  const unreadCount = notifications.filter((n) => n.unread).length

  useEffect(() => {
    if (user?.email) {
      fetch(`/api/user?email=${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) setProfile(data);
        });
    }
  }, [user?.email]);

  const avatarUrl = profile?.photo_url || user?.photoURL || '/placeholder.svg';

  const NavLinks = () => (
    <>
      <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
        Home
      </Link>
      <Link href="/browse" className="text-sm font-medium hover:text-primary transition-colors">
        Browse
      </Link>
      {isLoggedIn && (
        <>
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/chat" className="text-sm font-medium hover:text-primary transition-colors">
            Chat
          </Link>
        </>
      )}
    </>
  )

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-7 flex h-16 items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SS</span>
            </div>
            <span className="font-bold text-xl">SkillSwap</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <NavLinks />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {isLoggedIn ? (
            <>
              {/* Chat Button */}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/chat">
                  <MessageSquare className="h-4 w-4" />
                </Link>
              </Button>

              {/* Notification Bell */}
              <NotificationDropdown />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={avatarUrl} alt="User" />
                      <AvatarFallback>{user.displayName ? user.displayName.split(' ').map(n => n[0]).join('') : 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut(auth)}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-8">
                <NavLinks />
                {!isLoggedIn && (
                  <>
                    <Button variant="ghost" asChild>
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
