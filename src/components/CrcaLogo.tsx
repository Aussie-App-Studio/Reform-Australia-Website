import { siteConfig } from '../data/siteConfig';

interface CrcaLogoProps {
  variant?: 'dark' | 'light' | 'stacked';
  className?: string;
}

export function CrcaLogo({ variant = 'dark', className = '' }: CrcaLogoProps) {
  if (variant === 'light') {
    return (
      <img
        src={siteConfig.logos.landscapeWhite}
        alt={siteConfig.brandName}
        className={`h-10 sm:h-11 w-auto object-contain select-none ${className}`}
      />
    );
  }

  if (variant === 'stacked') {
    return (
      <img
        src={siteConfig.logos.stackedColor}
        alt={siteConfig.brandName}
        className={`h-24 w-auto object-contain mix-blend-multiply select-none ${className}`}
      />
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      <img
        src={siteConfig.logos.iconTeal}
        alt=""
        aria-hidden="true"
        className="h-9 sm:h-10 w-auto shrink-0 object-contain mix-blend-multiply"
      />
      <span className="flex flex-col leading-none">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.12em] sm:tracking-[0.14em] uppercase text-navy-900">
          Christian Reformed
        </span>
        <span className="mt-0.5 text-[11px] sm:text-[13px] font-semibold tracking-[0.06em] sm:tracking-[0.08em] uppercase text-navy-900">
          Churches of Australia
        </span>
      </span>
    </span>
  );
}
