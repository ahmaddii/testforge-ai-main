# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: run-1783772330303-y7navd/pr-1.spec.ts >> PulsarX Landing Page Functionality >> should open and close mobile navigation menu
- Location: src/temp_tests/run-1783772330303-y7navd/pr-1.spec.ts:40:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Menu' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: 'Menu' })

```

```yaml
- navigation:
  - link "PulsarX Logo PulsarX":
    - /url: "#home"
    - img "PulsarX Logo"
    - text: PulsarX
  - button:
    - img
- link "Home":
  - /url: "#home"
- link "About":
  - /url: "#about"
- link "Services":
  - /url: "#services"
- link "Projects":
  - /url: "#projects"
- link "Testimonials":
  - /url: "#testimonials"
- link "Contact":
  - /url: "#contact"
- link "Get Started":
  - /url: mailto:pulsarx.inc@gmail.com
- main:
  - text: Leading Software Development Agency
  - heading "Transforming Ideas into Digital Reality" [level=1]
  - paragraph: We build scalable, high-performance software solutions tailored to your business needs. From web applications to complex enterprise systems, we deliver excellence.
  - link "Get Started":
    - /url: mailto:pulsarx.inc@gmail.com
    - text: Get Started
    - img
  - button "Contact Us"
  - img
  - text: 100+ Projects Delivered
  - img
  - text: 50+ Global Clients
  - img
  - text: 99.9% Uptime Guarantee
  - img
  - text: 2x ROI Average
  - img
  - text: About Us
  - heading "Discover PulsarX" [level=2]
  - paragraph: Where innovation meets excellence. We're on a mission to illuminate the digital universe with transformative solutions.
  - img "PulsarX Team"
  - text: Building the Future
  - heading "Our Story" [level=3]
  - paragraph: Founded with a passion for innovation and a commitment to excellence, PulsarX has grown from a small idea into a dynamic force in the digital landscape. We believe in the power of technology to transform businesses and create meaningful impact that resonates across industries.
  - img
  - heading "Our Mission" [level=4]:
    - text: Our Mission
    - img
  - paragraph: To empower businesses with cutting-edge digital solutions that drive growth, efficiency, and success in an ever-evolving world.
  - img
  - heading "Our Vision" [level=4]:
    - text: Our Vision
    - img
  - paragraph: To be a leading digital partner, recognized for our creativity, technical expertise, and unwavering dedication to client satisfaction.
  - link "Learn More About Us":
    - /url: https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/
    - text: Learn More About Us
    - img
  - img
  - text: 500+ Happy Clients
  - img
  - text: 1000+ Projects Completed
  - img
  - text: 98% Success Rate
  - img
  - text: 5+ Years Experience
  - img
  - text: What We Offer
  - heading "Our Services" [level=2]
  - paragraph: We offer a wide range of digital solutions to help your business thrive in the modern digital landscape.
  - img
  - img
  - heading "Web Development" [level=3]
  - paragraph: Crafting responsive, high-performance websites tailored to your business needs using the latest technologies.
  - img
  - text: Responsive Design
  - img
  - text: Fast Performance
  - img
  - text: SEO Optimized
  - button "Learn More":
    - text: Learn More
    - img
  - img
  - img
  - heading "App Development" [level=3]
  - paragraph: Building intuitive and scalable mobile applications for iOS and Android platforms that engage your users.
  - img
  - text: iOS & Android
  - img
  - text: Cross-Platform
  - img
  - text: Native Feel
  - button "Learn More":
    - text: Learn More
    - img
  - img
  - img
  - heading "UI/UX Design" [level=3]
  - paragraph: Creating visually stunning and user-friendly interfaces that enhance user experience and brand identity.
  - img
  - text: Modern Design
  - img
  - text: User Research
  - img
  - text: Prototyping
  - button "Learn More":
    - text: Learn More
    - img
  - img
  - img
  - heading "Digital Strategy" [level=3]
  - paragraph: Developing comprehensive digital strategies to optimize your online presence and achieve your business goals.
  - img
  - text: Growth Planning
  - img
  - text: Analytics
  - img
  - text: ROI Focused
  - button "Learn More":
    - text: Learn More
    - img
  - img
  - img
  - heading "AI Solutions" [level=3]
  - paragraph: Integrating cutting-edge AI technologies to automate processes, gain insights, and drive innovation.
  - img
  - text: Machine Learning
  - img
  - text: Automation
  - img
  - text: Data Analysis
  - button "Learn More":
    - text: Learn More
    - img
  - img
  - img
  - heading "Consultancy" [level=3]
  - paragraph: Providing expert advice and guidance to help you navigate the complex digital landscape and make informed decisions.
  - img
  - text: Expert Advice
  - img
  - text: Strategy
  - img
  - text: Best Practices
  - button "Learn More":
    - text: Learn More
    - img
  - paragraph: Need a custom solution? We're here to help.
  - button "Get in Touch":
    - text: Get in Touch
    - img
  - heading "Featured Masterpieces" [level=2]
  - paragraph: Explore a selection of our most impactful projects, where innovation meets execution.
  - img
  - heading "Nebula Dashboard" [level=3]
  - paragraph: A high-performance analytics dashboard for visualizing complex datasets in real-time. Features dark mode and customizable widgets.
  - text: React Next.js Tailwind Recharts
  - link "View Case Study":
    - /url: "#"
    - text: View Case Study
    - img
  - img
  - heading "Quantum Commerce" [level=3]
  - paragraph: Next-generation e-commerce platform with AI-driven product recommendations and sub-second page loads.
  - text: TypeScript Node.js GraphQL Stripe
  - link "View Case Study":
    - /url: "#"
    - text: View Case Study
    - img
  - img
  - heading "Cyber Sentinel" [level=3]
  - paragraph: AI-powered cybersecurity threat detection system. Monitors network traffic and identifies anomalies instantly.
  - text: Python TensorFlow FastAPI Docker
  - link "View Case Study":
    - /url: "#"
    - text: View Case Study
    - img
  - img
  - text: Wall of Love
  - heading "Trusted by Visionaries" [level=2]
  - paragraph: Don't just take our word for it. Here's what the founders and leaders we work with have to say.
  - img
  - img
  - img
  - img
  - img
  - paragraph: “PulsarX transformed our online presence. Their team is professional, creative, and delivered beyond our expectations!”
  - img "Faraz Ali"
  - paragraph: Faraz Ali
  - paragraph: CEO, Innovatech
  - img
  - img
  - img
  - img
  - img
  - paragraph: “The app they developed for us is fantastic. User-friendly, robust, and has significantly improved our customer engagement.”
  - img "John Smith"
  - paragraph: John Smith
  - paragraph: Marketing Director, BizSolutions
  - img
  - img
  - img
  - img
  - img
  - paragraph: “Exceptional UI/UX design work. PulsarX understood our brand perfectly and created a stunning interface.”
  - img "Alice Brown"
  - paragraph: Alice Brown
  - paragraph: Founder, Creative Co.
  - img
  - img
  - img
  - img
  - img
  - paragraph: “Working with PulsarX was a game-changer. They brought our vision to life with incredible attention to detail.”
  - img "Michael Chen"
  - paragraph: Michael Chen
  - paragraph: CTO, FutureScale
  - img
  - img
  - img
  - img
  - img
  - paragraph: “Their development speed and code quality are unmatched. Highly recommended for any serious startup.”
  - img "Sarah Johnson"
  - paragraph: Sarah Johnson
  - paragraph: Product Lead, TechFlow
  - img
  - img
  - img
  - img
  - img
  - paragraph: “A truly partner-centric approach. They didn't just build software; they helped us build a business.”
  - img "David Wilson"
  - paragraph: David Wilson
  - paragraph: Founder, StartUp Hub
  - img
  - img
  - img
  - img
  - img
  - paragraph: “PulsarX transformed our online presence. Their team is professional, creative, and delivered beyond our expectations!”
  - img "Faraz Ali"
  - paragraph: Faraz Ali
  - paragraph: CEO, Innovatech
  - img
  - img
  - img
  - img
  - img
  - paragraph: “The app they developed for us is fantastic. User-friendly, robust, and has significantly improved our customer engagement.”
  - img "John Smith"
  - paragraph: John Smith
  - paragraph: Marketing Director, BizSolutions
  - img
  - img
  - img
  - img
  - img
  - paragraph: “Exceptional UI/UX design work. PulsarX understood our brand perfectly and created a stunning interface.”
  - img "Alice Brown"
  - paragraph: Alice Brown
  - paragraph: Founder, Creative Co.
  - img
  - img
  - img
  - img
  - img
  - paragraph: “Working with PulsarX was a game-changer. They brought our vision to life with incredible attention to detail.”
  - img "Michael Chen"
  - paragraph: Michael Chen
  - paragraph: CTO, FutureScale
  - img
  - img
  - img
  - img
  - img
  - paragraph: “Their development speed and code quality are unmatched. Highly recommended for any serious startup.”
  - img "Sarah Johnson"
  - paragraph: Sarah Johnson
  - paragraph: Product Lead, TechFlow
  - img
  - img
  - img
  - img
  - img
  - paragraph: “A truly partner-centric approach. They didn't just build software; they helped us build a business.”
  - img "David Wilson"
  - paragraph: David Wilson
  - paragraph: Founder, StartUp Hub
  - img
  - img
  - img
  - img
  - img
  - paragraph: “PulsarX transformed our online presence. Their team is professional, creative, and delivered beyond our expectations!”
  - img "Faraz Ali"
  - paragraph: Faraz Ali
  - paragraph: CEO, Innovatech
  - img
  - img
  - img
  - img
  - img
  - paragraph: “The app they developed for us is fantastic. User-friendly, robust, and has significantly improved our customer engagement.”
  - img "John Smith"
  - paragraph: John Smith
  - paragraph: Marketing Director, BizSolutions
  - img
  - img
  - img
  - img
  - img
  - paragraph: “Exceptional UI/UX design work. PulsarX understood our brand perfectly and created a stunning interface.”
  - img "Alice Brown"
  - paragraph: Alice Brown
  - paragraph: Founder, Creative Co.
  - img
  - img
  - img
  - img
  - img
  - paragraph: “Working with PulsarX was a game-changer. They brought our vision to life with incredible attention to detail.”
  - img "Michael Chen"
  - paragraph: Michael Chen
  - paragraph: CTO, FutureScale
  - img
  - img
  - img
  - img
  - img
  - paragraph: “Their development speed and code quality are unmatched. Highly recommended for any serious startup.”
  - img "Sarah Johnson"
  - paragraph: Sarah Johnson
  - paragraph: Product Lead, TechFlow
  - img
  - img
  - img
  - img
  - img
  - paragraph: “A truly partner-centric approach. They didn't just build software; they helped us build a business.”
  - img "David Wilson"
  - paragraph: David Wilson
  - paragraph: Founder, StartUp Hub
  - img
  - img
  - img
  - img
  - img
  - paragraph: “PulsarX transformed our online presence. Their team is professional, creative, and delivered beyond our expectations!”
  - img "Faraz Ali"
  - paragraph: Faraz Ali
  - paragraph: CEO, Innovatech
  - img
  - img
  - img
  - img
  - img
  - paragraph: “The app they developed for us is fantastic. User-friendly, robust, and has significantly improved our customer engagement.”
  - img "John Smith"
  - paragraph: John Smith
  - paragraph: Marketing Director, BizSolutions
  - img
  - img
  - img
  - img
  - img
  - paragraph: “Exceptional UI/UX design work. PulsarX understood our brand perfectly and created a stunning interface.”
  - img "Alice Brown"
  - paragraph: Alice Brown
  - paragraph: Founder, Creative Co.
  - img
  - img
  - img
  - img
  - img
  - paragraph: “Working with PulsarX was a game-changer. They brought our vision to life with incredible attention to detail.”
  - img "Michael Chen"
  - paragraph: Michael Chen
  - paragraph: CTO, FutureScale
  - img
  - img
  - img
  - img
  - img
  - paragraph: “Their development speed and code quality are unmatched. Highly recommended for any serious startup.”
  - img "Sarah Johnson"
  - paragraph: Sarah Johnson
  - paragraph: Product Lead, TechFlow
  - img
  - img
  - img
  - img
  - img
  - paragraph: “A truly partner-centric approach. They didn't just build software; they helped us build a business.”
  - img "David Wilson"
  - paragraph: David Wilson
  - paragraph: Founder, StartUp Hub
  - img
  - text: Contact Us
  - heading "Get In Touch" [level=2]
  - paragraph: Have a project in mind or just want to say hi? We'd love to hear from you and discuss how we can help bring your vision to life.
  - text: Send us a message
  - paragraph: Fill out the form below and we'll get back to you shortly.
  - text: Full Name *
  - textbox "Full Name *":
    - /placeholder: John Doe
  - text: Email Address *
  - textbox "Email Address *":
    - /placeholder: john@example.com
  - text: Message *
  - textbox "Message *":
    - /placeholder: Tell us about your project...
  - button "Send Message":
    - text: Send Message
    - img
  - text: Book a Call
  - paragraph: Prefer to talk directly? Schedule a free 15-minute consultation with our experts.
  - link "Schedule Meeting":
    - /url: https://calendly.com/
    - img
    - text: Schedule Meeting
  - text: Contact Info
  - link "Email pulsarx.inc@gmail.com":
    - /url: mailto:pulsarx.inc@gmail.com
    - img
    - paragraph: Email
    - paragraph: pulsarx.inc@gmail.com
  - link "Phone +92 304 7058585":
    - /url: tel:+923047058585
    - img
    - paragraph: Phone
    - paragraph: +92 304 7058585
  - link "Address Street 55 I8/3 Islamabad, Pakistan, WEB 40404":
    - /url: "#"
    - img
    - paragraph: Address
    - paragraph: Street 55 I8/3 Islamabad, Pakistan, WEB 40404
  - text: Quick Info
  - img
  - paragraph: Response Time
  - paragraph: < 24 hours
  - img
  - paragraph: Timezone
  - paragraph: PKT (UTC+5)
  - img
  - paragraph: Languages
  - paragraph: English, Urdu
  - text: Follow Us
  - link "LinkedIn":
    - /url: https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/
    - img
  - link "Twitter":
    - /url: https://x.com/
    - img
  - link "GitHub":
    - /url: https://github.com/ahmaddii
    - img
