'use client';

import type { WithChildren } from '@/types';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';

export function Privacy({ children }: WithChildren) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-2xl"
      >
        <SheetHeader>
          <SheetTitle>Privacy Policy</SheetTitle>
          <SheetDescription>Last updated: June 2, 2025</SheetDescription>
        </SheetHeader>

        <div className="text-muted-foreground space-y-6 px-4 pb-4 text-sm">
          <section>
            <p className="text-foreground text-base leading-relaxed">
              Hi! I want to be completely transparent about how your information
              is handled on my website. Privacy matters, and I respect yours.
            </p>
          </section>

          <section>
            <h3 className="text-foreground mb-3 text-base font-semibold">
              What Information I Collect
            </h3>
            <p className="mb-3">
              <strong>
                I do not collect, store, or process your personal information.
              </strong>
            </p>
            <p>
              When you chat with the AI, your messages are used temporarily for
              the sole purpose of generating a response. Once the AI responds,
              that&apos;s it - nothing is saved or stored anywhere.
            </p>
          </section>

          <section>
            <h3 className="text-foreground mb-3 text-base font-semibold">
              How Your Data Is Handled
            </h3>
            <p>Your conversations with the AI work like this:</p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>You send a message to the AI</li>
              <li>The AI processes it temporarily to generate a response</li>
              <li>You get your answer</li>
              <li>Everything is cleared - no permanent storage</li>
            </ul>
            <p className="mt-3">
              Think of it like having a conversation that disappears as soon as
              it&apos;s over.
            </p>
          </section>

          <section>
            <h3 className="text-foreground mb-3 text-base font-semibold">
              Cookies & Local Storage
            </h3>
            <p>
              <strong>
                This website does not use cookies or local storage.
              </strong>{' '}
              Your session data is temporary and is cleared when you close your
              browser. No tracking, no remembering, no persistent data.
            </p>
          </section>

          <section>
            <h3 className="text-foreground mb-3 text-base font-semibold">
              Third Parties
            </h3>
            <p>
              Since I don&apos;t collect your data in the first place,
              there&apos;s nothing to share with anyone else. No data brokers,
              no analytics companies, no advertising networks.
            </p>
          </section>

          <section>
            <h3 className="text-foreground mb-3 text-base font-semibold">
              Your Privacy Rights
            </h3>
            <p>
              I don&apos;t store your personal information, there&apos;s no data
              to access, correct, or delete. Your privacy is protected by design
              - the best way to keep your data safe is to not collect it in the
              first place!
            </p>
          </section>

          <section>
            <h3 className="text-foreground mb-3 text-base font-semibold">
              Questions?
            </h3>
            <p>
              If you have any questions about privacy, feel free to reach out
              via the contact button in the header.
            </p>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
