"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut, Settings, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Wordmark } from "@/components/shared/wordmark";
import { useAuth } from "@/lib/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";

function getMetadataString(
  metadata: Record<string, unknown> | undefined,
  key: string,
) {
  const value = metadata?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function getDisplayName(user: ReturnType<typeof useAuth>["user"]) {
  if (!user) {
    return "Account";
  }

  return (
    user.email ??
    getMetadataString(user.user_metadata, "user_name") ??
    getMetadataString(user.user_metadata, "preferred_username") ??
    "GitHub user"
  );
}

export function AppNav() {
  const { user, signOut, isLoading } = useAuth();
  const isUserMenuOpen = useAuthStore((state) => state.isUserMenuOpen);
  const setUserMenuOpen = useAuthStore((state) => state.setUserMenuOpen);
  const displayName = getDisplayName(user);
  const avatarUrl = getMetadataString(user?.user_metadata, "avatar_url");

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-background/70 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <Link href="/dashboard" className="min-w-0 rounded-lg">
          <Wordmark subtitle="TicketForge" />
        </Link>

        {isLoading ? (
          <div className="flex items-center gap-3" aria-label="Loading user">
            <Skeleton className="hidden h-4 w-32 bg-white/10 sm:block" />
            <Skeleton className="size-10 rounded-full bg-white/10" />
          </div>
        ) : (
          <DropdownMenu open={isUserMenuOpen} onOpenChange={setUserMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open user menu"
                className="size-10 overflow-hidden rounded-full border-white/10 bg-white/5 p-0 hover:bg-white/10"
                variant="outline"
              >
                {avatarUrl ? (
                  <Image
                    alt=""
                    className="size-full object-cover"
                    height={40}
                    src={avatarUrl}
                    width={40}
                  />
                ) : (
                  <UserCircle aria-hidden="true" className="size-6" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="glass-card w-64 border-white/10 bg-popover/95"
            >
              <DropdownMenuLabel className="font-normal">
                <span className="block text-xs uppercase text-muted-foreground">
                  Signed in as
                </span>
                <span className="mt-1 block truncate text-sm font-medium text-foreground">
                  {displayName}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings aria-hidden="true" className="size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                onSelect={(event) => {
                  event.preventDefault();
                  void signOut();
                }}
              >
                <LogOut aria-hidden="true" className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
