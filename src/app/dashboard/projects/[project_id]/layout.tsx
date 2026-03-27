"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const projectNavItems = [
  { href: "", label: "Overview" },
  { href: "/tasks", label: "Tasks" },
  { href: "/edit", label: "Settings" },
];

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ project_id: string }>();
  const pathname = usePathname();
  const basePath = `/dashboard/projects/${params.project_id}`;

  return (
    <div className="space-y-6">
      <nav className="flex gap-4 border-b">
        {projectNavItems.map((item) => {
          const href = `${basePath}${item.href}`;
          const isActive =
            item.href === ""
              ? pathname === basePath
              : pathname.startsWith(href);

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
