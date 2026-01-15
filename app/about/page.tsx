"use client"

import { TopNav, BottomNav } from "@/components/navigation"
import { CheckCircle } from "lucide-react"

export default function About() {
  return (
    <div className="min-h-screen bg-background flex flex-col md:pt-20">
      <TopNav />

      <main className="flex-1 pb-20 md:pb-0 px-4 md:px-6 pt-8 md:pt-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-foreground">About Doc Master</h1>

          <div className="space-y-8 text-muted-foreground">
            <p className="text-lg leading-relaxed">
              Doc Master is a professional document alignment and printing tool designed to help you prepare your
              documents with precision and ease. Whether you're scanning dual-sided documents or organizing multiple
              pages, Doc Master provides the tools you need.
            </p>

            <div className="bg-card border border-border rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6">Why Choose Doc Master?</h2>
              <ul className="space-y-4">
                {[
                  "Free AI-powered background removal",
                  "Pixel-perfect alignment controls",
                  "Support for front and back documents",
                  "One-click printing to PDF or physical printer",
                  "Mobile-first responsive design",
                  "No account or signup required",
                  "Fast and secure processing",
                  "Privacy-focused - your images never leave your device",
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Our Mission</h2>
              <p className="leading-relaxed">
                We believe everyone should have access to professional document management tools without barriers. Doc
                Master is built to be fast, intuitive, and accessible to everyone.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Technology</h2>
              <p className="leading-relaxed">
                Doc Master uses modern web technologies and free AI APIs to provide powerful features without the cost.
                Our platform is built on Next.js and optimized for performance.
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
