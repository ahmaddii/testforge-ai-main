# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: run-1783772330303-y7navd/pr-1.spec.ts >> PulsarX Landing Page Functionality >> should display Book a Call section with external link
- Location: src/temp_tests/run-1783772330303-y7navd/pr-1.spec.ts:246:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Book a Call' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Book a Call' })

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
  151 |     // AI Solutions card
  152 |     await expect(page.getByRole('heading', { name: 'AI Solutions' })).toBeVisible();
  153 |     await expect(page.getByText('Integrating cutting-edge AI technologies to automate processes, gain insights')).toBeVisible();
  154 |     await expect(page.getByText('Machine Learning')).toBeVisible();
  155 |     await expect(page.getByText('Automation')).toBeVisible();
  156 |     await expect(page.getByText('Data Analysis')).toBeVisible();
  157 | 
  158 |     // Consultancy card
  159 |     await expect(page.getByRole('heading', { name: 'Consultancy' })).toBeVisible();
  160 |     await expect(page.getByText('Providing expert advice and guidance to help you navigate the complex digital landscape')).toBeVisible();
  161 |     await expect(page.getByText('Expert Advice')).toBeVisible();
  162 |     await expect(page.getByText('Strategy')).toBeVisible();
  163 |     await expect(page.getByText('Best Practices')).toBeVisible();
  164 | 
  165 |     // Verify 'Learn More' buttons are present for services
  166 |     const learnMoreButtons = page.locator('.jsx-52a1e3b25473c0c8 button:has-text("Learn More")');
  167 |     await expect(learnMoreButtons).toHaveCount(6);
  168 | 
  169 |     await expect(page.getByRole('button', { name: 'Get in Touch' })).toBeVisible();
  170 |   });
  171 | 
  172 |   test('should display project cards with details in Projects section', async () => {
  173 |     // Navigate to Projects section using the desktop navigation link
  174 |     await page.getByRole('navigation').getByRole('link', { name: 'Projects', exact: true }).click();
  175 |     await page.waitForLoadState('networkidle');
  176 | 
  177 |     // Nebula Dashboard
  178 |     await expect(page.getByRole('heading', { name: 'Nebula Dashboard' })).toBeVisible();
  179 |     await expect(page.getByText('A high-performance analytics dashboard for visualizing complex datasets in real-time.')).toBeVisible();
  180 |     await expect(page.getByText('React')).toBeVisible();
  181 |     await expect(page.getByText('Next.js')).toBeVisible();
  182 |     await expect(page.getByText('Tailwind')).toBeVisible();
  183 |     await expect(page.getByText('Recharts')).toBeVisible();
  184 |     await expect(page.getByRole('link', { name: 'View Case Study' }).first()).toBeVisible();
  185 | 
  186 |     // Quantum Commerce
  187 |     await expect(page.getByRole('heading', { name: 'Quantum Commerce' })).toBeVisible();
  188 |     await expect(page.getByText('Next-generation e-commerce platform with AI-driven product recommendations')).toBeVisible();
  189 |     await expect(page.getByText('TypeScript')).toBeVisible();
  190 |     await expect(page.getByText('Node.js')).toBeVisible();
  191 |     await expect(page.getByText('GraphQL')).toBeVisible();
  192 |     await expect(page.getByText('Stripe')).toBeVisible();
  193 | 
  194 |     // Cyber Sentinel
  195 |     await expect(page.getByRole('heading', { name: 'Cyber Sentinel' })).toBeVisible();
  196 |     await expect(page.getByText('AI-powered cybersecurity threat detection system.')).toBeVisible();
  197 |     await expect(page.getByText('Python')).toBeVisible();
  198 |     await expect(page.getByText('TensorFlow')).toBeVisible();
  199 |     await expect(page.getByText('FastAPI')).toBeVisible();
  200 |     await expect(page.getByText('Docker')).toBeVisible();
  201 |   });
  202 | 
  203 |   test('should display testimonials in the testimonials section', async () => {
  204 |     // Navigate to Testimonials section using the desktop navigation link
  205 |     await page.getByRole('navigation').getByRole('link', { name: 'Testimonials', exact: true }).click();
  206 |     await page.waitForLoadState('networkidle');
  207 | 
  208 |     await expect(page.getByRole('heading', { name: 'Trusted by Visionaries' })).toBeVisible();
  209 |     // Check for specific testimonial text and author
  210 |     await expect(page.getByText('“PulsarX transformed our online presence. Their team is professional, creative, and delivered beyond our expectations!”')).toBeVisible();
  211 |     await expect(page.getByText('Faraz Ali')).toBeVisible();
  212 |     await expect(page.getByText('CEO, Innovatech')).toBeVisible();
  213 | 
  214 |     // Since it's a marquee, check for other testimonials to ensure content is loaded.
  215 |     await expect(page.getByText('“The app they developed for us is fantastic. User-friendly, robust, and has significantly improved our customer engagement.”')).toBeVisible();
  216 |     await expect(page.getByText('John Smith')).toBeVisible();
  217 |   });
  218 | 
  219 |   test('should display contact form fields and submission button', async () => {
  220 |     // Navigate to Contact section using the desktop navigation link
  221 |     await page.getByRole('navigation').getByRole('link', { name: 'Contact', exact: true }).click();
  222 |     await page.waitForLoadState('networkidle');
  223 | 
  224 |     await expect(page.getByRole('heading', { name: 'Send us a message' })).toBeVisible();
  225 |     const nameInput = page.getByLabel('Full Name');
  226 |     const emailInput = page.getByLabel('Email Address');
  227 |     const messageTextarea = page.getByLabel('Message');
  228 |     const sendMessageButton = page.getByRole('button', { name: 'Send Message' });
  229 | 
  230 |     await expect(nameInput).toBeVisible();
  231 |     await expect(nameInput).toHaveAttribute('placeholder', 'John Doe');
  232 |     await expect(nameInput).toHaveAttribute('required', '');
  233 | 
  234 |     await expect(emailInput).toBeVisible();
  235 |     await expect(emailInput).toHaveAttribute('placeholder', 'john@example.com');
  236 |     await expect(emailInput).toHaveAttribute('required', '');
  237 |     await expect(emailInput).toHaveAttribute('type', 'email');
  238 | 
  239 |     await expect(messageTextarea).toBeVisible();
  240 |     await expect(messageTextarea).toHaveAttribute('placeholder', 'Tell us about your project...');
  241 |     await expect(messageTextarea).toHaveAttribute('required', '');
  242 | 
  243 |     await expect(sendMessageButton).toBeVisible();
  244 |   });
  245 | 
  246 |   test('should display Book a Call section with external link', async () => {
  247 |     // Navigate to Contact section using the desktop navigation link
  248 |     await page.getByRole('navigation').getByRole('link', { name: 'Contact', exact: true }).click();
  249 |     await page.waitForLoadState('networkidle');
  250 | 
> 251 |     await expect(page.getByRole('heading', { name: 'Book a Call' })).toBeVisible();
      |                                                                      ^ Error: expect(locator).toBeVisible() failed
  252 |     await expect(page.getByText('Prefer to talk directly? Schedule a free 15-minute consultation with our experts.')).toBeVisible();
  253 |     const scheduleMeetingButton = page.getByRole('link', { name: 'Schedule Meeting' });
  254 |     await expect(scheduleMeetingButton).toBeVisible();
  255 |     await expect(scheduleMeetingButton).toHaveAttribute('href', 'https://calendly.com/');
  256 |     await expect(scheduleMeetingButton).toHaveAttribute('target', '_blank');
  257 |   });
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
```