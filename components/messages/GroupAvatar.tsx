import Image from "next/image";
import { Users } from "lucide-react";

type GroupAvatarProps = {
  title: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "profile-avatar-sm",
  md: "profile-avatar-md",
  lg: "profile-avatar-lg",
} as const;

export function GroupAvatar({
  title,
  imageUrl,
  size = "md",
  className = "",
}: GroupAvatarProps) {
  const initial = title.trim().charAt(0).toUpperCase() || "G";
  const url = imageUrl?.trim();

  return (
    <span
      className={`profile-avatar group-avatar ${sizeClasses[size]} ${className}`.trim()}
      aria-hidden={!url}
    >
      {url ? (
        <Image
          src={url}
          alt=""
          fill
          className="object-cover"
          sizes={size === "lg" ? "80px" : size === "md" ? "40px" : "32px"}
          unoptimized
        />
      ) : (
        <>
          <span className="group-avatar-icon" aria-hidden>
            <Users className="group-avatar-icon-svg" strokeWidth={1.75} />
          </span>
          <span className="sr-only">{initial}</span>
        </>
      )}
    </span>
  );
}
