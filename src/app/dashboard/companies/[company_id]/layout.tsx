"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const companyNavItems = [
  { href: "/edit", label: "Settings" },
  { href: "/integrations", label: "Integrations" },
  { href: "/model-preferences", label: "Model Preferences" },
];

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ company_id: string }>();
  const pathname = usePathname();
  const basePath = `/dashboard/companies/${params.company_id}`;

  return (
    <div className="space-y-6">
      <nav className="flex gap-4 border-b">
        {companyNavItems.map((item) => {
          const href = `${basePath}${item.href}`;
          const isActive = pathname.startsWith(href);

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "border-b-2 px-1 pb-2 text-sm transition-colors",
                isActive
                  ? "border-primary text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
