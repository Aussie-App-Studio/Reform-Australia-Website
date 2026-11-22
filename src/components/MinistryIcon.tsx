import {
  Anchor,
  BookOpenCheck,
  Compass,
  Flame,
  Globe2,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Mail,
  MapPinPlus,
  MessageCircleHeart,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Trees,
} from 'lucide-react';

const iconMap = {
  Anchor,
  BookOpenCheck,
  Compass,
  Flame,
  Globe2,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Mail,
  MapPinPlus,
  MessageCircleHeart,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Trees,
} as const;

export type IconName = keyof typeof iconMap;

interface MinistryIconProps {
  name: string;
  className?: string;
}

export function MinistryIcon({ name, className = 'h-5 w-5' }: MinistryIconProps) {
  const Icon = iconMap[name as IconName] ?? Compass;
  return <Icon className={className} aria-hidden="true" />;
}
