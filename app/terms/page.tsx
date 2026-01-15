"use client";

export default function Terms() {
	return (
		<div className='min-h-screen bg-background flex flex-col md:pt-20'>
			<main className='flex-1 pb-20 md:pb-0 px-4 md:px-6 pt-8 md:pt-16'>
				<div className='max-w-3xl mx-auto'>
					<h1 className='text-4xl md:text-5xl font-bold mb-8 text-foreground'>
						Terms of Service
					</h1>

					<div className='prose prose-invert max-w-none space-y-6 text-muted-foreground'>
						<section>
							<h2 className='text-2xl font-semibold text-foreground mb-4'>
								1. Acceptance of Terms
							</h2>
							<p>
								By accessing and using Doc Master, you accept
								and agree to be bound by the terms and provision
								of this agreement. If you do not agree to abide
								by the above, please do not use this service.
							</p>
						</section>

						<section>
							<h2 className='text-2xl font-semibold text-foreground mb-4'>
								2. Use License
							</h2>
							<p>
								Permission is granted to temporarily download
								one copy of the materials (information or
								software) on Doc Master for personal,
								non-commercial transitory viewing only. This is
								the grant of a license, not a transfer of title,
								and under this license you may not:
							</p>
							<ul className='list-disc pl-6 space-y-2'>
								<li>Modifying or copying the materials</li>
								<li>
									Using the materials for any commercial
									purpose or for any public display
								</li>
								<li>
									Attempting to decompile or reverse engineer
									any software contained on Doc Master
								</li>
								<li>
									Removing any copyright or other proprietary
									notations from the materials
								</li>
							</ul>
						</section>

						<section>
							<h2 className='text-2xl font-semibold text-foreground mb-4'>
								3. Disclaimer
							</h2>
							<p>
								The materials on Doc Master are provided on an
								'as is' basis. Doc Master makes no warranties,
								expressed or implied, and hereby disclaims and
								negates all other warranties including, without
								limitation, implied warranties or conditions of
								merchantability, fitness for a particular
								purpose, or non-infringement of intellectual
								property or other violation of rights.
							</p>
						</section>

						<section>
							<h2 className='text-2xl font-semibold text-foreground mb-4'>
								4. Limitations
							</h2>
							<p>
								In no event shall Doc Master or its suppliers be
								liable for any damages (including, without
								limitation, damages for loss of data or profit,
								or due to business interruption) arising out of
								the use or inability to use the materials on Doc
								Master, even if Doc Master or an authorized
								representative has been notified orally or in
								writing of the possibility of such damage.
							</p>
						</section>

						<section>
							<h2 className='text-2xl font-semibold text-foreground mb-4'>
								5. Accuracy of Materials
							</h2>
							<p>
								The materials appearing on Doc Master could
								include technical, typographical, or
								photographic errors. Doc Master does not warrant
								that any of the materials on its Internet web
								site are accurate, complete, or current. Doc
								Master may make changes to the materials
								contained on its web site at any time without
								notice.
							</p>
						</section>

						<section>
							<h2 className='text-2xl font-semibold text-foreground mb-4'>
								6. Links
							</h2>
							<p>
								Doc Master has not reviewed all of the sites
								linked to its Internet web site and is not
								responsible for the contents of any such linked
								site. The inclusion of any link does not imply
								endorsement by Doc Master of the site. Use of
								any such linked web site is at the user's own
								risk.
							</p>
						</section>

						<section>
							<h2 className='text-2xl font-semibold text-foreground mb-4'>
								7. Modifications
							</h2>
							<p>
								Doc Master may revise these terms of service for
								its web site at any time without notice. By
								using this web site, you are agreeing to be
								bound by the then current version of these terms
								of service.
							</p>
						</section>

						<section>
							<h2 className='text-2xl font-semibold text-foreground mb-4'>
								8. Governing Law
							</h2>
							<p>
								These terms and conditions are governed by and
								construed in accordance with the laws of your
								jurisdiction, and you irrevocably submit to the
								exclusive jurisdiction of the courts in that
								location.
							</p>
						</section>
					</div>
				</div>
			</main>
		</div>
	);
}
