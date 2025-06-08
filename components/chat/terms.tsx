'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import type { WithChildren } from '@/types/common';

export function Terms({ children }: WithChildren) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Terms of Service</SheetTitle>
          <SheetDescription>Last updated: June 2, 2025</SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-4 space-y-6 text-sm text-muted-foreground">
          <section>
            <p className="text-base text-foreground leading-relaxed">
              Welcome! These are the simple terms for using my website. I&apos;ve tried to keep them
              straightforward and human-friendly.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-foreground mb-3">Using This Website</h3>
            <p className="mb-3">
              Feel free to use this website for personal, educational, or professional purposes.
              Just please:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Be respectful in your interactions with the AI</li>
              <li>Don&apos;t try to hack or break anything</li>
              <li>Don&apos;t use it for illegal activities</li>
              <li>Don&apos;t spam or abuse the service</li>
            </ul>
          </section>

          <section>
            <h3 className="text-base font-semibold text-foreground mb-3">
              What This Website Provides
            </h3>
            <p>
              I do my best to keep this website running smoothly, but like all technology, sometimes
              things break. I can&apos;t guarantee 100% uptime, and the AI responses are provided
              as-is. Please use common sense and don&apos;t rely on AI responses for critical
              decisions without verification.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-foreground mb-3">Your Content</h3>
            <p>
              Anything you share with the AI (messages, questions) remains yours. No one is claiming
              ownership of your thoughts! Your conversations with the AI are used only to provide
              responses and aren&apos;t stored permanently.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-foreground mb-3">Liability</h3>
            <p>
              This website is shared freely, so please understand that I can&apos;t be held
              responsible for any issues that might arise from using it, including AI responses. Use
              it at your own discretion.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-foreground mb-3">Changes</h3>
            <p>
              If these terms need to be updated, the date above will be changed. For major changes,
              a notice might be added to the website.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-foreground mb-3">Questions?</h3>
            <p>
              If you have any questions about these terms, feel free to reach out via the contact
              button in the header.
            </p>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
