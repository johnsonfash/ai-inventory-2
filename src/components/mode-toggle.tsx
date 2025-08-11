"use client"

import * as React from "react"
import { useTWTheme } from "@/src/components/tw-theme-provider"
import { Dropdown, DropdownItem } from "@/src/components/ui/dropdown"
import { Laptop, Moon, Sun } from "lucide-react"

export function ModeToggle() {
  const { theme, resolvedTheme, setTheme } = useTWTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const Icon = !mounted ? Laptop : resolvedTheme === "light" ? Sun : Moon
  const label = !mounted ? "Theme" : theme === "system" ? "System" : theme[0]!.toUpperCase() + theme.slice(1)

  return (
    <Dropdown
      button={
        <>
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </>
      }
    >
      <DropdownItem onSelect={() => setTheme("light")}>
        <Sun className="h-4 w-4" /> Light
      </DropdownItem>
      <DropdownItem onSelect={() => setTheme("dark")}>
        <Moon className="h-4 w-4" /> Dark
      </DropdownItem>
      <DropdownItem onSelect={() => setTheme("system")}>
        <Laptop className="h-4 w-4" /> System
      </DropdownItem>
    </Dropdown>
  )
}
