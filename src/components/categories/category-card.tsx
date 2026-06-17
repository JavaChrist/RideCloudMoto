import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { VehicleCategory } from "@/types/database";
import { CATEGORY_META } from "@/lib/data/demo";
import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  category: VehicleCategory;
  count: number;
}

export function CategoryCard({ category, count }: CategoryCardProps) {
  const meta = CATEGORY_META[category];
  return (
    <Link href={`/vehicules/${category}`} className="group block">
      <Card className="card-glow flex items-center gap-5 overflow-hidden p-5">
        <div className="relative flex h-24 w-28 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-transparent ring-glow">
          <Image
            src={meta.illustration}
            alt={meta.label}
            width={120}
            height={96}
            className="object-contain drop-shadow-[0_6px_12px_rgba(250,204,21,0.25)] transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold tracking-tight">{meta.label}</h3>
          <p className="truncate text-sm text-muted-foreground">{meta.description}</p>
          <span className="mt-2 inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {count} véhicule{count > 1 ? "s" : ""}
          </span>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </Card>
    </Link>
  );
}
