import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type HomeProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function hasOAuthCallbackParams(
  searchParams: HomeProps["searchParams"],
) {
  return Boolean(
    searchParams?.code ??
      searchParams?.error ??
      searchParams?.error_description,
  );
}

function buildCallbackRedirect(searchParams: HomeProps["searchParams"]) {
  const callbackParams = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (typeof value === "string") {
      callbackParams.set(key, value);
    }
  }

  return `/auth/callback?${callbackParams.toString()}`;
}

export default async function Home({ searchParams }: HomeProps) {
  if (hasOAuthCallbackParams(searchParams)) {
    redirect(buildCallbackRedirect(searchParams));
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  redirect("/login");
}
