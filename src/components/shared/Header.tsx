"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Plus, 
  Settings, 
  Moon, 
  Sun,
  Menu
} from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    // In a real app, you'd implement actual theme switching
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">Website Analyzer Pro</span>
          </Link>
          <Badge variant="secondary" className="hidden sm:flex">
            College Project
          </Badge>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" className="hidden sm:flex">
            <Plus className="w-4 h-4 mr-2" />
            New Analysis
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

