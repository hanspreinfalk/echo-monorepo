import Link from 'next/link'
import Image from 'next/image'
import { Linkedin } from 'lucide-react'
import { landingNavLinks } from './landing-nav-links'

function XIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden
            className={className}
            fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    )
}

export function Footer() {
    return (
        <footer className="bg-background border-t border-border">
            <div className="mx-auto max-w-6xl px-6 py-12 lg:px-12">
                <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
                    <Link href="/" className="flex items-center gap-2" aria-label="Bryan home">
                        <Image src="/logo.svg" alt="" width={28} height={28} />
                        <span className="text-foreground text-sm font-semibold">Bryan</span>
                    </Link>
                    <div className="flex items-center gap-4 sm:justify-end">
                        <a
                            href="https://x.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Bryan on X">
                            <XIcon className="size-4" />
                        </a>
                        <a
                            href="https://www.linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Bryan on LinkedIn">
                            <Linkedin className="size-4" strokeWidth={1.75} />
                        </a>
                    </div>
                </div>

                <nav
                    className="text-muted-foreground mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm"
                    aria-label="Footer">
                    {landingNavLinks.map((item) =>
                        item.href.startsWith('#') ? (
                            <a
                                key={item.href + item.name}
                                href={item.href}
                                className="hover:text-foreground transition-colors text-sm">
                                {item.name}
                            </a>
                        ) : (
                            <Link
                                key={item.href + item.name}
                                href={item.href}
                                className="hover:text-foreground transition-colors text-sm">
                                {item.name}
                            </Link>
                        ),
                    )}
                </nav>

                <div className="border-border mt-8 border-t pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-muted-foreground text-xs">© 2026 Bryan. All rights reserved.</p>
                    <div className="border-border bg-muted text-muted-foreground inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs">
                        <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                        <span>All Systems Normal</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
