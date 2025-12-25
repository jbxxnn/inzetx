import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-4 text-secondary-foreground">
      Hey, {user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"default"} className="bg-transparent text-secondary-foreground rounded-full">
        <Link href="/auth/login">Login</Link>
      </Button>
      <Button asChild size="sm" variant={"default"} className="bg-secondary-foreground text-secondary rounded-full">
        <Link href="/auth/sign-up">Get Started Free!</Link>
      </Button>
    </div>
  );
}
