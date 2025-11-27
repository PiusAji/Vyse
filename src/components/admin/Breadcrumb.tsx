import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav
      className="flex font-sans text-sm text-muted-foreground"
      aria-label="Breadcrumb"
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            href="/admin"
            className="text-muted-foreground hover:text-foreground"
          >
            Admin
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.href} className="inline-flex items-center">
            <ChevronRight className="size-4 text-muted-foreground" />
            {index === items.length - 1 ? (
              <span className="ml-1 text-foreground md:ml-2">{item.label}</span>
            ) : item.href ? (
              <Link
                href={item.href as string}
                className="ml-1 text-muted-foreground hover:text-foreground md:ml-2"
              >
                {item.label}
              </Link>
            ) : (
              <span className="ml-1 text-muted-foreground md:ml-2">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
