import {
  FileText,
  ShieldAlert,
  Mail,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

import { Button } from '../ui/button';

import { Contact } from './contact';
import { Privacy } from './privacy';
import { Terms } from './terms';

interface HeaderProps {
  hasMessages?: boolean;
  onNewChat?: () => void;
}

export function Header({ hasMessages = false, onNewChat }: HeaderProps) {
  const handleGitHubClick = () => {
    window.open(
      'https://github.com/florian-lup',
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handleReloadClick = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      window.location.reload();
    }
  };

  return (
    <header className="w-full px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Reload button (only when there are messages) */}
        <div className="flex items-center">
          {hasMessages && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={handleReloadClick}
            >
              <RotateCcw className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">New Chat</span>
            </Button>
          )}
        </div>

        {/* Right side - Other buttons */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={handleGitHubClick}
          >
            <ExternalLink className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">GitHub</span>
          </Button>
          <Contact>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Contact</span>
            </Button>
          </Contact>
          <Terms>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Terms</span>
            </Button>
          </Terms>
          <Privacy>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ShieldAlert className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Privacy</span>
            </Button>
          </Privacy>
        </div>
      </div>
    </header>
  );
}
