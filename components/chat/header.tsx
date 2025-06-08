import { FileText, ShieldAlert, Mail, RotateCcw, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Privacy } from './privacy';
import { Terms } from './terms';
import { Contact } from './contact';

interface HeaderProps {
  hasMessages?: boolean;
  onNewChat?: () => void;
}

export function Header({ hasMessages = false, onNewChat }: HeaderProps) {
  const handleGitHubClick = () => {
    window.open('https://github.com/florian-lup', '_blank', 'noopener,noreferrer');
  };

  const handleReloadClick = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      window.location.reload();
    }
  };

  return (
    <header className="w-full py-4 px-6">
      <div className="flex justify-between items-center">
        {/* Left side - Reload button (only when there are messages) */}
        <div className="flex items-center">
          {hasMessages && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={handleReloadClick}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">New Chat</span>
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
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">GitHub</span>
          </Button>
          <Contact>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Contact</span>
            </Button>
          </Contact>
          <Terms>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Terms</span>
            </Button>
          </Terms>
          <Privacy>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Privacy</span>
            </Button>
          </Privacy>
        </div>
      </div>
    </header>
  );
}
