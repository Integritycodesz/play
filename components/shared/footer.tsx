import { Github, Twitter, Instagram } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    <div className="text-center md:text-left">
                        <h3 className="font-syne text-lg font-bold text-white">PMPL.GG</h3>
                        <p className="mt-2 text-sm text-gray-400">
                            The premium platform for professional PUBG Mobile tournaments.
                        </p>
                    </div>

                    <div className="flex gap-6">
                        <SocialLink icon={<Twitter className="h-5 w-5" />} href="#" />
                        <SocialLink icon={<Instagram className="h-5 w-5" />} href="#" />
                        <SocialLink icon={<Github className="h-5 w-5" />} href="#" />
                    </div>
                </div>
                <div className="mt-8 text-center text-xs text-gray-600">
                    © 2025 PMPL.GG. Not affiliated with Krafton, Inc.
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ icon, href }: { icon: React.ReactNode; href: string }) {
    return (
        <a
            href={href}
            className="text-gray-400 transition-colors hover:text-neon-yellow"
        >
            {icon}
        </a>
    );
}
