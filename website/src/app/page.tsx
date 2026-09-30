import { Closing } from "@/components/home/closing";
import { CompositionShowcase } from "@/components/home/composition-showcase";
import { Faq } from "@/components/home/faq";
import { FeaturedGradients } from "@/components/home/featured-gradients";
import { Hero } from "@/components/home/hero";
import { HomeHeader } from "@/components/home/home-header";
import { BottomBlur } from "@/components/layout/page-blur";
import { SiteFooter } from "@/components/layout/site-footer";

export default function Home() {
	return (
		<>
			<HomeHeader />
			<main>
				<Hero />
				<FeaturedGradients />
				<CompositionShowcase />
				<Faq />
				<Closing />
			</main>
			<SiteFooter />
			<BottomBlur />
		</>
	);
}
