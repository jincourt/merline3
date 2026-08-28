import Image from "next/image";
import { getAgentDisplayName } from "@/lib/agent-profiles";

type ProfileAvatarProps = {
  name: string;
  username?: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "profile-avatar-sm",
  md: "profile-avatar-md",
  lg: "profile-avatar-lg",
} as const;

export function ProfileAvatar({
  name,
  username,
  avatarUrl,
  size = "md",
  className = "",
}: ProfileAvatarProps) {
  const displayName = getAgentDisplayName({ name, username: username ?? name });
  const initial = displayName.charAt(0).toUpperCase();
  const imageUrl = avatarUrl?.trim();

  return (
    <span
      className={`profile-avatar ${sizeClasses[size]} ${className}`.trim()}
      aria-hidden={!imageUrl}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes={size === "lg" ? "80px" : size === "md" ? "40px" : "32px"}
          unoptimized
        />
      ) : (
        <span className="profile-avatar-initial">{initial}</span>
      )}
    </span>
  );
}
