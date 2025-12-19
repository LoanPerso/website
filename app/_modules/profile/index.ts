export type Profile = {
  id: string;
  displayName: string;
  updatedAt: string;
};

export function formatDisplayName(profile: Profile) {
  return profile.displayName || "Unnamed";
}