- contentinfo:
  - link "PulsarX Logo PulsarX":
    - /url: "#home"
    - img "PulsarX Logo"
    - text: PulsarX
  - paragraph: Illuminating the digital universe with innovative solutions. We transform visions into reality through cutting-edge technology and creative excellence.
  - img
  - text: Crafting digital excellence since 2024
  - heading "Quick Links" [level=3]
  - list:
    - listitem:
      - link "Home":
        - /url: "#home"
    - listitem:
      - link "About Us":
        - /url: "#about"
    - listitem:
      - link "Services":
        - /url: "#services"
    - listitem:
      - link "Portfolio":
        - /url: "#portfolio"
    - listitem:
      - link "Contact":
        - /url: "#contact"
  - heading "Services" [level=3]
  - list:
    - listitem:
      - link "Web Development":
        - /url: "#web-dev"
    - listitem:
      - link "App Development":
        - /url: "#app-dev"
    - listitem:
      - link "UI/UX Design":
        - /url: "#ui-ux"
    - listitem:
      - link "Consulting":
        - /url: "#consulting"
  - heading "Get In Touch" [level=3]
  - img
  - text: Islamabad, Punjab, PK
  - img
  - text: +92 304 7058585
  - img
  - text: pulsarx.inc@gmail.com
  - paragraph: Follow us on social media
  - link "LinkedIn":
    - /url: https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/
    - img
  - link "Twitter":
    - /url: https://x.com/
    - img
  - link "GitHub":
    - /url: https://github.com/ahmaddii
    - img
  - link "Email":
    - /url: mailto:contact@pulsarx.com
    - img
  - heading "Stay Updated" [level=3]
  - paragraph: Subscribe to our newsletter for the latest updates and insights
  - textbox "Enter your email"
  - button "Subscribe"
  - paragraph: © 2026 PulsarX. All rights reserved to Pakistan 🇵🇰
  - link "Privacy Policy":
    - /url: https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/
  - link "Terms of Service":
    - /url: https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/
  - link "Cookies":
    - /url: https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/
  - button "Back to top":
    - img
