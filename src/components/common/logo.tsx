import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  showWordmark?: boolean;
  /** Masque le texte sur petit écran (iPhone) pour éviter le débordement */
  compactOnMobile?: boolean;
  size?: number;
  className?: string;
  /** Source d'image personnalisée (ex. logo aux couleurs du concessionnaire). */
  src?: string | null;
}

export function Logo({
  href = "/categories",
  showWordmark = true,
  compactOnMobile = false,
  size = 36,
  className,
  src,
}: LogoProps) {
  const content = (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5 sm:gap-2", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="RideCloudMoto"
          width={size}
          height={size}
          className="shrink-0 rounded-md object-contain"
          style={{ width: size, height: size }}
        />
      ) : (
        <Image
          src="/logo192.png"
          alt="RideCloudMoto"
          width={size}
          height={size}
          priority
          className="shrink-0 rounded-md"
        />
      )}
      {showWordmark ? (
        <span
          className={cn(
            "truncate text-base font-extrabold tracking-tight sm:text-lg",
            compactOnMobile && "hidden min-[420px]:inline",
          )}
        >
          RideCloud<span className="text-primary">Moto</span>
        </span>
      ) : null}
    </span>
  );

  if (href) {
    return (
      <Link href={href} aria-label="RideCloudMoto — accueil">
        {content}
      </Link>
    );
  }
  return content;
}
