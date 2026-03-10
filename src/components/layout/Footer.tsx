import Link from "next/link";
import { Container } from "@/components/ui";

const footerLinks = {
  "Quick Links": [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/get-involved", label: "Get Involved" },
    { href: "/contact", label: "Contact" },
  ],
  Programs: [
    { href: "/programs", label: "All Programs" },
    { href: "/programs#free-legal-aid", label: "Free Legal Aid" },
    { href: "/programs#legal-awareness", label: "Legal Awareness" },
    {
      href: "/programs#rehabilitation-support",
      label: "Rehabilitation Support",
    },
    { href: "/programs#policy-advocacy", label: "Policy Advocacy" },
  ],
  Resources: [
    { href: "/stories", label: "Stories & Blog" },
    { href: "/events", label: "Events" },
    { href: "/gallery", label: "Gallery" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#2C5F2D] text-white py-12" role="contentinfo">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Lawers Foundation</h2>
            <p className="text-[#EDF4F2] text-sm mb-4">
              Empowering underprivileged women and children through legal
              awareness, aid, and support for a just society.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-lg font-semibold mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[#EDF4F2] hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <address className="not-italic text-[#EDF4F2] text-sm space-y-2">
              <p>123 Legal Avenue</p>
              <p>New Delhi, India</p>
              <p>Phone: +91 98765 43210</p>
              <p>Email: info@lawersfoundation.org</p>
            </address>
          </div>
        </div>

        <div className="border-t border-[#97BC62] mt-8 pt-8 text-center text-sm text-[#EDF4F2]">
          <p>
            &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> Lawers Foundation. All rights
            reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
