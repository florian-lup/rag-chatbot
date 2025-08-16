"use client";

import { useEffect, useState } from "react";
import { Mail, FileText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ChangelogSection } from "@/types/types";

export function AppSidebar() {
  const [changelog, setChangelog] = useState<ChangelogSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChangelog() {
      try {
        const response = await fetch("/api/changelog");
        if (!response.ok) {
          throw new Error("Failed to fetch changelog");
        }
        const data = await response.json();
        setChangelog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchChangelog();
  }, []);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Anara Changelog
            </h1>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto overflow-x-hidden">
        <div className="px-4 py-4 space-y-6">
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-4 w-16" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          )}

          {error && (
            <div className="text-xs text-destructive p-2 rounded bg-destructive/10">
              Error loading changelog: {error}
            </div>
          )}

          {!loading &&
            !error &&
            changelog.map((section, index) => (
              <div key={section.date}>
                <div className="text-sm font-semibold text-sidebar-foreground mb-2">
                  {section.date}
                </div>
                <h3 className="text-base font-bold text-sidebar-foreground mb-3">
                  {section.title}
                </h3>
                <div className="text-xs text-sidebar-foreground/80 space-y-3">
                  {section.content.map((paragraph, pIndex) => (
                    <p key={pIndex}>{paragraph}</p>
                  ))}

                  {section.improvements.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs font-semibold text-sidebar-foreground mb-2">
                        Improvements
                      </div>
                      <ul className="space-y-1 text-xs text-sidebar-foreground/70">
                        {section.improvements.map((improvement, iIndex) => (
                          <li key={iIndex}>• {improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.fixes.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs font-semibold text-sidebar-foreground mb-2">
                        Bug Fixes
                      </div>
                      <ul className="space-y-1 text-xs text-sidebar-foreground/70">
                        {section.fixes.map((fix, fIndex) => (
                          <li key={fIndex}>• {fix}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {index < changelog.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
        </div>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="mailto:support@anara.so" className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Contact support</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
