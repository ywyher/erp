"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import OperationDocumentUrl from "@/app/(authenticated)/dashboard/settings/_components/operation-document";

interface Section {
  id: string;
  label: string;
  component: React.ReactNode;
}

interface SettingsSidebarProps {
  userId: string;
  operationDocument: string;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  userId,
  operationDocument,
}) => {
  // Define your settings sections
  const sections: Section[] = useMemo(() => [
    {
      id: "operation-document",
      label: "Operation Document",
      component: (
        <OperationDocumentUrl userId={userId} currentName={operationDocument} />
      ),
    },
    {
      id: "additional-settings",
      label: "Additional Settings",
      component: (
        <OperationDocumentUrl userId={userId} currentName={operationDocument} />
      ),
    },
    // Add more sections as needed
  ], [operationDocument, userId]);

  // Initialize with stored value or default to 0
  const [activeSection, setActiveSection] = useState<number>(() => {
    // Try to get the stored section from localStorage on initial load
    const stored = localStorage.getItem("activeSettingsSection");
    return stored ? parseInt(stored, 10) : 0;
    return 0;
  });

  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const initialLoadRef = useRef(true);

  // Initialize refs array
  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, sections.length);
  }, [sections.length]);

  // On initial load, scroll to the stored active section
  useEffect(() => {
    if (initialLoadRef.current && sectionRefs.current[activeSection]) {
      // Use a small timeout to ensure the DOM is fully loaded
      setTimeout(() => {
        sectionRefs.current[activeSection]?.scrollIntoView({
          behavior: "auto",
        });
        initialLoadRef.current = false;
      }, 100);
    }
  }, [activeSection]);

  // Store active section in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("activeSettingsSection", activeSection.toString());
  }, [activeSection]);

  // Check URL hash on load
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const sectionIndex = sections.findIndex((section) => section.id === hash);
      if (sectionIndex !== -1) {
        setActiveSection(sectionIndex);
      }
    }
  }, [sections]);

  // Scroll to the section when clicking on navigation
  const scrollToSection = (index: number) => {
    setActiveSection(index);
    setIsScrolling(true);

    if (sectionRefs.current[index]) {
      sectionRefs.current[index]?.scrollIntoView({ behavior: "smooth" });

      // Update URL hash without triggering a page jump
      history.pushState(null, "", `#${sections[index].id}`);

      // Reset scrolling state after animation completes
      setTimeout(() => {
        setIsScrolling(false);
      }, 500);
    }
  };

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (isScrolling || initialLoadRef.current) return;

      const sectionElements = sectionRefs.current;
      if (!sectionElements.length) return;

      let foundActive = false;
      // Find the section closest to the top of the viewport
      for (let i = 0; i < sectionElements.length; i++) {
        const element = sectionElements[i];
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          setActiveSection(i);
          foundActive = true;
          break;
        }
      }

      // If we've scrolled past all sections, set the last one as active
      if (!foundActive && sectionElements[sectionElements.length - 1]) {
        const lastRect =
          sectionElements[sectionElements.length - 1]?.getBoundingClientRect();
        if (lastRect && lastRect.top < 0) {
          setActiveSection(sectionElements.length - 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolling, sections]);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-background">
      {/* Left sidebar navigation - wider with improved styling */}
      <div className="sticky top-0 w-64 h-screen pt-8 bg-background border-r border-border">
        <div className="px-4 mb-6">
          <h2 className="text-xl font-semibold text-foreground">Settings</h2>
        </div>

        <div className="relative h-full px-4">
          {/* Vertical line connecting all nav items - more subtle */}
          <div className="absolute left-8 top-2 bottom-12 w-px bg-border/40 -z-10" />

          {/* Navigation items */}
          <nav className="space-y-6 py-2">
            {sections.map((section, index) => (
              <div key={section.id} className="relative">
                <button
                  onClick={() => scrollToSection(index)}
                  className={`group flex items-center relative w-full pl-10 pr-3 py-2 text-sm transition-all duration-200 rounded-md
                    ${
                      activeSection === index
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {/* Animated indicator dot with improved transition */}
                  {index === activeSection ? (
                    <motion.div
                      className="absolute left-6 w-2.5 h-2.5 rounded-full bg-primary -translate-x-1/2"
                      layoutId="activeDot"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  ) : (
                    <div className="absolute left-6 w-2 h-2 rounded-full bg-muted -translate-x-1/2 transition-all duration-200 group-hover:bg-muted-foreground/30" />
                  )}

                  {/* Background highlight for active item */}
                  {index === activeSection && (
                    <motion.div
                      className="absolute inset-0 bg-muted rounded-md -z-10"
                      layoutId="activeBackground"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}

                  {section.label}
                </button>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Right side content - scrollable container */}
      <div className="flex-1 h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-muted/20">
        {sections.map((section, index) => (
          <div
            key={section.id}
            ref={(el) => {
              sectionRefs.current[index] = el;
            }}
            id={section.id}
            className="min-h-screen p-8 scroll-mt-4"
          >
            <h2 className="text-xl font-semibold mb-6 text-foreground">
              {section.label}
            </h2>
            {section.component}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsSidebar;
