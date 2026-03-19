"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenubarRadioGroup,
  MenubarRadioItem,
} from "@/components/ui/menubar"
import { Button } from "@/components/ui/button"
import { MoonStar, SunIcon } from 'lucide-react'

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

function ScreenFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <p className="max-w-md text-sm text-muted-foreground">
        This application is only available on desktop screens.
      </p>
    </div>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter();
  const [mode, setMode] = React.useState<string>("funding");
  const [theme, setTheme] = React.useState<boolean>(false);

  const modeOptions = {
    fundingValue: "funding",
    lendingValue: "lending",
    fundingText: "Funding Arbitrage",
    lendingText: "Lending/Looping",
  }

  const handleModeChange = (value: string) => {
    setMode(value);
    router.push(value === modeOptions.fundingValue ? "/" + modeOptions.fundingValue : "/" + modeOptions.lendingValue);
  }
  const handleThemeChange = () => {
    setTheme((prev) => !prev);
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", fontSans.variable)}
    >
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider enableSystem forcedTheme={theme ? "dark" : "light"}>
          {/* only on large screen*/}
          <div className="hidden md:block">
            <Menubar className="h-12 px-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="select-none text-xl text-primary">Arbies</div>

                <MenubarMenu>
                  <MenubarTrigger>Mode</MenubarTrigger>
                  <MenubarContent>
                    <MenubarRadioGroup value={mode} onValueChange={handleModeChange}>
                      <MenubarRadioItem value={modeOptions.fundingValue}>{modeOptions.fundingText}</MenubarRadioItem>
                      <MenubarRadioItem value={modeOptions.lendingValue}>{modeOptions.lendingText}</MenubarRadioItem>
                    </MenubarRadioGroup>
                  </MenubarContent>
                </MenubarMenu>
              </div>

              <div className="flex items-center">
                <Button
                  onClick={() => window.open("https://github.com/eraguzy/arbies", "_blank")}
                  className="rounded-full bg-background p-2 hover:bg-muted cursor-pointer"
                >
                  <img src="/github.png" alt="Github" className="h-4 w-4" />
                </Button>

                <Button
                  onClick={handleThemeChange}
                  className="rounded-full bg-background p-2 hover:bg-muted cursor-pointer"
                >
                  {theme ? <SunIcon className="h-4 w-4 text-white" /> : <MoonStar className="h-4 w-4 text-black" />}
                </Button>
              </div>

            </Menubar>

            {children}
          </div>

          {/* fallback if too small */}
          <div className="block md:hidden">
            <ScreenFallback />
          </div>

        </ThemeProvider>
      </body>
    </html>
  );
}