- region "Notifications (F8)":
  - list
- alert
```

# Test source

```ts
  1   | import { test, expect, Page } from '@playwright/test';
  2   | 
  3   | const BASE_URL = 'http://127.0.0.1:5296';
  4   | 
  5   | test.describe('PulsarX Landing Page Functionality', () => {
  6   |   let page: Page;
  7   | 
  8   |   test.beforeEach(async ({ browser }) => {
  9   |     page = await browser.newPage();
  10  |     await page.goto(BASE_URL);
  11  |     await page.waitForLoadState('networkidle');
  12  |   });
  13  | 
  14  |   test.afterEach(async () => {
  15  |     await page.close();
  16  |   });
  17  | 
  18  |   test('should load the page successfully and display main hero content', async () => {
  19  |     await expect(page).toHaveTitle(/PulsarX | Where Innovation Meets Excellence/);
  20  |     await expect(page.getByRole('heading', { name: 'Transforming Ideas into Digital Reality' })).toBeVisible();
  21  |     await expect(page.getByText('We build scalable, high-performance software solutions tailored to your business needs.')).toBeVisible();
  22  |     await expect(page.getByRole('button', { name: 'Get Started' }).first()).toBeVisible();
  23  |     await expect(page.getByRole('button', { name: 'Contact Us' }).first()).toBeVisible();
  24  |   });
  25  | 
  26  |   test('should display all navigation links on desktop', async () => {
  27  |     // Assuming desktop view, so mobile menu button is hidden
  28  |     await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
  29  | 
  30  |     // Use getByRole('navigation') to scope the links to the main navigation area
  31  |     await expect(page.getByRole('navigation').getByRole('link', { name: 'Home' }).first()).toBeVisible();
  32  |     await expect(page.getByRole('navigation').getByRole('link', { name: 'About', exact: true })).toBeVisible();
  33  |     await expect(page.getByRole('navigation').getByRole('link', { name: 'Services', exact: true })).toBeVisible();
  34  |     await expect(page.getByRole('navigation').getByRole('link', { name: 'Projects', exact: true })).toBeVisible();
  35  |     await expect(page.getByRole('navigation').getByRole('link', { name: 'Testimonials', exact: true })).toBeVisible();
  36  |     await expect(page.getByRole('navigation').getByRole('link', { name: 'Contact', exact: true })).toBeVisible();
  37  |     await expect(page.getByRole('navigation').getByRole('link', { name: 'Get Started', exact: true }).first()).toBeVisible();
  38  |   });
  39  | 
  40  |   test('should open and close mobile navigation menu', async () => {
  41  |     await page.setViewportSize({ width: 375, height: 667 }); // Simulate mobile viewport
  42  |     await page.waitForLoadState('networkidle');
  43  | 
  44  |     const menuButton = page.getByRole('button', { name: 'Menu' });
> 45  |     await expect(menuButton).toBeVisible();
      |                              ^ Error: expect(locator).toBeVisible() failed
  46  |     await menuButton.click();
  47  | 
  48  |     // The mobile menu might be considered a dialog or have a different role.
  49  |     // For now, keeping nth(1) as it was used to target mobile links, but aware it can be fragile.
  50  |     await expect(page.getByRole('link', { name: 'Home' }).nth(1)).toBeVisible(); // Nth(1) to target the mobile menu link
  51  |     await expect(page.getByRole('link', { name: 'About' }).nth(1)).toBeVisible();
  52  |     // Test closing the menu by clicking a link
  53  |     await page.getByRole('link', { name: 'About' }).nth(1).click();
  54  |     await page.waitForLoadState('networkidle');
  55  |     await expect(page.getByRole('link', { name: 'About' }).nth(1)).toBeHidden(); // Verify mobile menu is hidden
  56  |   });
  57  | 
  58  |   test('should navigate to sections via desktop navigation links', async () => {
  59  |     // Use getByRole('navigation') to scope the clicks to the main navigation area
  60  |     await expect(page.getByRole('navigation').getByRole('link', { name: 'About', exact: true })).toBeVisible();
  61  |     await page.getByRole('navigation').getByRole('link', { name: 'About', exact: true }).click();
  62  |     await page.waitForLoadState('networkidle');
  63  |     await expect(page.locator('#about')).toBeInViewport(); // Verify scroll to section
  64  |     await expect(page.getByRole('heading', { name: 'Discover PulsarX' })).toBeVisible();
  65  | 
  66  |     await page.getByRole('navigation').getByRole('link', { name: 'Services', exact: true }).click();
  67  |     await page.waitForLoadState('networkidle');
  68  |     await expect(page.locator('#services')).toBeInViewport();
  69  |     await expect(page.getByRole('heading', { name: 'Our Services' })).toBeVisible();
  70  | 
  71  |     await page.getByRole('navigation').getByRole('link', { name: 'Projects', exact: true }).click();
  72  |     await page.waitForLoadState('networkidle');
  73  |     await expect(page.locator('#projects')).toBeInViewport();
  74  |     await expect(page.getByRole('heading', { name: 'Featured Masterpieces' })).toBeVisible();
  75  | 
  76  |     await page.getByRole('navigation').getByRole('link', { name: 'Testimonials', exact: true }).click();
  77  |     await page.waitForLoadState('networkidle');
  78  |     await expect(page.locator('#testimonials')).toBeInViewport();
  79  |     await expect(page.getByRole('heading', { name: 'Trusted by Visionaries' })).toBeVisible();
  80  | 
  81  |     await page.getByRole('navigation').getByRole('link', { name: 'Contact', exact: true }).click();
  82  |     await page.waitForLoadState('networkidle');
  83  |     await expect(page.locator('#contact')).toBeInViewport();
  84  |     await expect(page.getByRole('heading', { name: 'Get In Touch' })).toBeVisible();
  85  |   });
  86  | 
  87  |   test('should display key statistics in hero section', async () => {
  88  |     await expect(page.getByText('100+', { exact: true })).toBeVisible();
  89  |     await expect(page.getByText('Projects Delivered')).toBeVisible();
  90  |     await expect(page.getByText('50+', { exact: true })).toBeVisible();
  91  |     await expect(page.getByText('Global Clients')).toBeVisible();
  92  |     await expect(page.getByText('99.9%', { exact: true })).toBeVisible();
  93  |     await expect(page.getByText('Uptime Guarantee')).toBeVisible();
  94  |     await expect(page.getByText('2x', { exact: true })).toBeVisible();
  95  |     await expect(page.getByText('ROI Average')).toBeVisible();
  96  |   });
  97  | 
  98  |   test('should display "Our Story", "Our Mission", and "Our Vision" in About section', async () => {
  99  |     // Navigate to About section using the desktop navigation link
  100 |     await page.getByRole('navigation').getByRole('link', { name: 'About', exact: true }).click();
  101 |     await page.waitForLoadState('networkidle');
  102 | 
  103 |     await expect(page.getByRole('heading', { name: 'Our Story' })).toBeVisible();
  104 |     await expect(page.getByText(/Founded with a passion for innovation/)).toBeVisible();
  105 | 
  106 |     await expect(page.getByRole('heading', { name: 'Our Mission' })).toBeVisible();
  107 |     await expect(page.getByText(/To empower businesses with cutting-edge digital solutions/)).toBeVisible();
  108 | 
  109 |     await expect(page.getByRole('heading', { name: 'Our Vision' })).toBeVisible();
  110 |     await expect(page.getByText(/To be a leading digital partner, recognized for our creativity/)).toBeVisible();
  111 | 
  112 |     // Verify "Learn More About Us" button links to LinkedIn
  113 |     const learnMoreButton = page.getByRole('link', { name: 'Learn More About Us' });
  114 |     await expect(learnMoreButton).toBeVisible();
  115 |     await expect(learnMoreButton).toHaveAttribute('href', 'https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/');
  116 |   });
  117 | 
  118 |   test('should display services cards with titles and descriptions', async () => {
  119 |     // Navigate to Services section using the desktop navigation link
  120 |     await page.getByRole('navigation').getByRole('link', { name: 'Services', exact: true }).click();
  121 |     await page.waitForLoadState('networkidle');
  122 | 
  123 |     // Web Development card
  124 |     await expect(page.getByRole('heading', { name: 'Web Development' })).toBeVisible();
  125 |     await expect(page.getByText('Crafting responsive, high-performance websites tailored to your business needs')).toBeVisible();
  126 |     await expect(page.getByText('Responsive Design')).toBeVisible();
  127 |     await expect(page.getByText('Fast Performance')).toBeVisible();
  128 |     await expect(page.getByText('SEO Optimized')).toBeVisible();
  129 | 
  130 |     // App Development card
  131 |     await expect(page.getByRole('heading', { name: 'App Development' })).toBeVisible();
  132 |     await expect(page.getByText('Building intuitive and scalable mobile applications for iOS and Android platforms')).toBeVisible();
  133 |     await expect(page.getByText('iOS & Android')).toBeVisible();
  134 |     await expect(page.getByText('Cross-Platform')).toBeVisible();
  135 |     await expect(page.getByText('Native Feel')).toBeVisible();
  136 | 
  137 |     // UI/UX Design card
  138 |     await expect(page.getByRole('heading', { name: 'UI/UX Design' })).toBeVisible();
  139 |     await expect(page.getByText('Creating visually stunning and user-friendly interfaces that enhance user experience')).toBeVisible();
  140 |     await expect(page.getByText('Modern Design')).toBeVisible();
  141 |     await expect(page.getByText('User Research')).toBeVisible();
  142 |     await expect(page.getByText('Prototyping')).toBeVisible();
  143 | 
  144 |     // Digital Strategy card
  145 |     await expect(page.getByRole('heading', { name: 'Digital Strategy' })).toBeVisible();
```