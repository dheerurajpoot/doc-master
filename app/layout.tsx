import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopNav, BottomNav } from "@/components/navigation";
import Footer from "@/components/footer";
import Head from "next/head";
import Script from "next/script";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
	metadataBase: new URL("https://docmaster.deelzo.com/"),
	title: {
		default: "Doc Master - Professional Document Alignment & Printing",
		template: "%s | Doc Master",
	},
	description:
		"Align, crop, and prepare your documents for printing on A4 paper with AI-powered background removal. Free, fast, and professional.",
	keywords: [
		"document alignment",
		"document printing",
		"Combine documents",
		"Doc master",
		"Professional Document Alignment & Printing",
	],
	authors: [{ name: "Doc Master" }],
	creator: "Doc Master",
	publisher: "Doc Master",
	manifest: "/manifest.json",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "/",
		title: "Doc Master - Professional Document Alignment & Printing",
		description:
			"Align, crop, and prepare your documents for printing on A4 paper with AI-powered background removal. Free, fast, and professional.",
		siteName: "Doc Master",
		images: [
			{
				url: "/docmasterbanner.png",
				width: 1200,
				height: 630,
				alt: "Doc Master - Professional Document Alignment & Printing",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Doc Master - Professional Document Alignment & Printing",
		description:
			"Align, crop, and prepare your documents for printing on A4 paper with AI-powered background removal. Free, fast, and professional.",
		images: ["/docmasterbanner.png"],
		creator: "@DocMaster",
		site: "@DocMaster",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	category: "Professional Document Alignment & Printing",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<Head>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1'
				/>
				<meta
					name='google-adsense-account'
					content='ca-pub-XXXXXXXXXXXXXXXXXXXXX'
				/>
				<meta name='theme-color' content='#f8fafc' />
				<meta name='apple-mobile-web-app-capable' content='yes' />
				<meta
					name='apple-mobile-web-app-status-bar-style'
					content='default'
				/>
				{/* Structured Data - Organization */}
				<Script
					type='application/ld+json'
					suppressHydrationWarning
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "Organization",
							name: "Doc Master",
							url: "https://docmaster.deelzo.com/",
							logo: "/logo.png",
							description:
								"Align, crop, and prepare your documents for printing on A4 paper with AI-powered background removal. Free, fast, and professional.",
							contactPoint: {
								"@type": "ContactPoint",
								contactType: "Customer Service",
								email: "evtnorg@gmail.com",
							},
						}),
					}}
				/>
				{/* Structured Data - WebSite */}
				<Script
					type='application/ld+json'
					suppressHydrationWarning
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "WebSite",
							name: "Doc Master",
							url: "https://docmaster.deelzo.com/",
							potentialAction: {
								"@type": "SearchAction",
								target: {
									"@type": "EntryPoint",
									urlTemplate:
										"https://docmaster.deelzo.com/",
								},
								"query-input":
									"required name=search_term_string",
							},
						}),
					}}
				/>
				{/* Structured Data - Marketplace */}
				<Script
					type='application/ld+json'
					suppressHydrationWarning
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "OnlineStore",
							name: "Doc Master",
							description:
								"Align, crop, and prepare your documents for printing on A4 paper with AI-powered background removal. Free, fast, and professional.",
							url: "https://docmaster.deelzo.com/",
							priceRange: "$$",
						}),
					}}
				/>
				{/* Google Analytics Script */}
				<Script
					async
					src='https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXX'
				/>
				<Script
					suppressHydrationWarning
					dangerouslySetInnerHTML={{
						__html: `
							window.dataLayer = window.dataLayer || [];
							function gtag(){dataLayer.push(arguments);}
							gtag('js', new Date());
							gtag('config', 'G-XXXXXXXXXXXXX');
						`,
					}}
				/>
				{/* <script
					async
					src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXX'
					crossOrigin='anonymous'
				/> */}
			</Head>
			<body className={`font-sans antialiased`} suppressHydrationWarning>
				<TopNav />
				{children}
				<BottomNav />
				<Footer />
			</body>
		</html>
	);
}
