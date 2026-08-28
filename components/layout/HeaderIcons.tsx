import {
  ClipboardList,
  Heart,
  Menu,
  MessageCircle,
  Plus,
  Settings,
  User,
  X,
  type LucideIcon,
} from "lucide-react";

export type { LucideIcon };

const ICON_CLASS = "h-full w-full";

export function HeaderIcon({
  children,
  className = "h-[1.125rem] w-[1.125rem] shrink-0",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`} aria-hidden>
      {children}
    </span>
  );
}

function headerIcon(Icon: LucideIcon, strokeWidth = 1.75) {
  function Component({ className = ICON_CLASS }: { className?: string }) {
    return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
  }
  return Component;
}

export const MessagesIcon = headerIcon(MessageCircle);
export const PlusIcon = headerIcon(Plus, 2);
export const ListingsIcon = headerIcon(ClipboardList);
export const FavoritesIcon = headerIcon(Heart);
export const SettingsIcon = headerIcon(Settings);
export const UserIcon = headerIcon(User);

export function MenuIcon({
  open = false,
  className = ICON_CLASS,
}: {
  open?: boolean;
  className?: string;
}) {
  const Icon = open ? X : Menu;
  return <Icon className={className} strokeWidth={2} aria-hidden />;
}
