# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: run-1783772330303-y7navd/pr-1.spec.ts >> PulsarX Landing Page Functionality >> Back to top button should appear on scroll and be clickable
- Location: src/temp_tests/run-1783772330303-y7navd/pr-1.spec.ts:355:7

# Error details

```
Error: expect(locator).toBeHidden() failed

Locator:  getByRole('button', { name: 'Back to top' })
Expected: hidden
Received: visible

Call log:
  - Expect "toBeHidden" with timeout 5000ms
  - waiting for getByRole('button', { name: 'Back to top' })
    11 × locator resolved to <button aria-label="Back to top" class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground hover:bg-primary/90 h-10 w-10 fixed bottom-8 right-8 rounded-full shadow-2xl bg-gradient-to-r from-primary to-accent hover:fro…>…</button>
       - unexpected value "visible"

```

```yaml
- button "Back to top":
  - img
```

# Test source

```ts
  258 | 
  259 |   test('should display contact information and quick info', async () => {
  260 |     // Navigate to Contact section using the desktop navigation link
  261 |     await page.getByRole('navigation').getByRole('link', { name: 'Contact', exact: true }).click();
  262 |     await page.waitForLoadState('networkidle');
  263 | 
  264 |     await expect(page.getByRole('heading', { name: 'Contact Info' })).toBeVisible();
  265 |     const emailLink = page.getByRole('link', { name: 'pulsarx.inc@gmail.com' });
  266 |     await expect(emailLink).toBeVisible();
  267 |     await expect(emailLink).toHaveAttribute('href', 'mailto:pulsarx.inc@gmail.com');
  268 | 
  269 |     const phoneLink = page.getByRole('link', { name: '+92 304 7058585' });
  270 |     await expect(phoneLink).toBeVisible();
  271 |     await expect(phoneLink).toHaveAttribute('href', 'tel:+923047058585');
  272 | 
  273 |     await expect(page.getByText('Street 55 I8/3 Islamabad, Pakistan, WEB 40404')).toBeVisible();
  274 | 
  275 |     await expect(page.getByRole('heading', { name: 'Quick Info' })).toBeVisible();
  276 |     await expect(page.getByText('< 24 hours')).toBeVisible();
  277 |     await expect(page.getByText('PKT (UTC+5)')).toBeVisible();
  278 |     await expect(page.getByText('English, Urdu')).toBeVisible();
  279 |   });
  280 | 
  281 |   test('should display social media links in contact section', async () => {
  282 |     // Navigate to Contact section using the desktop navigation link
  283 |     await page.getByRole('navigation').getByRole('link', { name: 'Contact', exact: true }).click();
  284 |     await page.waitForLoadState('networkidle');
  285 | 
  286 |     await expect(page.getByRole('heading', { name: 'Follow Us' }).first()).toBeVisible(); // First to differentiate from footer
  287 |     const linkedInLink = page.locator('a[aria-label="LinkedIn"]').first();
  288 |     await expect(linkedInLink).toBeVisible();
  289 |     await expect(linkedInLink).toHaveAttribute('href', 'https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/');
  290 | 
  291 |     const twitterLink = page.locator('a[aria-label="Twitter"]').first();
  292 |     await expect(twitterLink).toBeVisible();
  293 |     await expect(twitterLink).toHaveAttribute('href', 'https://x.com/');
  294 | 
  295 |     const gitHubLink = page.locator('a[aria-label="GitHub"]').first();
  296 |     await expect(gitHubLink).toBeVisible();
  297 |     await expect(gitHubLink).toHaveAttribute('href', 'https://github.com/ahmaddii');
  298 | 
  299 |     const emailSocialLink = page.locator('a[aria-label="Email"]').first();
  300 |     await expect(emailSocialLink).toBeVisible();
  301 |     await expect(emailSocialLink).toHaveAttribute('href', 'mailto:contact@pulsarx.com');
  302 |   });
  303 | 
  304 |   test('should display footer content, links, and newsletter subscription', async () => {
  305 |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); // Scroll to bottom
  306 |     await page.waitForLoadState('networkidle');
  307 | 
  308 |     await expect(page.getByRole('link', { name: 'PulsarX' }).last()).toBeVisible(); // Footer logo
  309 |     await expect(page.getByText('Illuminating the digital universe with innovative solutions. We transform visions into reality through cutting-edge technology and creative excellence.')).toBeVisible();
  310 |     await expect(page.getByText('Crafting digital excellence since 2024')).toBeVisible();
  311 | 
  312 |     // Quick Links in footer
  313 |     await expect(page.getByRole('heading', { name: 'Quick Links' })).toBeVisible();
  314 |     await expect(page.locator('footer').getByRole('link', { name: 'Home' })).toBeVisible();
  315 |     await expect(page.locator('footer').getByRole('link', { name: 'About Us' })).toBeVisible();
  316 |     await expect(page.locator('footer').getByRole('link', { name: 'Services' })).toBeVisible();
  317 |     await expect(page.locator('footer').getByRole('link', { name: 'Portfolio' })).toBeVisible();
  318 |     await expect(page.locator('footer').getByRole('link', { name: 'Contact' }).last()).toBeVisible(); // Last contact link in footer
  319 | 
  320 |     // Services links in footer
  321 |     await expect(page.getByRole('heading', { name: 'Services' }).last()).toBeVisible(); // Last Services heading
  322 |     await expect(page.getByRole('link', { name: 'Web Development', exact: true }).last()).toBeVisible();
  323 |     await expect(page.getByRole('link', { name: 'App Development', exact: true }).last()).toBeVisible();
  324 |     await expect(page.getByRole('link', { name: 'UI/UX Design', exact: true }).last()).toBeVisible();
  325 |     await expect(page.getByRole('link', { name: 'Consulting', exact: true }).last()).toBeVisible();
  326 | 
  327 |     // Get In Touch in footer
  328 |     await expect(page.getByRole('heading', { name: 'Get In Touch' }).last()).toBeVisible();
  329 |     await expect(page.getByText('Islamabad, Punjab, PK')).toBeVisible();
  330 |     await expect(page.locator('footer').getByText('+92 304 7058585')).toBeVisible();
  331 |     await expect(page.locator('footer').getByText('pulsarx.inc@gmail.com')).toBeVisible();
  332 | 
  333 |     // Social media links in footer
  334 |     await expect(page.getByText('Follow us on social media')).toBeVisible();
  335 |     await expect(page.locator('footer a[aria-label="LinkedIn"]')).toBeVisible();
  336 |     await expect(page.locator('footer a[aria-label="Twitter"]')).toBeVisible();
  337 |     await expect(page.locator('footer a[aria-label="GitHub"]')).toBeVisible();
  338 |     await expect(page.locator('footer a[aria-label="Email"]')).toBeVisible(); // Email icon in footer
  339 | 
  340 |     // Newsletter Subscription
  341 |     await expect(page.getByRole('heading', { name: 'Stay Updated' })).toBeVisible();
  342 |     await expect(page.getByText('Subscribe to our newsletter for the latest updates and insights')).toBeVisible();
  343 |     const emailInput = page.getByPlaceholder('Enter your email');
  344 |     await expect(emailInput).toBeVisible();
  345 |     await expect(emailInput).toHaveAttribute('type', 'email');
  346 |     await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();
  347 | 
  348 |     // Copyright and policy links
  349 |     await expect(page.getByText('© 2026 PulsarX. All rights reserved to Pakistan 🇵🇰')).toBeVisible();
  350 |     await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
  351 |     await expect(page.getByRole('link', { name: 'Terms of Service' })).toBeVisible();
  352 |     await expect(page.getByRole('link', { name: 'Cookies' })).toBeVisible();
  353 |   });
  354 | 
  355 |   test('Back to top button should appear on scroll and be clickable', async () => {
  356 |     // Check it's initially hidden
  357 |     const backToTopButton = page.getByRole('button', { name: 'Back to top' });
> 358 |     await expect(backToTopButton).toBeHidden();
      |                                   ^ Error: expect(locator).toBeHidden() failed
  359 | 
  360 |     // Scroll down to make it visible
  361 |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  362 |     await page.waitForLoadState('networkidle');
  363 |     await expect(backToTopButton).toBeVisible(); // It will become visible after scrolling
  364 | 
  365 |     // Click the button and verify it scrolls to top (Home section)
  366 |     await backToTopButton.click();
  367 |     await page.waitForLoadState('networkidle');
  368 |     await expect(page.locator('#home')).toBeInViewport();
  369 |   });
  370 | 
  371 |   // Feature mentioned in code changes was not found in rendered page - skipping test for Radix UI Toast,
  372 |   // as its visibility depends on user interaction (e.g., form submission success), and the provided HTML only shows its container.
  373 |   // Requires manual verification or mocking backend response to trigger toast.
  374 |   // `react-day-picker` and `recharts` features are not visibly implemented with interactive components in the provided HTML.
  375 |   // `genkit` and `googleai` are backend/AI integration, no explicit UI changes or features detected.
  376 | });
  377 | 
```