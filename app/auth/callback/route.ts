import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncGitHubToken } from "@/lib/github-token-sync";

function redirectToLogin(request: NextRequest, message: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/login";
  redirectUrl.searchParams.set("error", message);
  return NextResponse.redirect(redirectUrl);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const oauthError =
    request.nextUrl.searchParams.get("error_description") ??
    request.nextUrl.searchParams.get("error");

  if (oauthError) {
    return redirectToLogin(request, oauthError);
  }

  if (!code) {
    return redirectToLogin(request, "Missing OAuth callback code.");
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirectToLogin(request, error.message);
  }

  // provider_token is only available here, right after the OAuth exchange — it
  // is never in the JWT and not persisted by Supabase. Forward it to the
  // backend so the GitHub endpoints can act on the user's behalf.
  if (data.session) {
    await syncGitHubToken(data.session);
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/dashboard";
  redirectUrl.search = "";
  return NextResponse.redirect(redirectUrl);
}
