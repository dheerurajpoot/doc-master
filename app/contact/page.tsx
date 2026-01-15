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
		<div className='min-h-screen bg-background flex flex-col md:pt-20'>
			<main className='flex-1 pb-20 md:pb-0 px-4 md:px-6 pt-8 md:pt-16'>
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
								content: "support@docmaster.app",
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

					<div className='bg-card border border-border rounded-xl p-8 md:p-10'>
						<h2 className='text-2xl font-semibold text-foreground mb-6'>
							Send us a Message
						</h2>
						{submitted ? (
							<div className='bg-primary/10 border border-primary text-primary p-4 rounded-lg'>
								Thank you for your message! We'll get back to
								you soon.
							</div>
						) : (
							<form onSubmit={handleSubmit} className='space-y-6'>
								<div>
									<label className='block text-sm font-medium text-foreground mb-2'>
										Name
									</label>
									<input
										type='text'
										required
										value={formData.name}
										onChange={(e) =>
											setFormData({
												...formData,
												name: e.target.value,
											})
										}
										className='w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-foreground mb-2'>
										Email
									</label>
									<input
										type='email'
										required
										value={formData.email}
										onChange={(e) =>
											setFormData({
												...formData,
												email: e.target.value,
											})
										}
										className='w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-foreground mb-2'>
										Message
									</label>
									<textarea
										required
										rows={5}
										value={formData.message}
										onChange={(e) =>
											setFormData({
												...formData,
												message: e.target.value,
											})
										}
										className='w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none'
									/>
								</div>
								<Button
									type='submit'
									className='w-full bg-primary hover:bg-primary/90'>
									Send Message
								</Button>
							</form>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
