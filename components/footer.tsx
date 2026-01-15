"use client";
import { ChevronUp, Heart } from "lucide-react";
import Link from "next/link";

export default function Footer() {
	// Scroll to top function
	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	// Legal links
	const legalLinks = [
		{ name: "About", href: "/about" },
		{ name: "Contact", href: "/contact" },
		{ name: "Disclaimer", href: "/disclaimer" },
		{ name: "Terms", href: "/terms" },
	];

	return (
		<footer className='relative mb-16 md:mb-0 '>
			<div className='relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
				{/* Bottom Bar */}
				<div className='py-4'>
					<div className='flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0'>
						{/* Copyright & Love */}
						<div className='flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-center sm:text-left'>
							<p className='text-neutral-500 text-sm'>
								© 2026 Doc Master. All rights reserved.
							</p>
							<div className='flex items-center justify-center sm:justify-start space-x-1 text-neutral-500 text-sm'>
								<span>Made with</span>
								<Heart className='w-3 h-3 text-red-500 animate-pulse' />
								<span>
									by{" "}
									<Link
										href='https://dheeru.org'
										className='text-orange-400 hover:text-orange-500 transition-colors duration-200'>
										Dheeru Rajpoot
									</Link>
								</span>
							</div>
						</div>

						{/* Legal Links */}
						<div className='flex justify-center sm:justify-end space-x-6'>
							{legalLinks.map((link, index) => (
								<a
									key={index}
									href={link.href}
									className='text-neutral-500 hover:text-orange-400 transition-colors duration-200 text-sm'>
									{link.name}
								</a>
							))}
						</div>
					</div>
				</div>

				{/* Back to Top Button - Only show on scroll */}
				<button
					onClick={scrollToTop}
					className='fixed bottom-6 right-6 w-10 h-10 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-orange-500 text-neutral-400 hover:text-orange-400 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 z-20'
					aria-label='Back to top'>
					<ChevronUp className='w-5 h-5' />
				</button>
			</div>
		</footer>
	);
}
