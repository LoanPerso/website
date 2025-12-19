export type AuthUser = {
  id: string;
  email?: string | null;
  provider?: "password" | "magic_link" | "oauth";
};

export function mapAuthUser(raw: Partial<AuthUser>): AuthUser {
  return {
    id: raw.id ?? "",
    email: raw.email ?? null,
    provider: raw.provider ?? "password"
  };
}
