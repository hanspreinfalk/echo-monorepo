'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import React from 'react'
import { cn } from '@workspace/ui/lib/utils'
import { landingNavLinks } from './landing-nav-links'

export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2">
                <div
                    className={cn(
                        'mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12',
                        isScrolled && 'bg-background/80 max-w-4xl rounded-xl border shadow-sm backdrop-blur-md lg:px-5',
                    )}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-3.5">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center gap-2">
                                <Image src="/logo.svg" alt="Bryan logo" width={28} height={28} />
                                <span className="text-foreground text-sm font-semibold">Bryan</span>
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-5 duration-200" />
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-5 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {landingNavLinks.map((item, index) => (
                                    <li key={index}>
                                        {item.href.startsWith('#') ? (
                                            <a
                                                href={item.href}
                                                className="text-muted-foreground hover:text-foreground block text-sm transition-colors duration-150">
                                                <span>{item.name}</span>
                                            </a>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-foreground block text-sm transition-colors duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-xl border p-6 shadow-lg md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-sm">
                                    {landingNavLinks.map((item, index) => (
                                        <li key={index}>
                                            {item.href.startsWith('#') ? (
                                                <a
                                                    href={item.href}
                                                    onClick={() => setMenuState(false)}
                                                    className="text-muted-foreground hover:text-foreground block transition-colors duration-150">
                                                    <span>{item.name}</span>
                                                </a>
                                            ) : (
                                                <Link
                                                    href={item.href}
                                                    onClick={() => setMenuState(false)}
                                                    className="text-muted-foreground hover:text-foreground block transition-colors duration-150">
                                                    <span>{item.name}</span>
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-2 sm:flex-row sm:gap-2 sm:space-y-0 md:w-fit">
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className={cn('rounded-lg text-sm font-medium', isScrolled && 'lg:hidden')}>
                                    <Link href="/sign-in">
                                        <span>Log in</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn('rounded-lg text-sm font-medium', isScrolled && 'lg:hidden')}>
                                    <Link href="/sign-up">
                                        <span>Sign up</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn('rounded-lg text-sm font-medium', isScrolled ? 'lg:inline-flex' : 'hidden')}>
                                    <Link href="/sign-in">
                                        <span>Get started</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
