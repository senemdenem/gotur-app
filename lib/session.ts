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

export function setSessionCookie(token: string, expiresAt: string) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export function getSessionToken(): string | null {
  return cookies().get(SESSION_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = getSessionToken();
  if (!token) return null;
  try {
    const { body } = await callN8n<{ user: CurrentUser }>("gotur/auth/me", { token });
    if (!body.ok) return null;
    return body.user;
  } catch {
    return null;
  }
}
