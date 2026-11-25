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

  // The official full-name landscape logo (artwork from crca.org.au, coloured teal and navy
  // to match the official stacked logo).
  return (
    <img
      src={siteConfig.logos.landscapeColour}
      alt={siteConfig.brandName}
      width={633}
      height={128}
      className={`h-10 w-auto select-none sm:h-11 lg:h-12 ${className}`}
    />
  );
}
