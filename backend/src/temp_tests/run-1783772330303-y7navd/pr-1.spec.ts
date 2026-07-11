import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:5296';

test.describe('PulsarX Landing Page Functionality', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should load the page successfully and display main hero content', async () => {
    await expect(page).toHaveTitle(/PulsarX | Where Innovation Meets Excellence/);
    await expect(page.getByRole('heading', { name: 'Transforming Ideas into Digital Reality' })).toBeVisible();
    await expect(page.getByText('We build scalable, high-performance software solutions tailored to your business needs.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Get Started' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Contact Us' }).first()).toBeVisible();
  });

  test('should display all navigation links on desktop', async () => {
    // Assuming desktop view, so mobile menu button is hidden
    await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();

    // Use getByRole('navigation') to scope the links to the main navigation area
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Home' }).first()).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('link', { name: 'About', exact: true })).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Services', exact: true })).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Projects', exact: true })).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Testimonials', exact: true })).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Contact', exact: true })).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Get Started', exact: true }).first()).toBeVisible();
  });

  test('should open and close mobile navigation menu', async () => {
    await page.setViewportSize({ width: 375, height: 667 }); // Simulate mobile viewport
    await page.waitForLoadState('networkidle');

    const menuButton = page.getByRole('button', { name: 'Menu' });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    // The mobile menu might be considered a dialog or have a different role.
    // For now, keeping nth(1) as it was used to target mobile links, but aware it can be fragile.
    await expect(page.getByRole('link', { name: 'Home' }).nth(1)).toBeVisible(); // Nth(1) to target the mobile menu link
    await expect(page.getByRole('link', { name: 'About' }).nth(1)).toBeVisible();
    // Test closing the menu by clicking a link
    await page.getByRole('link', { name: 'About' }).nth(1).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('link', { name: 'About' }).nth(1)).toBeHidden(); // Verify mobile menu is hidden
  });

  test('should navigate to sections via desktop navigation links', async () => {
    // Use getByRole('navigation') to scope the clicks to the main navigation area
    await expect(page.getByRole('navigation').getByRole('link', { name: 'About', exact: true })).toBeVisible();
    await page.getByRole('navigation').getByRole('link', { name: 'About', exact: true }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#about')).toBeInViewport(); // Verify scroll to section
    await expect(page.getByRole('heading', { name: 'Discover PulsarX' })).toBeVisible();

    await page.getByRole('navigation').getByRole('link', { name: 'Services', exact: true }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#services')).toBeInViewport();
    await expect(page.getByRole('heading', { name: 'Our Services' })).toBeVisible();

    await page.getByRole('navigation').getByRole('link', { name: 'Projects', exact: true }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#projects')).toBeInViewport();
    await expect(page.getByRole('heading', { name: 'Featured Masterpieces' })).toBeVisible();

    await page.getByRole('navigation').getByRole('link', { name: 'Testimonials', exact: true }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#testimonials')).toBeInViewport();
    await expect(page.getByRole('heading', { name: 'Trusted by Visionaries' })).toBeVisible();

    await page.getByRole('navigation').getByRole('link', { name: 'Contact', exact: true }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#contact')).toBeInViewport();
    await expect(page.getByRole('heading', { name: 'Get In Touch' })).toBeVisible();
  });

  test('should display key statistics in hero section', async () => {
    await expect(page.getByText('100+', { exact: true })).toBeVisible();
    await expect(page.getByText('Projects Delivered')).toBeVisible();
    await expect(page.getByText('50+', { exact: true })).toBeVisible();
    await expect(page.getByText('Global Clients')).toBeVisible();
    await expect(page.getByText('99.9%', { exact: true })).toBeVisible();
    await expect(page.getByText('Uptime Guarantee')).toBeVisible();
    await expect(page.getByText('2x', { exact: true })).toBeVisible();
    await expect(page.getByText('ROI Average')).toBeVisible();
  });

  test('should display "Our Story", "Our Mission", and "Our Vision" in About section', async () => {
    // Navigate to About section using the desktop navigation link
    await page.getByRole('navigation').getByRole('link', { name: 'About', exact: true }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Our Story' })).toBeVisible();
    await expect(page.getByText(/Founded with a passion for innovation/)).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Our Mission' })).toBeVisible();
    await expect(page.getByText(/To empower businesses with cutting-edge digital solutions/)).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Our Vision' })).toBeVisible();
    await expect(page.getByText(/To be a leading digital partner, recognized for our creativity/)).toBeVisible();

    // Verify "Learn More About Us" button links to LinkedIn
    const learnMoreButton = page.getByRole('link', { name: 'Learn More About Us' });
    await expect(learnMoreButton).toBeVisible();
    await expect(learnMoreButton).toHaveAttribute('href', 'https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/');
  });

  test('should display services cards with titles and descriptions', async () => {
    // Navigate to Services section using the desktop navigation link
    await page.getByRole('navigation').getByRole('link', { name: 'Services', exact: true }).click();
    await page.waitForLoadState('networkidle');

    // Web Development card
    await expect(page.getByRole('heading', { name: 'Web Development' })).toBeVisible();
    await expect(page.getByText('Crafting responsive, high-performance websites tailored to your business needs')).toBeVisible();
    await expect(page.getByText('Responsive Design')).toBeVisible();
    await expect(page.getByText('Fast Performance')).toBeVisible();
    await expect(page.getByText('SEO Optimized')).toBeVisible();

    // App Development card
    await expect(page.getByRole('heading', { name: 'App Development' })).toBeVisible();
    await expect(page.getByText('Building intuitive and scalable mobile applications for iOS and Android platforms')).toBeVisible();
    await expect(page.getByText('iOS & Android')).toBeVisible();
    await expect(page.getByText('Cross-Platform')).toBeVisible();
    await expect(page.getByText('Native Feel')).toBeVisible();

    // UI/UX Design card
    await expect(page.getByRole('heading', { name: 'UI/UX Design' })).toBeVisible();
    await expect(page.getByText('Creating visually stunning and user-friendly interfaces that enhance user experience')).toBeVisible();
    await expect(page.getByText('Modern Design')).toBeVisible();
    await expect(page.getByText('User Research')).toBeVisible();
    await expect(page.getByText('Prototyping')).toBeVisible();

    // Digital Strategy card
    await expect(page.getByRole('heading', { name: 'Digital Strategy' })).toBeVisible();
    await expect(page.getByText('Developing comprehensive digital strategies to optimize your online presence')).toBeVisible();
    await expect(page.getByText('Growth Planning')).toBeVisible();
    await expect(page.getByText('Analytics')).toBeVisible();
    await expect(page.getByText('ROI Focused')).toBeVisible();

    // AI Solutions card
    await expect(page.getByRole('heading', { name: 'AI Solutions' })).toBeVisible();
    await expect(page.getByText('Integrating cutting-edge AI technologies to automate processes, gain insights')).toBeVisible();
    await expect(page.getByText('Machine Learning')).toBeVisible();
    await expect(page.getByText('Automation')).toBeVisible();
    await expect(page.getByText('Data Analysis')).toBeVisible();

    // Consultancy card
    await expect(page.getByRole('heading', { name: 'Consultancy' })).toBeVisible();
    await expect(page.getByText('Providing expert advice and guidance to help you navigate the complex digital landscape')).toBeVisible();
    await expect(page.getByText('Expert Advice')).toBeVisible();
    await expect(page.getByText('Strategy')).toBeVisible();
    await expect(page.getByText('Best Practices')).toBeVisible();

    // Verify 'Learn More' buttons are present for services
    const learnMoreButtons = page.locator('.jsx-52a1e3b25473c0c8 button:has-text("Learn More")');
    await expect(learnMoreButtons).toHaveCount(6);

    await expect(page.getByRole('button', { name: 'Get in Touch' })).toBeVisible();
  });

  test('should display project cards with details in Projects section', async () => {
    // Navigate to Projects section using the desktop navigation link
    await page.getByRole('navigation').getByRole('link', { name: 'Projects', exact: true }).click();
    await page.waitForLoadState('networkidle');

    // Nebula Dashboard
    await expect(page.getByRole('heading', { name: 'Nebula Dashboard' })).toBeVisible();
    await expect(page.getByText('A high-performance analytics dashboard for visualizing complex datasets in real-time.')).toBeVisible();
    await expect(page.getByText('React')).toBeVisible();
    await expect(page.getByText('Next.js')).toBeVisible();
    await expect(page.getByText('Tailwind')).toBeVisible();
    await expect(page.getByText('Recharts')).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Case Study' }).first()).toBeVisible();

    // Quantum Commerce
    await expect(page.getByRole('heading', { name: 'Quantum Commerce' })).toBeVisible();
    await expect(page.getByText('Next-generation e-commerce platform with AI-driven product recommendations')).toBeVisible();
    await expect(page.getByText('TypeScript')).toBeVisible();
    await expect(page.getByText('Node.js')).toBeVisible();
    await expect(page.getByText('GraphQL')).toBeVisible();
    await expect(page.getByText('Stripe')).toBeVisible();

    // Cyber Sentinel
    await expect(page.getByRole('heading', { name: 'Cyber Sentinel' })).toBeVisible();
    await expect(page.getByText('AI-powered cybersecurity threat detection system.')).toBeVisible();
    await expect(page.getByText('Python')).toBeVisible();
    await expect(page.getByText('TensorFlow')).toBeVisible();
    await expect(page.getByText('FastAPI')).toBeVisible();
    await expect(page.getByText('Docker')).toBeVisible();
  });

  test('should display testimonials in the testimonials section', async () => {
    // Navigate to Testimonials section using the desktop navigation link
    await page.getByRole('navigation').getByRole('link', { name: 'Testimonials', exact: true }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Trusted by Visionaries' })).toBeVisible();
    // Check for specific testimonial text and author
    await expect(page.getByText('“PulsarX transformed our online presence. Their team is professional, creative, and delivered beyond our expectations!”')).toBeVisible();
    await expect(page.getByText('Faraz Ali')).toBeVisible();
    await expect(page.getByText('CEO, Innovatech')).toBeVisible();

    // Since it's a marquee, check for other testimonials to ensure content is loaded.
    await expect(page.getByText('“The app they developed for us is fantastic. User-friendly, robust, and has significantly improved our customer engagement.”')).toBeVisible();
    await expect(page.getByText('John Smith')).toBeVisible();
  });

  test('should display contact form fields and submission button', async () => {
    // Navigate to Contact section using the desktop navigation link
    await page.getByRole('navigation').getByRole('link', { name: 'Contact', exact: true }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Send us a message' })).toBeVisible();
    const nameInput = page.getByLabel('Full Name');
    const emailInput = page.getByLabel('Email Address');
    const messageTextarea = page.getByLabel('Message');
    const sendMessageButton = page.getByRole('button', { name: 'Send Message' });

    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveAttribute('placeholder', 'John Doe');
    await expect(nameInput).toHaveAttribute('required', '');

    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('placeholder', 'john@example.com');
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(emailInput).toHaveAttribute('type', 'email');

    await expect(messageTextarea).toBeVisible();
    await expect(messageTextarea).toHaveAttribute('placeholder', 'Tell us about your project...');
    await expect(messageTextarea).toHaveAttribute('required', '');

    await expect(sendMessageButton).toBeVisible();
  });

  test('should display Book a Call section with external link', async () => {
    // Navigate to Contact section using the desktop navigation link
    await page.getByRole('navigation').getByRole('link', { name: 'Contact', exact: true }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Book a Call' })).toBeVisible();
    await expect(page.getByText('Prefer to talk directly? Schedule a free 15-minute consultation with our experts.')).toBeVisible();
    const scheduleMeetingButton = page.getByRole('link', { name: 'Schedule Meeting' });
    await expect(scheduleMeetingButton).toBeVisible();
    await expect(scheduleMeetingButton).toHaveAttribute('href', 'https://calendly.com/');
    await expect(scheduleMeetingButton).toHaveAttribute('target', '_blank');
  });

  test('should display contact information and quick info', async () => {
    // Navigate to Contact section using the desktop navigation link
    await page.getByRole('navigation').getByRole('link', { name: 'Contact', exact: true }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Contact Info' })).toBeVisible();
    const emailLink = page.getByRole('link', { name: 'pulsarx.inc@gmail.com' });
    await expect(emailLink).toBeVisible();
    await expect(emailLink).toHaveAttribute('href', 'mailto:pulsarx.inc@gmail.com');

    const phoneLink = page.getByRole('link', { name: '+92 304 7058585' });
    await expect(phoneLink).toBeVisible();
    await expect(phoneLink).toHaveAttribute('href', 'tel:+923047058585');

    await expect(page.getByText('Street 55 I8/3 Islamabad, Pakistan, WEB 40404')).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Quick Info' })).toBeVisible();
    await expect(page.getByText('< 24 hours')).toBeVisible();
    await expect(page.getByText('PKT (UTC+5)')).toBeVisible();
    await expect(page.getByText('English, Urdu')).toBeVisible();
  });

  test('should display social media links in contact section', async () => {
    // Navigate to Contact section using the desktop navigation link
    await page.getByRole('navigation').getByRole('link', { name: 'Contact', exact: true }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Follow Us' }).first()).toBeVisible(); // First to differentiate from footer
    const linkedInLink = page.locator('a[aria-label="LinkedIn"]').first();
    await expect(linkedInLink).toBeVisible();
    await expect(linkedInLink).toHaveAttribute('href', 'https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/');

    const twitterLink = page.locator('a[aria-label="Twitter"]').first();
    await expect(twitterLink).toBeVisible();
    await expect(twitterLink).toHaveAttribute('href', 'https://x.com/');

    const gitHubLink = page.locator('a[aria-label="GitHub"]').first();
    await expect(gitHubLink).toBeVisible();
    await expect(gitHubLink).toHaveAttribute('href', 'https://github.com/ahmaddii');

    const emailSocialLink = page.locator('a[aria-label="Email"]').first();
    await expect(emailSocialLink).toBeVisible();
    await expect(emailSocialLink).toHaveAttribute('href', 'mailto:contact@pulsarx.com');
  });

  test('should display footer content, links, and newsletter subscription', async () => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); // Scroll to bottom
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('link', { name: 'PulsarX' }).last()).toBeVisible(); // Footer logo
    await expect(page.getByText('Illuminating the digital universe with innovative solutions. We transform visions into reality through cutting-edge technology and creative excellence.')).toBeVisible();
    await expect(page.getByText('Crafting digital excellence since 2024')).toBeVisible();

    // Quick Links in footer
    await expect(page.getByRole('heading', { name: 'Quick Links' })).toBeVisible();
    await expect(page.locator('footer').getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.locator('footer').getByRole('link', { name: 'About Us' })).toBeVisible();
    await expect(page.locator('footer').getByRole('link', { name: 'Services' })).toBeVisible();
    await expect(page.locator('footer').getByRole('link', { name: 'Portfolio' })).toBeVisible();
    await expect(page.locator('footer').getByRole('link', { name: 'Contact' }).last()).toBeVisible(); // Last contact link in footer

    // Services links in footer
    await expect(page.getByRole('heading', { name: 'Services' }).last()).toBeVisible(); // Last Services heading
    await expect(page.getByRole('link', { name: 'Web Development', exact: true }).last()).toBeVisible();
    await expect(page.getByRole('link', { name: 'App Development', exact: true }).last()).toBeVisible();
    await expect(page.getByRole('link', { name: 'UI/UX Design', exact: true }).last()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Consulting', exact: true }).last()).toBeVisible();

    // Get In Touch in footer
    await expect(page.getByRole('heading', { name: 'Get In Touch' }).last()).toBeVisible();
    await expect(page.getByText('Islamabad, Punjab, PK')).toBeVisible();
    await expect(page.locator('footer').getByText('+92 304 7058585')).toBeVisible();
    await expect(page.locator('footer').getByText('pulsarx.inc@gmail.com')).toBeVisible();

    // Social media links in footer
    await expect(page.getByText('Follow us on social media')).toBeVisible();
    await expect(page.locator('footer a[aria-label="LinkedIn"]')).toBeVisible();
    await expect(page.locator('footer a[aria-label="Twitter"]')).toBeVisible();
    await expect(page.locator('footer a[aria-label="GitHub"]')).toBeVisible();
    await expect(page.locator('footer a[aria-label="Email"]')).toBeVisible(); // Email icon in footer

    // Newsletter Subscription
    await expect(page.getByRole('heading', { name: 'Stay Updated' })).toBeVisible();
    await expect(page.getByText('Subscribe to our newsletter for the latest updates and insights')).toBeVisible();
    const emailInput = page.getByPlaceholder('Enter your email');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();

    // Copyright and policy links
    await expect(page.getByText('© 2026 PulsarX. All rights reserved to Pakistan 🇵🇰')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Terms of Service' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cookies' })).toBeVisible();
  });

  test('Back to top button should appear on scroll and be clickable', async () => {
    // Check it's initially hidden
    const backToTopButton = page.getByRole('button', { name: 'Back to top' });
    await expect(backToTopButton).toBeHidden();

    // Scroll down to make it visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForLoadState('networkidle');
    await expect(backToTopButton).toBeVisible(); // It will become visible after scrolling

    // Click the button and verify it scrolls to top (Home section)
    await backToTopButton.click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#home')).toBeInViewport();
  });

  // Feature mentioned in code changes was not found in rendered page - skipping test for Radix UI Toast,
  // as its visibility depends on user interaction (e.g., form submission success), and the provided HTML only shows its container.
  // Requires manual verification or mocking backend response to trigger toast.
  // `react-day-picker` and `recharts` features are not visibly implemented with interactive components in the provided HTML.
  // `genkit` and `googleai` are backend/AI integration, no explicit UI changes or features detected.
});
