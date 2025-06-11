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
            <Mail className="h-5 w-5" />
            Contact Information
          </DialogTitle>
          <DialogDescription>Get in touch via email</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <div className="text-sm font-medium">Email Address</div>
            <div className="bg-muted flex items-center gap-2 rounded-md p-3">
              <span className="font-mono text-sm">contact@florianlup.com</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyClick}
            className="gap-2"
          >
            {isEmailCopied ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Email
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
