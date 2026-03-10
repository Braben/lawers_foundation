"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Container, Button } from "@/components/ui";
import Image from "next/image";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
];

const programsDropdown = {
  label: "Programs",
  href: "/programs",
  items: [
    { href: "/programs", label: "All Programs" },
    { href: "/programs#free-legal-aid", label: "Free Legal Aid" },
    { href: "/programs#legal-awareness", label: "Legal Awareness" },
    {
      href: "/programs#rehabilitation-support",
      label: "Rehabilitation Support",
    },
    { href: "/programs#policy-advocacy", label: "Policy Advocacy" },
    { href: "/programs#child-protection", label: "Child Protection" },
    { href: "/programs#women-empowerment", label: "Women Empowerment" },
  ],
};

const storiesDropdown = {
  label: "Stories",
  href: "/stories",
  items: [
    { href: "/stories", label: "All Stories" },
    { href: "/stories?category=impact-stories", label: "Impact Stories" },
    { href: "/stories?category=legal-awareness", label: "Legal Awareness" },
    { href: "/stories?category=news", label: "News & Updates" },
    { href: "/stories?category=research", label: "Research & Reports" },
  ],
};

const moreLinks = [
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
];

const bottomLinks = [
  { href: "/get-involved", label: "Get Involved" },
  { href: "/contact", label: "Contact" },
];

interface DropdownProps {
  dropdown: typeof programsDropdown;
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function Dropdown({
  dropdown,
  isOpen,
  onMouseEnter,
  onMouseLeave,
}: DropdownProps) {
  return (
    <li
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        className="flex items-center gap-1 text-[#4a4a4a] hover:text-[#2C5F2D] font-medium:outline-none focus transition-colors focus-visible:ring-2 focus-visible:ring-[#2C5F2D] rounded px-2 py-1"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`${dropdown.label} menu`}
      >
        {dropdown.label}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <ul
          className="absolute top-full left-0 mt-1 w-56 bg-white shadow-lg rounded-lg py-2 z-50"
          role="menu"
        >
          {dropdown.items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-4 py-2 text-[#4a4a4a] hover:text-[#2C5F2D] hover:bg-[#EDF4F2] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D]"
                role="menuitem"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [programsDropdownOpen, setProgramsDropdownOpen] = useState(false);
  const [storiesDropdownOpen, setStoriesDropdownOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  // Ensure hidden menu is not focusable and restore focus to toggle on close
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    if (isOpen) {
      menu.removeAttribute("inert");
      menu.removeAttribute("aria-hidden");
    } else {
      menu.setAttribute("inert", "");
      menu.setAttribute("aria-hidden", "true");
      // If focus is inside the hidden menu, move it back to the toggle button
      const active = document.activeElement as HTMLElement | null;
      if (active && menu.contains(active)) {
        toggleRef.current?.focus();
      }
    }
  }, [isOpen]);

  const handleMouseEnter = (
    dropdown: "programs" | "stories",
    setter: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setter(true);
  };

  const handleMouseLeave = (
    dropdown: "programs" | "stories",
    setter: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setter(false);
    }, 150);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm" role="banner">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Container>
        <nav
          className="flex items-center justify-between py-4"
          role="navigation"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold text-[#2C5F2D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D] rounded flex items-center gap-2"
          >
            <Image
              src="/images/lawersfoundation.png"
              alt="Lawers Foundation"
              width={160} // Increased base width
              height={160} // Increased base height
              className="w-20 h-20 md:w-32 md:h-32 object-contain" // Forces larger size across all screens
              loading="eager"
            />
            Lawers Foundation
          </Link>

          <button
            ref={toggleRef}
            className="md:hidden p-2 text-[#2C5F2D]"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          <ul className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[#4a4a4a] hover:text-[#2C5F2D] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D] rounded px-2 py-1"
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <Dropdown
              dropdown={programsDropdown}
              isOpen={programsDropdownOpen}
              onMouseEnter={() =>
                handleMouseEnter("programs", setProgramsDropdownOpen)
              }
              onMouseLeave={() =>
                handleMouseLeave("programs", setProgramsDropdownOpen)
              }
            />

            <Dropdown
              dropdown={storiesDropdown}
              isOpen={storiesDropdownOpen}
              onMouseEnter={() =>
                handleMouseEnter("stories", setStoriesDropdownOpen)
              }
              onMouseLeave={() =>
                handleMouseLeave("stories", setStoriesDropdownOpen)
              }
            />

            {moreLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[#4a4a4a] hover:text-[#2C5F2D] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D] rounded px-2 py-1"
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li>
              <Link href="/get-involved">
                <Button size="sm">Donate Now</Button>
              </Link>
            </li>
          </ul>
        </nav>

        <div
          ref={menuRef}
          id="mobile-menu"
          className={`md:hidden ${isOpen ? "block" : "hidden"}`}
          aria-hidden={!isOpen}
        >
          <ul className="flex flex-col py-4 gap-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block py-2 text-[#4a4a4a] hover:text-[#2C5F2D] font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li>
              <button
                className="flex items-center justify-between w-full py-2 text-[#4a4a4a] hover:text-[#2C5F2D] font-medium"
                onClick={() =>
                  setMobileSubmenu(
                    mobileSubmenu === "programs" ? null : "programs",
                  )
                }
                aria-expanded={mobileSubmenu === "programs"}
              >
                <span>{programsDropdown.label}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${mobileSubmenu === "programs" ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {mobileSubmenu === "programs" && (
                <ul className="pl-4 border-l-2 border-[#EDF4F2] ml-2 mt-2 space-y-2">
                  {programsDropdown.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block py-1 text-[#4a4a4a] hover:text-[#2C5F2D] text-sm"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            <li>
              <button
                className="flex items-center justify-between w-full py-2 text-[#4a4a4a] hover:text-[#2C5F2D] font-medium"
                onClick={() =>
                  setMobileSubmenu(
                    mobileSubmenu === "stories" ? null : "stories",
                  )
                }
                aria-expanded={mobileSubmenu === "stories"}
              >
                <span>{storiesDropdown.label}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${mobileSubmenu === "stories" ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {mobileSubmenu === "stories" && (
                <ul className="pl-4 border-l-2 border-[#EDF4F2] ml-2 mt-2 space-y-2">
                  {storiesDropdown.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block py-1 text-[#4a4a4a] hover:text-[#2C5F2D] text-sm"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {moreLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block py-2 text-[#4a4a4a] hover:text-[#2C5F2D] font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {bottomLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block py-2 text-[#4a4a4a] hover:text-[#2C5F2D] font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li className="pt-2">
              <Link href="/get-involved" onClick={() => setIsOpen(false)}>
                <Button className="w-full">Donate Now</Button>
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </header>
  );
}
