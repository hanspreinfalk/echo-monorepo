'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@workspace/ui/components/accordion'
import Link from 'next/link'

const faqCategories = [
    {
        title: 'Product overview',
        items: [
            {
                id: 'overview-1',
                question: 'How do you turn conversations into engineering work?',
                answer:
                    'We capture support and user conversations, extract concrete problems and requests, and draft structured work items your team can act on, so nothing important gets lost in chat threads.',
            },
            {
                id: 'overview-2',
                question: 'What happens after a user issue is captured?',
                answer:
                    'Each issue is normalized into a clear description with context from the thread. Your team can triage, assign owners, and move items into your existing workflow without retyping or copying and pasting.',
            },
            {
                id: 'overview-3',
                question: 'How does prioritization decide what to ship first?',
                answer:
                    'Signals from the conversation, including severity, frequency, customer impact, and strategic fit, are combined into a transparent score so engineering sees a ranked backlog aligned with what matters most to users.',
            },
            {
                id: 'overview-4',
                question: 'Who typically uses this day to day?',
                answer:
                    'Support and success teams capture issues at the source; PMs refine scope and priority; engineering gets prepared tickets with full context. Everyone stays aligned without extra meetings.',
            },
        ],
    },
    {
        title: 'Integrations',
        items: [
            {
                id: 'integrations-1',
                question: 'Which chat platforms do you support?',
                answer:
                    'Only the Echo chatbot widget you embed in your app or site. Conversations happen inside that widget; we do not connect to Slack, team chat, help desks, or other third party chat surfaces yet.',
            },
            {
                id: 'integrations-2',
                question: 'Can I push issues into our engineering tracker?',
                answer:
                    'Not yet. Today Echo is where issues are captured, refined, and prioritized. We are building export and deeper integrations so you can plug into your existing tools when they are ready.',
            },
            {
                id: 'integrations-3',
                question: 'Do you work with our existing help desk or CRM?',
                answer:
                    'Not yet. Today everything flows through the embedded widget and Echo\'s dashboard. Help desk and CRM connectors are not available right now.',
            },
        ],
    },
    {
        title: 'Automation & AI',
        items: [
            {
                id: 'automation-1',
                question: 'How does the AI identify engineering tasks from messy conversations?',
                answer:
                    'Models detect actionable problems, feature requests, and bugs from natural language, then propose titles, descriptions, and labels you can edit. Automation speeds you up without removing human judgment.',
            },
            {
                id: 'automation-2',
                question: 'Can I review tasks before they hit the backlog?',
                answer:
                    'Absolutely. Every suggestion can be approved, merged, or rejected. You control what becomes real work and how much automation you want at each stage.',
            },
            {
                id: 'automation-3',
                question: 'How does the prioritization algorithm work?',
                answer:
                    'Ranking combines configurable rules with learned patterns from your product and team, including urgency, user segments, recurring themes, and roadmap alignment, so the queue reflects both data and your strategy.',
            },
            {
                id: 'automation-4',
                question: 'Is conversation data used to train public models?',
                answer:
                    'Your workspace data is processed to deliver the product, with strict isolation and retention controls. We do not use your customer conversations to train third party or shared foundation models unless you explicitly opt in.',
            },
        ],
    },
]

export default function FAQs() {
    return (
        <section
            id="faqs"
            className="border-b border-border bg-background py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-12 md:grid-cols-5 md:gap-16 lg:gap-20">
                    <div className="md:col-span-2">
                        <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">FAQ</p>
                        <h2 className="text-foreground mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">Frequently asked</h2>
                        <p className="text-muted-foreground mt-4 text-balance text-base">
                            From live conversations to a prioritized backlog, so your team ships what matters.
                        </p>
                        <p className="text-muted-foreground mt-6 hidden md:block text-pretty text-sm">
                            Still unsure?{' '}
                            <Link
                                href="#"
                                className="text-foreground font-medium underline underline-offset-4 hover:no-underline">
                                Talk to our team
                            </Link>
                        </p>
                    </div>

                    <div className="flex flex-col gap-10 md:col-span-3">
                        {faqCategories.map((category) => (
                            <div key={category.title}>
                                <h3 className="text-foreground mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{category.title}</h3>
                                <Accordion
                                    type="single"
                                    collapsible
                                    className="w-full">
                                    {category.items.map((item) => (
                                        <AccordionItem
                                            key={item.id}
                                            value={item.id}
                                            className="border-border">
                                            <AccordionTrigger className="text-foreground cursor-pointer py-4 text-left text-sm font-medium hover:no-underline [&>svg]:text-muted-foreground">
                                                {item.question}
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <p className="text-muted-foreground pb-2 text-sm leading-relaxed">{item.answer}</p>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        ))}
                    </div>

                    <p className="text-muted-foreground md:col-span-2 md:hidden text-pretty text-sm">
                        Still unsure?{' '}
                        <Link
                            href="#"
                            className="text-foreground font-medium underline underline-offset-4 hover:no-underline">
                            Talk to our team
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}
