"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

export default function Contact() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		message: "",
	});
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitted(true);
		setTimeout(() => setSubmitted(false), 3000);
	};

	return (
		<div className='min-h-[calc(100vh-64px)] bg-background flex flex-col pt-12'>
			<main className='flex-1 pb-10 px-4 md:px-6 pt-8 md:pt-16'>
				<div className='max-w-3xl mx-auto'>
					<h1 className='text-4xl md:text-5xl font-bold mb-4 text-foreground'>
						Contact Us
					</h1>
					<p className='text-lg text-muted-foreground mb-12'>
						Have questions or feedback? We'd love to hear from you.
					</p>

					<div className='grid md:grid-cols-3 gap-6 md:gap-8 mb-12'>
						{[
							{
								icon: Mail,
								title: "Email",
								content: "contact@dheeru.org",
							},
							{
								icon: Phone,
								title: "Support",
								content: "Available 24/7",
							},
							{
								icon: MapPin,
								title: "Online",
								content: "Global Service",
							},
						].map((item, idx) => {
							const Icon = item.icon;
							return (
								<div
									key={idx}
									className='bg-card border border-border rounded-xl p-6 text-center'>
									<div className='flex justify-center mb-4'>
										<div className='bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center'>
											<Icon className='w-6 h-6 text-primary' />
										</div>
									</div>
									<h3 className='font-semibold text-foreground mb-2'>
										{item.title}
									</h3>
									<p className='text-muted-foreground'>
										{item.content}
									</p>
								</div>
							);
						})}
					</div>
				</div>
			</main>
		</div>
	);
}
