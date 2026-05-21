
import * as React from "react"
import { useTWTheme } from "@/components/tw-theme-provider"
import { Dropdown, DropdownItem } from "@/components/ui/dropdown"
import { Laptop, Moon, Sun } from "lucide-react"

export function ModeToggle() {
  const { theme, resolvedTheme, setTheme } = useTWTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const Icon = !mounted ? Laptop : resolvedTheme === "light" ? Sun : Moon
  const label = !mounted ? "Theme" : theme === "system" ? "System" : theme[0]!.toUpperCase() + theme.slice(1)

  // Mobile: borderless round icon button to match the search /
  //   notification / avatar siblings in the top bar.
  // Desktop (>= sm): pill button with label, keeps the chrome that
  //   reads as a settings control.
  return (
    <Dropdown
      triggerClassName="inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-0 text-foreground/80 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring sm:rounded-md sm:border sm:border-border sm:px-3 w-9 sm:w-auto"
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
