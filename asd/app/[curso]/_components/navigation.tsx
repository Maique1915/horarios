"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navigation({ curso }: { curso: string }) {
  const pathname = usePathname();
  const navItems = [
    {
      href: `/${curso}`,
      label: "Gerar a Sua",
    },
    {
      href: `/${curso}/grades`,
      label: "Grades",
    },
    {
      href: `/${curso}/edit`,
      label: "Editar Grade",
    },
  ];

  return (
    <nav className="flex items-center space-x-2 lg:space-x-4">
      {navItems.map((item) => {
        const isActive =
          (item.href.length > `/${curso}`.length && pathname.startsWith(item.href)) ||
          pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "text-sm font-medium transition-colors hover:text-primary",
              isActive
                ? "text-primary bg-primary/10"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
