"use client"

import { TopNav, BottomNav } from "@/components/navigation"
import { AlertCircle } from "lucide-react"

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-background flex flex-col md:pt-20">
      <TopNav />

      <main className="flex-1 pb-20 md:pb-0 px-4 md:px-6 pt-8 md:pt-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-foreground">Disclaimer</h1>

          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h2 className="font-semibold text-foreground mb-2">Important Notice</h2>
                <p className="text-muted-foreground">
                  Please read this disclaimer carefully before using Doc Master services.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. No Professional Advice</h2>
              <p>
                Doc Master and its content are provided on an "as-is" basis for general informational purposes only. We
                do not provide professional, legal, medical, or financial advice. Any reliance you place on such
                information is strictly at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. No Warranty</h2>
              <p>
                We make no warranties or representations about the accuracy, completeness, or suitability of the
                information contained on Doc Master. Doc Master shall not be liable for any errors or omissions in this
                information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Doc Master shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, or any loss of profit or revenue, whether incurred directly
                or indirectly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Image Processing</h2>
              <p>
                Doc Master uses AI technology for background removal and image processing. Results may vary based on
                image quality, lighting, and other factors. We recommend reviewing processed images before printing or
                further use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. User Responsibility</h2>
              <p>You are responsible for:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Ensuring you have the right to upload images to Doc Master</li>
                <li>Respecting intellectual property rights</li>
                <li>Not using the service for illegal purposes</li>
                <li>Verifying all outputs before publishing or printing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Third-Party Services</h2>
              <p>
                Doc Master may use third-party AI services for background removal. We are not responsible for the
                actions, content, or policies of third parties. Use of these services is subject to their terms of
                service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Service Availability</h2>
              <p>
                While we strive to provide continuous service, Doc Master does not guarantee uninterrupted or error-free
                operation. We may modify, suspend, or discontinue services with or without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Privacy & Data</h2>
              <p>
                Your uploaded images are processed locally in your browser when possible. We do not store or keep copies
                of your images after processing. Please review our privacy policy for more information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. External Links</h2>
              <p>
                Doc Master may contain links to external websites. We are not responsible for the content, accuracy, or
                practices of linked sites. Access external links at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Changes to Disclaimer</h2>
              <p>
                We may update this disclaimer at any time without notice. Continued use of Doc Master indicates your
                acceptance of any changes.
              </p>
            </section>
          </div>

          <div className="mt-12 p-6 bg-muted rounded-xl border border-border">
            <p className="text-sm text-muted-foreground text-center">
              Last updated: {new Date().toLocaleDateString()}. For questions, please contact us at support@docmaster.app
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
