"use client";

import { useState } from "react";
import Link from "next/link";
import { Accordion } from "@base-ui/react/accordion";
import { ArrowRight, ChevronDown, ChevronUp, MoveRight } from "lucide";
import { HoverGroup } from "@/components/ui/hover-group";
import { Icon } from "@/components/ui/icon";
import { reveal } from "@/lib/reveal";

const QUESTIONS = [
	{
		id: "expo-go",
		question: "Does it work in Expo Go?",
		answer:
			"No. The package brings its own Metal and OpenGL ES renderers, and Expo Go only contains the native code it ships with. Use a development build: run npx expo run:ios or npx expo run:android once, and it works like any other component.",
	},
	{
		id: "platforms",
		question: "Which platforms does it support?",
		answer:
			"iOS 16.4 and later, drawn with Metal, and Android devices with OpenGL ES 3.0, which is every current device. It works in Expo projects and in bare React Native apps with Expo Modules installed.",
	},
	{
		id: "cost",
		question: "What does a gradient cost when nothing moves?",
		answer:
			"Nothing per frame. A still gradient is drawn once and then idles, with no frames rendered until a prop changes. Animated ones run on the native frame clock, off the JavaScript thread.",
	},
	{
		id: "layers",
		question: "Can I stack several gradients?",
		answer:
			"Yes. Put gradients inside a GradientStack and they are composited in a single pass, with eighteen blend modes and per-layer opacity, so three layers cost about as much as one.",
	},
	{
		id: "animate",
		question: "Can I animate from one palette to another?",
		answer:
			"Change the props and pass a transition: a spring or a timing curve carries every color and value across on the native side. For sequences, keyframes play a list of states in order, once or on a loop.",
	},
	{
		id: "license",
		question: "Is it free to use?",
		answer: "Yes. It's MIT licensed, for personal and commercial apps alike.",
	},
];

/** The short answers, in quiet rows that open smoothly in place. */
export function Faq() {
	const [open, setOpen] = useState<string[]>([]);

	return (
		<section className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1fr_1.55fr] lg:gap-16">
			<div className="lg:sticky lg:top-24 lg:self-start">
				<h2 {...reveal(0)} className="text-[32px] leading-[1.1] font-semibold tracking-[-0.03em] text-foreground sm:text-[36px]">Questions</h2>
				<p {...reveal(1)} className="mt-3 max-w-xs text-[15px] leading-relaxed text-pretty text-muted-foreground">
					The short ones are here. For anything else, the docs go deeper.
				</p>
				<Link
					{...reveal(2)}
					href="/docs"
					className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-foreground transition-opacity duration-200 hover:opacity-70"
				>
					Read the docs
					<Icon icon={ArrowRight} hover={MoveRight} className="size-3.5" />
				</Link>
			</div>

			{/* One pill glides between the questions instead of each one dimming on hover. */}
			<HoverGroup item="button" pill="rounded-xl bg-surface">
				<Accordion.Root value={open} onValueChange={(value) => setOpen(value as string[])} multiple className="flex flex-col">
					{QUESTIONS.map((item, index) => {
						const expanded = open.includes(item.id);
						return (
							<Accordion.Item
								key={item.id}
								value={item.id}
								{...reveal(index + 1)}
								// A soft rule between rows, the way the eye expects a list.
								className="border-b border-border"
							>
								<Accordion.Header>
									<Accordion.Trigger className="group/q -mx-3 my-1 flex w-[calc(100%+1.5rem)] items-center justify-between gap-6 rounded-xl px-3 py-3 text-left text-[15px] text-foreground outline-offset-2 focus-visible:outline-2 focus-visible:outline-solid">
										<span>{item.question}</span>
										<Icon
											icon={expanded ? ChevronUp : ChevronDown}
											className="size-4 shrink-0 text-muted-foreground transition-colors duration-200 group-hover/q:text-foreground"
										/>
									</Accordion.Trigger>
								</Accordion.Header>
								<Accordion.Panel className="h-(--accordion-panel-height) overflow-hidden transition-[height] duration-300 ease-out-quart data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none">
									<p className="max-w-[58ch] pb-5 text-[14.5px] leading-relaxed text-pretty text-muted-foreground transition-[opacity,filter,translate] duration-300 ease-out-quart in-data-ending-style:-translate-y-1 in-data-ending-style:opacity-0 in-data-ending-style:blur-[2px] in-data-starting-style:-translate-y-1 in-data-starting-style:opacity-0 in-data-starting-style:blur-[2px]">
										{item.answer}
									</p>
								</Accordion.Panel>
							</Accordion.Item>
						);
					})}
				</Accordion.Root>
			</HoverGroup>
		</section>
	);
}
