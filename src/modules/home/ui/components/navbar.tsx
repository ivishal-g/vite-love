"use client";

import { Button } from "@/components/ui/button";
import { UserControl } from "@/components/user-control";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export const Navbar = () => {
  const isScrolled = useScroll();

  
  return (
    <nav
      className={cn(
        "p-4 fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b",
        isScrolled ? "bg-background border-border" : "bg-transparent border-transparent"
      )}
    >
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="boom" width={18} height={18} />
          <span className="font-semibold text-lg">Boom</span>
        </Link>

        {/* Logged OUT */}
        <SignedOut>
          <div className="flex gap-2">
            <SignUpButton mode="modal">
              <Button variant="outline" size="sm">
                Sign up
              </Button>
            </SignUpButton>

            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                Sign in
              </Button>
            </SignInButton>
          </div>
        </SignedOut>

        {/* Logged IN */}
        <SignedIn>
          <UserControl showName />
        </SignedIn>
      </div>
    </nav>
  );
};