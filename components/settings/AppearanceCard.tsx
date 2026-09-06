"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Palette, Sun, Moon } from "lucide-react"

const THEMES = [
  { id: "light", name: "Light", icon: Sun },
  { id: "dark", name: "Dark", icon: Moon },
]

export function AppearanceCard() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect -- standard client-mount guard to avoid SSR/theme hydration mismatch
  useEffect(() => setMounted(true), [])

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="size-5 text-violet-500" />
          Appearance
        </CardTitle>
        <CardDescription>Choose your preferred theme (saved on this device only)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all",
                mounted && theme === t.id
                  ? "border-emerald-500 bg-emerald-500/5"
                  : "border-border hover:border-muted-foreground/50"
              )}
            >
              <t.icon className="size-6" />
              <span className="text-sm font-medium">{t.name}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
