"use client";

import { navConfig } from "@/config/navigation";
import { Badge, Text } from "@/components/retroui";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideNav() {
  const pathname = usePathname();

  return (
    <div
      className={`fixed right-auto border-r-2 h-full overflow-y-scroll transition-transform transform md:translate-x-0 w-60 bg-background flex flex-col justify-center md:justify-start py-14 md:py-8`}
    >
      <nav className="flex flex-col items-start px-6 lg:pl-0 pb-26 space-y-4">
        {navConfig.sideNavItems.map((item) => (
          <div key={item.title} className="w-full">
            <Text as="h6">{item.title}</Text>
            <div className="flex flex-col w-full">
              {item.children.map((child) => (
                <Link
                  key={child.title}
                  href={child.href}
                  className={`px-2 py-1 w-full border border-transparent ${
                    pathname === child.href && "bg-primary text-black"
                  }`}
                >
                  {child.title}
                  {child.tag && (
                    <Badge size="sm" className="ml-2">
                      {child.tag}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
