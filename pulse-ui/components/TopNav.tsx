"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { GithubIcon, MoonIcon, SunIcon } from "lucide-react";
import { Button, Text } from "@/components/retroui";

export default function TopNav() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Apply the saved theme preference on page load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    const htmlElement = document.documentElement;
    if (htmlElement.classList.contains("dark")) {
      htmlElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      htmlElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 w-full border-b-2 bg-background">
        <div className="container max-w-6xl px-4 lg:px-0 mx-auto">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div className="shrink-0">
              <a
                href="/"
                className="text-black font-head text-2xl flex items-end"
              >
                <Image
                  src="/images/heart-rate-monitor.png"
                  alt="pulse logo"
                  className="mr-2"
                  height={30}
                  width={30}
                />
                <div className="text-foreground">Pulse</div>
              </a>
            </div>

            
            <div className="flex items-center space-x-4 lg:hidden">
              <Link
                href="https://github.com/RVKarmani/pulse"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubIcon />
              </Link>
            </div>

            <div className="hidden lg:flex items-center space-x-3">
              <Link
                href="https://github.com/RVKarmani/pulse"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="sm">
                  <GithubIcon size="14" className="mr-2" />
                  Star on GitHub
                </Button>
              </Link>
              <Button variant="secondary" size="icon" onClick={toggleDarkMode}>
                {isDarkMode ? <SunIcon size="14" /> : <MoonIcon size="14" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
