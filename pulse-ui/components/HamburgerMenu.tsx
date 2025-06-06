"use client";

import { useState } from "react";
import SideNav from "./SideNav";
import { AlignJustify, X } from "lucide-react";
import { Button } from "@/components/retroui";

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        size="sm"
        variant="outline"
        className="p-2"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <AlignJustify className="h-4 w-4" />
        )}
      </Button>

      {isOpen && (
        <div
          className="absolute top-0 left-0 right-0 w-full h-screen bg-black opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <div className="absolute top-0 left-0 z-40">
          <SideNav />
        </div>
      )}
    </div>
  );
}
