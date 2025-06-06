import SideNav from "@/components/SideNav";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Getting Started | RetroUI",
};

export default function ComponentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative max-w-6xl mx-auto">
      <div className="hidden lg:block">
        <SideNav />
      </div>
      <div className="lg:ml-72 mt-16 md:mt-10 px-4 lg:px-0">{children}</div>
    </div>
  );
}
