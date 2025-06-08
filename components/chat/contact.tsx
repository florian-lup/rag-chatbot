import { Mail, CheckCircle, Copy } from 'lucide-react';
import React from 'react';

import { useCopyToClipboard } from '@/hooks';

import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface ContactProps {
  children: React.ReactNode;
}

export function Contact({ children }: ContactProps) {
  const [isEmailCopied, copy] = useCopyToClipboard();

  const handleCopyEmail = async () => {
    await copy('contact@florianlup.com');
  };

  const handleCopyClick = () => {
    void handleCopyEmail();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact Information
          </DialogTitle>
          <DialogDescription>Get in touch via email</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <span id="email" className="text-sm font-mono">
                contact@florianlup.com
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleCopyClick} className="gap-2">
            {isEmailCopied ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Email
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
