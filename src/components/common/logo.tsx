import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  showWordmark?: boolean;
  size?: number;
  className?: string;
}

export function Logo({ href = "/categories", showWordmark = true, size = 36, className }: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/logo192.png"
        alt="RideCloudMoto"
        width={size}
        height={size}
        priority
        className="rounded-md"
      />
      {showWordmark ? (
        <span className="text-lg font-extrabold tracking-tight">
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
