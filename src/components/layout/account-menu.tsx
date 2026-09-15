import Link from "next/link";
import { User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth";

export function AccountMenu({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Account" />}>
        <User className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {isSignedIn ? (
          <>
            <DropdownMenuItem render={<Link href="/account" />}>My Profile</DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/account/orders" />}>My Orders</DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/account/custom-requests" />}>Custom Requests</DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/account/wishlist" />}>Wishlist</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<form action={signOutAction} className="w-full" />}>
              <button type="submit" className="w-full text-left">
                Logout
              </button>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem render={<Link href="/login" />}>Login</DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/register" />}>Create Account</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
