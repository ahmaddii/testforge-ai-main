# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: run-1783922220766-movdki/pr-1.spec.ts >> PulsarX Landing Page Functionality >> About Section (#about) >> should display about section content and mission/vision statements
- Location: src/temp_tests/run-1783922220766-movdki/pr-1.spec.ts:68:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'About Us' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'About Us' })

```

```yaml
- navigation:
  - link "PulsarX Logo PulsarX":
    - /url: "#home"
    - img "PulsarX Logo"
    - text: PulsarX
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
  3   | const BASE_URL = 'http://127.0.0.1:6513';
  4   | 
  5   | test.describe('PulsarX Landing Page Functionality', () => {
  6   |   let page: Page;
  7   | 
  8   |   test.beforeAll(async ({ browser }) => {
  9   |     page = await browser.newPage();
  10  |     await page.goto(BASE_URL);
  11  |     await page.waitForLoadState('networkidle');
  12  |   });
  13  | 
  14  |   test.afterAll(async () => {
  15  |     await page.close();
  16  |   });
  17  | 
  18  |   test('should have the correct title', async () => {
  19  |     await expect(page).toHaveTitle('PulsarX | Where Innovation Meets Excellence');
  20  |   });
  21  | 
  22  |   test.describe('Navigation Bar', () => {
  23  |     test('should display the main navigation links', async () => {
  24  |       await expect(page.getByRole('link', { name: 'PulsarX' })).toBeVisible();
  25  |       await expect(page.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
  26  |       await expect(page.getByRole('link', { name: 'About', exact: true })).toBeVisible();
  27  |       await expect(page.getByRole('link', { name: 'Services', exact: true })).toBeVisible();
  28  |       await expect(page.getByRole('link', { name: 'Projects', exact: true })).toBeVisible();
  29  |       await expect(page.getByRole('link', { name: 'Testimonials', exact: true })).toBeVisible();
  30  |       await expect(page.getByRole('link', { name: 'Contact', exact: true })).toBeVisible();
  31  |       await expect(page.getByRole('link', { name: 'Get Started', exact: true })).toBeVisible();
  32  |     });
  33  | 
  34  |     test('should navigate to the About section when "About" link is clicked', async () => {
  35  |       await page.getByRole('link', { name: 'About', exact: true }).click();
  36  |       await page.waitForLoadState('domcontentloaded'); // DOM change as it scrolls
  37  |       await expect(page.getByRole('heading', { name: 'Discover PulsarX' })).toBeVisible();
  38  |     });
  39  | 
  40  |     test('should navigate to the Contact section when "Contact" link is clicked', async () => {
  41  |       await page.getByRole('link', { name: 'Contact', exact: true }).click();
  42  |       await page.waitForLoadState('domcontentloaded');
  43  |       await expect(page.getByRole('heading', { name: 'Get In Touch' })).toBeVisible();
  44  |     });
  45  |   });
  46  | 
  47  |   test.describe('Hero Section (#home)', () => {
  48  |     test('should display hero section content and call to action buttons', async () => {
  49  |       await page.goto(BASE_URL + '#home'); // Ensure we are at the home section
  50  |       await page.waitForLoadState('networkidle');
  51  | 
  52  |       await expect(page.getByText('Leading Software Development Agency')).toBeVisible();
  53  |       await expect(page.getByRole('heading', { name: 'Transforming Ideas into Digital Reality' })).toBeVisible();
  54  |       await expect(page.getByText(/We build scalable, high-performance software solutions/)).toBeVisible();
  55  |       await expect(page.getByRole('link', { name: 'Get Started', exact: true })).toBeVisible();
  56  |       await expect(page.getByRole('button', { name: 'Contact Us', exact: true })).toBeVisible();
  57  |     });
  58  | 
  59  |     test('should display key statistics in hero section', async () => {
  60  |       await expect(page.getByText('100+ Projects Delivered')).toBeVisible();
  61  |       await expect(page.getByText('50+ Global Clients')).toBeVisible();
  62  |       await expect(page.getByText('99.9% Uptime Guarantee')).toBeVisible();
  63  |       await expect(page.getByText('2x ROI Average')).toBeVisible();
  64  |     });
  65  |   });
  66  | 
  67  |   test.describe('About Section (#about)', () => {
  68  |     test('should display about section content and mission/vision statements', async () => {
  69  |       await page.goto(BASE_URL + '#about');
  70  |       await page.waitForLoadState('networkidle');
  71  | 
> 72  |       await expect(page.getByRole('heading', { name: 'About Us' })).toBeVisible();
      |                                                                     ^ Error: expect(locator).toBeVisible() failed
  73  |       await expect(page.getByRole('heading', { name: 'Discover PulsarX' })).toBeVisible();
  74  |       await expect(page.getByRole('heading', { name: 'Our Story' })).toBeVisible();
  75  |       await expect(page.getByText(/Founded with a passion for innovation/)).toBeVisible();
  76  |       await expect(page.getByRole('heading', { name: 'Our Mission' })).toBeVisible();
  77  |       await expect(page.getByText(/To empower businesses with cutting-edge digital solutions/)).toBeVisible();
  78  |       await expect(page.getByRole('heading', { name: 'Our Vision' })).toBeVisible();
  79  |       await expect(page.getByText(/To be a leading digital partner, recognized for our creativity/)).toBeVisible();
  80  |       await expect(page.getByRole('link', { name: 'Learn More About Us' })).toBeVisible();
  81  |       await expect(page.getByRole('link', { name: 'Learn More About Us' })).toHaveAttribute('href', 'https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/');
  82  |     });
  83  | 
  84  |     test('should display about section statistics', async () => {
  85  |       await expect(page.getByText('500+ Happy Clients')).toBeVisible();
  86  |       await expect(page.getByText('1000+ Projects Completed')).toBeVisible();
  87  |       await expect(page.getByText('98% Success Rate')).toBeVisible();
  88  |       await expect(page.getByText('5+ Years Experience')).toBeVisible();
  89  |     });
  90  |   });
  91  | 
  92  |   test.describe('Services Section (#services)', () => {
  93  |     test('should display services section heading and service cards', async () => {
  94  |       await page.goto(BASE_URL + '#services');
  95  |       await page.waitForLoadState('networkidle');
  96  | 
  97  |       await expect(page.getByRole('heading', { name: 'Our Services' })).toBeVisible();
  98  |       await expect(page.getByRole('heading', { name: 'Web Development' })).toBeVisible();
  99  |       await expect(page.getByRole('heading', { name: 'App Development' })).toBeVisible();
  100 |       await expect(page.getByRole('heading', { name: 'UI/UX Design' })).toBeVisible();
  101 |       await expect(page.getByRole('heading', { name: 'Digital Strategy' })).toBeVisible();
  102 |       await expect(page.getByRole('heading', { name: 'AI Solutions' })).toBeVisible();
  103 |       await expect(page.getByRole('heading', { name: 'Consultancy' })).toBeVisible();
  104 |       await expect(page.locator('section').filter({ hasText: 'Need a custom solution? We\'re here to help.Get in Touch' }).getByRole('button', { name: 'Get in Touch' })).toBeVisible();
  105 |     });
  106 | 
  107 |     test('should display features for "Web Development" service', async () => {
  108 |       await page.goto(BASE_URL + '#services');
  109 |       await page.waitForLoadState('networkidle');
  110 | 
  111 |       const webDevCard = page.locator('div').filter({ hasText: /^Web DevelopmentCrafting responsive, high-performance websites tailored to your business needs/ }).first();
  112 |       await expect(webDevCard.getByText('Responsive Design')).toBeVisible();
  113 |       await expect(webDevCard.getByText('Fast Performance')).toBeVisible();
  114 |       await expect(webDevCard.getByText('SEO Optimized')).toBeVisible();
  115 |       await expect(webDevCard.getByRole('button', { name: 'Learn More' })).toBeVisible();
  116 |     });
  117 |   });
  118 | 
  119 |   test.describe('Projects Section (#projects)', () => {
  120 |     test('should display projects section heading and project cards', async () => {
  121 |       await page.goto(BASE_URL + '#projects');
  122 |       await page.waitForLoadState('networkidle');
  123 | 
  124 |       await expect(page.getByRole('heading', { name: 'Featured Masterpieces' })).toBeVisible();
  125 |       await expect(page.getByText('Explore a selection of our most impactful projects, where innovation meets execution.')).toBeVisible();
  126 |       await expect(page.getByRole('heading', { name: 'Nebula Dashboard' })).toBeVisible();
  127 |       await expect(page.getByRole('heading', { name: 'Quantum Commerce' })).toBeVisible();
  128 |       await expect(page.getByRole('heading', { name: 'Cyber Sentinel' })).toBeVisible();
  129 |       await expect(page.getByRole('link', { name: 'View Case Study' }).first()).toBeVisible();
  130 |     });
  131 |   });
  132 | 
  133 |   test.describe('Testimonials Section (#testimonials)', () => {
  134 |     test('should display testimonials section heading and at least one testimonial', async () => {
  135 |       await page.goto(BASE_URL + '#testimonials');
  136 |       await page.waitForLoadState('networkidle');
  137 | 
  138 |       await expect(page.getByRole('heading', { name: 'Trusted by Visionaries' })).toBeVisible();
  139 |       await expect(page.getByText('“PulsarX transformed our online presence. Their team is professional, creative, and delivered beyond our expectations!”')).toBeVisible();
  140 |       await expect(page.getByText('Faraz Ali')).toBeVisible();
  141 |       await expect(page.getByText('CEO, Innovatech')).toBeVisible();
  142 |     });
  143 |   });
  144 | 
  145 |   test.describe('Contact Section (#contact)', () => {
  146 |     test('should display contact form with input fields and submit button', async () => {
  147 |       await page.goto(BASE_URL + '#contact');
  148 |       await page.waitForLoadState('networkidle');
  149 | 
  150 |       await expect(page.getByRole('heading', { name: 'Get In Touch' })).toBeVisible();
  151 |       await expect(page.getByRole('heading', { name: 'Send us a message' })).toBeVisible();
  152 | 
  153 |       const fullNameInput = page.getByLabel('Full Name');
  154 |       await expect(fullNameInput).toBeVisible();
  155 |       await expect(fullNameInput).toHaveAttribute('placeholder', 'John Doe');
  156 |       await expect(fullNameInput).toHaveAttribute('required', '');
  157 | 
  158 |       const emailInput = page.getByLabel('Email Address');
  159 |       await expect(emailInput).toBeVisible();
  160 |       await expect(emailInput).toHaveAttribute('placeholder', 'john@example.com');
  161 |       await expect(emailInput).toHaveAttribute('required', '');
  162 | 
  163 |       const messageTextarea = page.getByLabel('Message');
  164 |       await expect(messageTextarea).toBeVisible();
  165 |       await expect(messageTextarea).toHaveAttribute('placeholder', 'Tell us about your project...');
  166 |       await expect(messageTextarea).toHaveAttribute('required', '');
  167 | 
  168 |       await expect(page.getByRole('button', { name: 'Send Message' })).toBeVisible();
  169 |     });
  170 | 
  171 |     test('should display "Book a Call" section with a link', async () => {
  172 |       await page.goto(BASE_URL + '#contact');
```