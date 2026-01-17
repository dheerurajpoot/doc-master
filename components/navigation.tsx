"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, MessageSquare, Info, Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

const mainLinks = [
	{ href: "/", label: "Home" },
	{ href: "/about", label: "About" },
	{ href: "/contact", label: "Contact" },
	{ href: "/terms", label: "Terms" },
	{ href: "/disclaimer", label: "Disclaimer" },
];

export function TopNav() {
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<nav className='fixed top-0 left-0 right-0 bg-background/95 backdrop-blur border-b border-border z-40'>
			<div className='md:max-w-7xl mx-auto px-4 py-3 flex items-center justify-between'>
				<Link href='/' className='flex items-center gap-3'>
					<Image
						src='/docmaster.png'
						alt='Doc Master'
						width={132}
						height={132}
					/>
				</Link>

				<div className='hidden md:flex items-center gap-8'>
					<NavLinks />
				</div>

				<button
					type='button'
					onClick={() => setMobileOpen((open) => !open)}
					className='md:hidden inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background'
					aria-label='Toggle navigation menu'
					aria-expanded={mobileOpen}>
					{mobileOpen ? (
						<X className='h-6 w-6' />
					) : (
						<Menu className='h-6 w-6' />
					)}
				</button>
			</div>

			{/* Mobile menu */}
			{mobileOpen && (
				<div className='md:hidden border-t border-border bg-background/98 backdrop-blur'>
					<div className='max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2'>
						{mainLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								onClick={() => setMobileOpen(false)}
								className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
									pathname === link.href
										? "bg-primary text-primary-foreground"
										: "text-foreground hover:bg-muted"
								}`}>
								<span>{link.label}</span>
							</Link>
						))}
					</div>
				</div>
			)}
		</nav>
	);
}

export function BottomNav() {
	const pathname = usePathname();

	const links = [
		{ href: "/", icon: Home, label: "Home", exact: true },
		{ href: "/about", icon: Info, label: "About" },
		{ href: "/contact", icon: MessageSquare, label: "Contact" },
	];

	return (
		<nav className='fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 md:hidden'>
			<div className='flex items-center justify-around'>
				{links.map((link) => {
					const Icon = link.icon;
					const isActive = link.exact
						? pathname === link.href
						: pathname.startsWith(link.href);
					return (
						<Link
							key={link.href}
							href={link.href}
							className={`flex flex-col items-center justify-center py-3 px-4 flex-1 transition-colors ${
								isActive
									? "text-primary border-t-2 border-primary"
									: "text-muted-foreground hover:text-foreground"
							}`}>
							<Icon className='w-6 h-6' />
							<span className='text-xs mt-1'>{link.label}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}

function NavLinks() {
	const pathname = usePathname();

	return (
		<>
			{mainLinks.map((link) => (
				<Link
					key={link.href}
					href={link.href}
					className={`text-sm font-medium transition-colors ${
						pathname === link.href
							? "text-primary"
							: "text-foreground hover:text-primary"
					}`}>
					{link.label}
				</Link>
			))}
		</>
	);
}
