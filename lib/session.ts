import { cookies } from "next/headers";
import { callN8n } from "./n8n";

export const SESSION_COOKIE = "gotur_session";

export type CurrentUser = {
  id: string;
  phone: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

export async function setSessionCookie(token: string, expiresAt: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    const { body } = await callN8n<{ user: CurrentUser }>("gotur/auth/me", { token });
    if (!body.ok) return null;
    return body.user;
  } catch {
    return null;
  }
}
