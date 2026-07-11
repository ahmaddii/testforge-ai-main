# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: run-1783772330303-y7navd/pr-1.spec.ts >> PulsarX Landing Page Functionality >> should display services cards with titles and descriptions
- Location: src/temp_tests/run-1783772330303-y7navd/pr-1.spec.ts:118:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Analytics')
Expected: visible
Error: strict mode violation: getByText('Analytics') resolved to 2 elements:
    1) <span class="jsx-52a1e3b25473c0c8 text-muted-foreground">Analytics</span> aka getByText('Analytics', { exact: true })
    2) <p class="text-muted-foreground mb-6 flex-grow">A high-performance analytics dashboard for visual…</p> aka getByText('A high-performance analytics')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Analytics')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e2]:
    - generic [ref=e4]:
      - link "PulsarX Logo PulsarX" [ref=e6] [cursor=pointer]:
        - /url: "#home"
        - img "PulsarX Logo" [ref=e8]
        - generic [ref=e9]: PulsarX
      - generic [ref=e11]:
        - link "Home" [ref=e12] [cursor=pointer]:
          - /url: "#home"
          - generic [ref=e13]: Home
        - link "About" [ref=e14] [cursor=pointer]:
          - /url: "#about"
          - generic [ref=e16]: About
        - link "Services" [ref=e17] [cursor=pointer]:
          - /url: "#services"
          - generic [ref=e19]: Services
        - link "Projects" [ref=e20] [cursor=pointer]:
          - /url: "#projects"
          - generic [ref=e21]: Projects
        - link "Testimonials" [ref=e22] [cursor=pointer]:
          - /url: "#testimonials"
          - generic [ref=e23]: Testimonials
        - link "Contact" [ref=e24] [cursor=pointer]:
          - /url: "#contact"
          - generic [ref=e25]: Contact
      - link "Get Started" [ref=e27] [cursor=pointer]:
        - /url: mailto:pulsarx.inc@gmail.com
  - main [ref=e28]:
    - generic [ref=e30]:
      - generic [ref=e35]: Leading Software Development Agency
      - heading "Transforming Ideas into Digital Reality" [level=1] [ref=e36]:
        - text: Transforming Ideas into
        - text: Digital Reality
      - paragraph [ref=e37]: We build scalable, high-performance software solutions tailored to your business needs. From web applications to complex enterprise systems, we deliver excellence.
      - generic [ref=e38]:
        - link "Get Started" [ref=e39] [cursor=pointer]:
          - /url: mailto:pulsarx.inc@gmail.com
          - text: Get Started
          - img [ref=e40]
        - button "Contact Us" [ref=e42] [cursor=pointer]
      - generic [ref=e43]:
        - generic [ref=e44]:
          - img [ref=e46]
          - generic [ref=e49]: 100+
          - generic [ref=e50]: Projects Delivered
        - generic [ref=e51]:
          - img [ref=e53]
          - generic [ref=e56]: 50+
          - generic [ref=e57]: Global Clients
        - generic [ref=e58]:
          - img [ref=e60]
          - generic [ref=e62]: 99.9%
          - generic [ref=e63]: Uptime Guarantee
        - generic [ref=e64]:
          - img [ref=e66]
          - generic [ref=e67]: 2x
          - generic [ref=e68]: ROI Average
    - generic [ref=e70]:
      - generic [ref=e71]:
        - generic [ref=e72]:
          - img [ref=e73]
          - generic [ref=e75]: About Us
        - heading "Discover PulsarX" [level=2] [ref=e76]
        - paragraph [ref=e77]: Where innovation meets excellence. We're on a mission to illuminate the digital universe with transformative solutions.
      - generic [ref=e78]:
        - generic [ref=e81]:
          - img "PulsarX Team" [ref=e83]
          - generic [ref=e87]: Building the Future
        - generic [ref=e90]:
          - generic [ref=e91]:
            - heading "Our Story" [level=3] [ref=e92]: Our Story
            - paragraph [ref=e94]: Founded with a passion for innovation and a commitment to excellence, PulsarX has grown from a small idea into a dynamic force in the digital landscape. We believe in the power of technology to transform businesses and create meaningful impact that resonates across industries.
          - generic [ref=e95]:
            - generic [ref=e98]:
              - img [ref=e100]
              - generic [ref=e104]:
                - heading "Our Mission" [level=4] [ref=e105]:
                  - text: Our Mission
                  - img [ref=e106]
                - paragraph [ref=e109]: To empower businesses with cutting-edge digital solutions that drive growth, efficiency, and success in an ever-evolving world.
            - generic [ref=e112]:
              - img [ref=e114]
              - generic [ref=e117]:
                - heading "Our Vision" [level=4] [ref=e118]:
                  - text: Our Vision
                  - img [ref=e119]
                - paragraph [ref=e122]: To be a leading digital partner, recognized for our creativity, technical expertise, and unwavering dedication to client satisfaction.
          - link "Learn More About Us" [ref=e124] [cursor=pointer]:
            - /url: https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/
            - generic [ref=e125]:
              - text: Learn More About Us
              - img [ref=e126]
      - generic [ref=e130]:
        - generic [ref=e131] [cursor=pointer]:
          - img [ref=e135]
          - generic [ref=e140]: 500+
          - generic [ref=e141]: Happy Clients
        - generic [ref=e143] [cursor=pointer]:
          - img [ref=e147]
          - generic [ref=e150]: 1000+
          - generic [ref=e151]: Projects Completed
        - generic [ref=e153] [cursor=pointer]:
          - img [ref=e157]
          - generic [ref=e160]: 98%
          - generic [ref=e161]: Success Rate
        - generic [ref=e163] [cursor=pointer]:
          - img [ref=e167]
          - generic [ref=e169]: 5+
          - generic [ref=e170]: Years Experience
    - generic [ref=e173]:
      - generic [ref=e174]:
        - generic [ref=e175]:
          - img [ref=e176]
          - generic [ref=e178]: What We Offer
        - heading "Our Services" [level=2] [ref=e179]
        - paragraph [ref=e180]: We offer a wide range of digital solutions to help your business thrive in the modern digital landscape.
      - generic [ref=e181]:
        - generic [ref=e184]:
          - img [ref=e187]
          - generic [ref=e190]:
            - img [ref=e192]
            - generic [ref=e195]:
              - heading "Web Development" [level=3] [ref=e196]
              - paragraph [ref=e197]: Crafting responsive, high-performance websites tailored to your business needs using the latest technologies.
              - generic [ref=e198]:
                - generic [ref=e199]:
                  - img [ref=e200]
                  - generic [ref=e203]: Responsive Design
                - generic [ref=e204]:
                  - img [ref=e205]
                  - generic [ref=e208]: Fast Performance
                - generic [ref=e209]:
                  - img [ref=e210]
                  - generic [ref=e213]: SEO Optimized
              - button "Learn More" [ref=e215] [cursor=pointer]:
                - text: Learn More
                - img [ref=e216]
        - generic [ref=e220]:
          - img [ref=e223]
          - generic [ref=e228]:
            - img [ref=e230]
            - generic [ref=e235]:
              - heading "App Development" [level=3] [ref=e236]
              - paragraph [ref=e237]: Building intuitive and scalable mobile applications for iOS and Android platforms that engage your users.
              - generic [ref=e238]:
                - generic [ref=e239]:
                  - img [ref=e240]
                  - generic [ref=e243]: iOS & Android
                - generic [ref=e244]:
                  - img [ref=e245]
                  - generic [ref=e248]: Cross-Platform
                - generic [ref=e249]:
                  - img [ref=e250]
                  - generic [ref=e253]: Native Feel
              - button "Learn More" [ref=e255] [cursor=pointer]:
                - text: Learn More
                - img [ref=e256]
        - generic [ref=e260]:
          - img [ref=e263]
          - generic [ref=e269]:
            - img [ref=e271]
            - generic [ref=e277]:
              - heading "UI/UX Design" [level=3] [ref=e278]
              - paragraph [ref=e279]: Creating visually stunning and user-friendly interfaces that enhance user experience and brand identity.
              - generic [ref=e280]:
                - generic [ref=e281]:
                  - img [ref=e282]
                  - generic [ref=e285]: Modern Design
                - generic [ref=e286]:
                  - img [ref=e287]
                  - generic [ref=e290]: User Research
                - generic [ref=e291]:
                  - img [ref=e292]
                  - generic [ref=e295]: Prototyping
              - button "Learn More" [ref=e297] [cursor=pointer]:
                - text: Learn More
                - img [ref=e298]
        - generic [ref=e302]:
          - img [ref=e305]
          - generic [ref=e307]:
            - img [ref=e309]
            - generic [ref=e311]:
              - heading "Digital Strategy" [level=3] [ref=e312]
              - paragraph [ref=e313]: Developing comprehensive digital strategies to optimize your online presence and achieve your business goals.
              - generic [ref=e314]:
                - generic [ref=e315]:
                  - img [ref=e316]
                  - generic [ref=e319]: Growth Planning
                - generic [ref=e320]:
                  - img [ref=e321]
                  - generic [ref=e324]: Analytics
                - generic [ref=e325]:
                  - img [ref=e326]
                  - generic [ref=e329]: ROI Focused
              - button "Learn More" [ref=e331] [cursor=pointer]:
                - text: Learn More
                - img [ref=e332]
        - generic [ref=e336]:
          - img [ref=e339]
          - generic [ref=e349]:
            - img [ref=e351]
            - generic [ref=e361]:
              - heading "AI Solutions" [level=3] [ref=e362]
              - paragraph [ref=e363]: Integrating cutting-edge AI technologies to automate processes, gain insights, and drive innovation.
              - generic [ref=e364]:
                - generic [ref=e365]:
                  - img [ref=e366]
                  - generic [ref=e369]: Machine Learning
                - generic [ref=e370]:
                  - img [ref=e371]
                  - generic [ref=e374]: Automation
                - generic [ref=e375]:
                  - img [ref=e376]
                  - generic [ref=e379]: Data Analysis
              - button "Learn More" [ref=e381] [cursor=pointer]:
                - text: Learn More
                - img [ref=e382]
        - generic [ref=e386]:
          - img [ref=e389]
          - generic [ref=e394]:
            - img [ref=e396]
            - generic [ref=e401]:
              - heading "Consultancy" [level=3] [ref=e402]
              - paragraph [ref=e403]: Providing expert advice and guidance to help you navigate the complex digital landscape and make informed decisions.
              - generic [ref=e404]:
                - generic [ref=e405]:
                  - img [ref=e406]
                  - generic [ref=e409]: Expert Advice
                - generic [ref=e410]:
                  - img [ref=e411]
                  - generic [ref=e414]: Strategy
                - generic [ref=e415]:
                  - img [ref=e416]
                  - generic [ref=e419]: Best Practices
              - button "Learn More" [ref=e421] [cursor=pointer]:
                - text: Learn More
                - img [ref=e422]
      - generic [ref=e424]:
        - paragraph [ref=e425]: Need a custom solution? We're here to help.
        - button "Get in Touch" [ref=e426] [cursor=pointer]:
          - generic [ref=e427]:
            - text: Get in Touch
            - img [ref=e428]
    - generic [ref=e432]:
      - generic [ref=e433]:
        - heading "Featured Masterpieces" [level=2] [ref=e434]
        - paragraph [ref=e435]: Explore a selection of our most impactful projects, where innovation meets execution.
      - generic [ref=e436]:
        - generic [ref=e439]:
          - img [ref=e443]
          - heading "Nebula Dashboard" [level=3] [ref=e447]
          - paragraph [ref=e448]: A high-performance analytics dashboard for visualizing complex datasets in real-time. Features dark mode and customizable widgets.
          - generic [ref=e449]:
            - generic [ref=e450]: React
            - generic [ref=e451]: Next.js
            - generic [ref=e452]: Tailwind
            - generic [ref=e453]: Recharts
          - link "View Case Study" [ref=e454] [cursor=pointer]:
            - /url: "#"
            - text: View Case Study
            - img [ref=e455]
        - generic [ref=e460]:
          - img [ref=e464]
          - heading "Quantum Commerce" [level=3] [ref=e467]
          - paragraph [ref=e468]: Next-generation e-commerce platform with AI-driven product recommendations and sub-second page loads.
          - generic [ref=e469]:
            - generic [ref=e470]: TypeScript
            - generic [ref=e471]: Node.js
            - generic [ref=e472]: GraphQL
            - generic [ref=e473]: Stripe
          - link "View Case Study" [ref=e474] [cursor=pointer]:
            - /url: "#"
            - text: View Case Study
            - img [ref=e475]
        - generic [ref=e480]:
          - img [ref=e484]
          - heading "Cyber Sentinel" [level=3] [ref=e487]
          - paragraph [ref=e488]: AI-powered cybersecurity threat detection system. Monitors network traffic and identifies anomalies instantly.
          - generic [ref=e489]:
            - generic [ref=e490]: Python
            - generic [ref=e491]: TensorFlow
            - generic [ref=e492]: FastAPI
            - generic [ref=e493]: Docker
          - link "View Case Study" [ref=e494] [cursor=pointer]:
            - /url: "#"
            - text: View Case Study
            - img [ref=e495]
    - generic [ref=e499]:
      - generic [ref=e500]:
        - generic [ref=e501]:
          - img [ref=e502]
          - generic [ref=e505]: Wall of Love
        - heading "Trusted by Visionaries" [level=2] [ref=e506]
        - paragraph [ref=e507]: Don't just take our word for it. Here's what the founders and leaders we work with have to say.
      - generic [ref=e508]:
        - generic [ref=e509]:
          - generic [ref=e511]:
            - generic [ref=e513]:
              - img [ref=e514]
              - img [ref=e516]
              - img [ref=e518]
              - img [ref=e520]
              - img [ref=e522]
            - paragraph [ref=e525]: “PulsarX transformed our online presence. Their team is professional, creative, and delivered beyond our expectations!”
            - generic [ref=e527]:
              - img "Faraz Ali" [ref=e528]
              - generic [ref=e529]:
                - paragraph [ref=e530]: Faraz Ali
                - paragraph [ref=e531]: CEO, Innovatech
          - generic [ref=e533]:
            - generic [ref=e535]:
              - img [ref=e536]
              - img [ref=e538]
              - img [ref=e540]
              - img [ref=e542]
              - img [ref=e544]
            - paragraph [ref=e547]: “The app they developed for us is fantastic. User-friendly, robust, and has significantly improved our customer engagement.”
            - generic [ref=e549]:
              - img "John Smith" [ref=e550]
              - generic [ref=e551]:
                - paragraph [ref=e552]: John Smith
                - paragraph [ref=e553]: Marketing Director, BizSolutions
          - generic [ref=e555]:
            - generic [ref=e557]:
              - img [ref=e558]
              - img [ref=e560]
              - img [ref=e562]
              - img [ref=e564]
              - img [ref=e566]
            - paragraph [ref=e569]: “Exceptional UI/UX design work. PulsarX understood our brand perfectly and created a stunning interface.”
            - generic [ref=e571]:
              - img "Alice Brown" [ref=e572]
              - generic [ref=e573]:
                - paragraph [ref=e574]: Alice Brown
                - paragraph [ref=e575]: Founder, Creative Co.
          - generic [ref=e577]:
            - generic [ref=e579]:
              - img [ref=e580]
              - img [ref=e582]
              - img [ref=e584]
              - img [ref=e586]
              - img [ref=e588]
            - paragraph [ref=e591]: “Working with PulsarX was a game-changer. They brought our vision to life with incredible attention to detail.”
            - generic [ref=e593]:
              - img "Michael Chen" [ref=e594]
              - generic [ref=e595]:
                - paragraph [ref=e596]: Michael Chen
                - paragraph [ref=e597]: CTO, FutureScale
          - generic [ref=e599]:
            - generic [ref=e601]:
              - img [ref=e602]
              - img [ref=e604]
              - img [ref=e606]
              - img [ref=e608]
              - img [ref=e610]
            - paragraph [ref=e613]: “Their development speed and code quality are unmatched. Highly recommended for any serious startup.”
            - generic [ref=e615]:
              - img "Sarah Johnson" [ref=e616]
              - generic [ref=e617]:
                - paragraph [ref=e618]: Sarah Johnson
                - paragraph [ref=e619]: Product Lead, TechFlow
          - generic [ref=e621]:
            - generic [ref=e623]:
              - img [ref=e624]
              - img [ref=e626]
              - img [ref=e628]
              - img [ref=e630]
              - img [ref=e632]
            - paragraph [ref=e635]: “A truly partner-centric approach. They didn't just build software; they helped us build a business.”
            - generic [ref=e637]:
              - img "David Wilson" [ref=e638]
              - generic [ref=e639]:
                - paragraph [ref=e640]: David Wilson
                - paragraph [ref=e641]: Founder, StartUp Hub
          - generic [ref=e643]:
            - generic [ref=e645]:
              - img [ref=e646]
              - img [ref=e648]
              - img [ref=e650]
              - img [ref=e652]
              - img [ref=e654]
            - paragraph [ref=e657]: “PulsarX transformed our online presence. Their team is professional, creative, and delivered beyond our expectations!”
            - generic [ref=e659]:
              - img "Faraz Ali" [ref=e660]
              - generic [ref=e661]:
                - paragraph [ref=e662]: Faraz Ali
                - paragraph [ref=e663]: CEO, Innovatech
          - generic [ref=e665]:
            - generic [ref=e667]:
              - img [ref=e668]
              - img [ref=e670]
              - img [ref=e672]
              - img [ref=e674]
              - img [ref=e676]
            - paragraph [ref=e679]: “The app they developed for us is fantastic. User-friendly, robust, and has significantly improved our customer engagement.”
            - generic [ref=e681]:
              - img "John Smith" [ref=e682]
              - generic [ref=e683]:
                - paragraph [ref=e684]: John Smith
                - paragraph [ref=e685]: Marketing Director, BizSolutions
          - generic [ref=e687]:
            - generic [ref=e689]:
              - img [ref=e690]
              - img [ref=e692]
              - img [ref=e694]
              - img [ref=e696]
              - img [ref=e698]
            - paragraph [ref=e701]: “Exceptional UI/UX design work. PulsarX understood our brand perfectly and created a stunning interface.”
            - generic [ref=e703]:
              - img "Alice Brown" [ref=e704]
              - generic [ref=e705]:
                - paragraph [ref=e706]: Alice Brown
                - paragraph [ref=e707]: Founder, Creative Co.
          - generic [ref=e709]:
            - generic [ref=e711]:
              - img [ref=e712]
              - img [ref=e714]
              - img [ref=e716]
              - img [ref=e718]
              - img [ref=e720]
            - paragraph [ref=e723]: “Working with PulsarX was a game-changer. They brought our vision to life with incredible attention to detail.”
            - generic [ref=e725]:
              - img "Michael Chen" [ref=e726]
              - generic [ref=e727]:
                - paragraph [ref=e728]: Michael Chen
                - paragraph [ref=e729]: CTO, FutureScale
          - generic [ref=e731]:
            - generic [ref=e733]:
              - img [ref=e734]
              - img [ref=e736]
              - img [ref=e738]
              - img [ref=e740]
              - img [ref=e742]
            - paragraph [ref=e745]: “Their development speed and code quality are unmatched. Highly recommended for any serious startup.”
            - generic [ref=e747]:
              - img "Sarah Johnson" [ref=e748]
              - generic [ref=e749]:
                - paragraph [ref=e750]: Sarah Johnson
                - paragraph [ref=e751]: Product Lead, TechFlow
          - generic [ref=e753]:
            - generic [ref=e755]:
              - img [ref=e756]
              - img [ref=e758]
              - img [ref=e760]
              - img [ref=e762]
              - img [ref=e764]
            - paragraph [ref=e767]: “A truly partner-centric approach. They didn't just build software; they helped us build a business.”
            - generic [ref=e769]:
              - img "David Wilson" [ref=e770]
              - generic [ref=e771]:
                - paragraph [ref=e772]: David Wilson
                - paragraph [ref=e773]: Founder, StartUp Hub
        - generic [ref=e774]:
          - generic [ref=e776]:
            - generic [ref=e778]:
              - img [ref=e779]
              - img [ref=e781]
              - img [ref=e783]
              - img [ref=e785]
              - img [ref=e787]
            - paragraph [ref=e790]: “PulsarX transformed our online presence. Their team is professional, creative, and delivered beyond our expectations!”
            - generic [ref=e792]:
              - img "Faraz Ali" [ref=e793]
              - generic [ref=e794]:
                - paragraph [ref=e795]: Faraz Ali
                - paragraph [ref=e796]: CEO, Innovatech
          - generic [ref=e798]:
            - generic [ref=e800]:
              - img [ref=e801]
              - img [ref=e803]
              - img [ref=e805]
              - img [ref=e807]
              - img [ref=e809]
            - paragraph [ref=e812]: “The app they developed for us is fantastic. User-friendly, robust, and has significantly improved our customer engagement.”
            - generic [ref=e814]:
              - img "John Smith" [ref=e815]
              - generic [ref=e816]:
                - paragraph [ref=e817]: John Smith
                - paragraph [ref=e818]: Marketing Director, BizSolutions
          - generic [ref=e820]:
            - generic [ref=e822]:
              - img [ref=e823]
              - img [ref=e825]
              - img [ref=e827]
              - img [ref=e829]
              - img [ref=e831]
            - paragraph [ref=e834]: “Exceptional UI/UX design work. PulsarX understood our brand perfectly and created a stunning interface.”
            - generic [ref=e836]:
              - img "Alice Brown" [ref=e837]
              - generic [ref=e838]:
                - paragraph [ref=e839]: Alice Brown
                - paragraph [ref=e840]: Founder, Creative Co.
          - generic [ref=e842]:
            - generic [ref=e844]:
              - img [ref=e845]
              - img [ref=e847]
              - img [ref=e849]
              - img [ref=e851]
              - img [ref=e853]
            - paragraph [ref=e856]: “Working with PulsarX was a game-changer. They brought our vision to life with incredible attention to detail.”
            - generic [ref=e858]:
              - img "Michael Chen" [ref=e859]
              - generic [ref=e860]:
                - paragraph [ref=e861]: Michael Chen
                - paragraph [ref=e862]: CTO, FutureScale
          - generic [ref=e864]:
            - generic [ref=e866]:
              - img [ref=e867]
              - img [ref=e869]
              - img [ref=e871]
              - img [ref=e873]
              - img [ref=e875]
            - paragraph [ref=e878]: “Their development speed and code quality are unmatched. Highly recommended for any serious startup.”
            - generic [ref=e880]:
              - img "Sarah Johnson" [ref=e881]
              - generic [ref=e882]:
                - paragraph [ref=e883]: Sarah Johnson
                - paragraph [ref=e884]: Product Lead, TechFlow
          - generic [ref=e886]:
            - generic [ref=e888]:
              - img [ref=e889]
              - img [ref=e891]
              - img [ref=e893]
              - img [ref=e895]
              - img [ref=e897]
            - paragraph [ref=e900]: “A truly partner-centric approach. They didn't just build software; they helped us build a business.”
            - generic [ref=e902]:
              - img "David Wilson" [ref=e903]
              - generic [ref=e904]:
                - paragraph [ref=e905]: David Wilson
                - paragraph [ref=e906]: Founder, StartUp Hub
          - generic [ref=e908]:
            - generic [ref=e910]:
              - img [ref=e911]
              - img [ref=e913]
              - img [ref=e915]
              - img [ref=e917]
              - img [ref=e919]
            - paragraph [ref=e922]: “PulsarX transformed our online presence. Their team is professional, creative, and delivered beyond our expectations!”
            - generic [ref=e924]:
              - img "Faraz Ali" [ref=e925]
              - generic [ref=e926]:
                - paragraph [ref=e927]: Faraz Ali
                - paragraph [ref=e928]: CEO, Innovatech
          - generic [ref=e930]:
            - generic [ref=e932]:
              - img [ref=e933]
              - img [ref=e935]
              - img [ref=e937]
              - img [ref=e939]
              - img [ref=e941]
            - paragraph [ref=e944]: “The app they developed for us is fantastic. User-friendly, robust, and has significantly improved our customer engagement.”
            - generic [ref=e946]:
              - img "John Smith" [ref=e947]
              - generic [ref=e948]:
                - paragraph [ref=e949]: John Smith
                - paragraph [ref=e950]: Marketing Director, BizSolutions
          - generic [ref=e952]:
            - generic [ref=e954]:
              - img [ref=e955]
              - img [ref=e957]
              - img [ref=e959]
              - img [ref=e961]
              - img [ref=e963]
            - paragraph [ref=e966]: “Exceptional UI/UX design work. PulsarX understood our brand perfectly and created a stunning interface.”
            - generic [ref=e968]:
              - img "Alice Brown" [ref=e969]
              - generic [ref=e970]:
                - paragraph [ref=e971]: Alice Brown
                - paragraph [ref=e972]: Founder, Creative Co.
          - generic [ref=e974]:
            - generic [ref=e976]:
              - img [ref=e977]
              - img [ref=e979]
              - img [ref=e981]
              - img [ref=e983]
              - img [ref=e985]
            - paragraph [ref=e988]: “Working with PulsarX was a game-changer. They brought our vision to life with incredible attention to detail.”
            - generic [ref=e990]:
              - img "Michael Chen" [ref=e991]
              - generic [ref=e992]:
                - paragraph [ref=e993]: Michael Chen
                - paragraph [ref=e994]: CTO, FutureScale
          - generic [ref=e996]:
            - generic [ref=e998]:
              - img [ref=e999]
              - img [ref=e1001]
              - img [ref=e1003]
              - img [ref=e1005]
              - img [ref=e1007]
            - paragraph [ref=e1010]: “Their development speed and code quality are unmatched. Highly recommended for any serious startup.”
            - generic [ref=e1012]:
              - img "Sarah Johnson" [ref=e1013]
              - generic [ref=e1014]:
                - paragraph [ref=e1015]: Sarah Johnson
                - paragraph [ref=e1016]: Product Lead, TechFlow
          - generic [ref=e1018]:
            - generic [ref=e1020]:
              - img [ref=e1021]
              - img [ref=e1023]
              - img [ref=e1025]
              - img [ref=e1027]
              - img [ref=e1029]
            - paragraph [ref=e1032]: “A truly partner-centric approach. They didn't just build software; they helped us build a business.”
            - generic [ref=e1034]:
              - img "David Wilson" [ref=e1035]
              - generic [ref=e1036]:
                - paragraph [ref=e1037]: David Wilson
                - paragraph [ref=e1038]: Founder, StartUp Hub
    - generic [ref=e1040]:
      - generic [ref=e1041]:
        - generic [ref=e1042]:
          - img [ref=e1043]
          - generic [ref=e1045]: Contact Us
        - heading "Get In Touch" [level=2] [ref=e1046]
        - paragraph [ref=e1047]: Have a project in mind or just want to say hi? We'd love to hear from you and discuss how we can help bring your vision to life.
      - generic [ref=e1048]:
        - generic [ref=e1049]:
          - generic [ref=e1050]:
            - generic [ref=e1052]:
              - generic [ref=e1055]: Send us a message
              - paragraph [ref=e1056]: Fill out the form below and we'll get back to you shortly.
            - generic [ref=e1058]:
              - generic [ref=e1059]:
                - generic [ref=e1060]:
                  - generic [ref=e1061]:
                    - text: Full Name
                    - generic [ref=e1062]: "*"
                  - textbox "Full Name *" [ref=e1063]:
                    - /placeholder: John Doe
                - generic [ref=e1064]:
                  - generic [ref=e1065]:
                    - text: Email Address
                    - generic [ref=e1066]: "*"
                  - textbox "Email Address *" [ref=e1067]:
                    - /placeholder: john@example.com
              - generic [ref=e1068]:
                - generic [ref=e1069]:
                  - text: Message
                  - generic [ref=e1070]: "*"
                - textbox "Message *" [ref=e1071]:
                  - /placeholder: Tell us about your project...
              - button "Send Message" [ref=e1072] [cursor=pointer]:
                - generic [ref=e1073]:
                  - text: Send Message
                  - img
          - generic [ref=e1074]:
            - generic [ref=e1076]: Book a Call
            - generic [ref=e1078]:
              - paragraph [ref=e1080]: Prefer to talk directly? Schedule a free 15-minute consultation with our experts.
              - link "Schedule Meeting" [ref=e1081] [cursor=pointer]:
                - /url: https://calendly.com/
                - img [ref=e1082]
                - text: Schedule Meeting
        - generic [ref=e1085]:
          - generic [ref=e1086]:
            - generic [ref=e1088]: Contact Info
            - generic [ref=e1090]:
              - link "Email pulsarx.inc@gmail.com" [ref=e1091] [cursor=pointer]:
                - /url: mailto:pulsarx.inc@gmail.com
                - img [ref=e1093]
                - generic [ref=e1096]:
                  - paragraph [ref=e1097]: Email
                  - paragraph [ref=e1098]: pulsarx.inc@gmail.com
              - link "Phone +92 304 7058585" [ref=e1099] [cursor=pointer]:
                - /url: tel:+923047058585
                - img [ref=e1101]
                - generic [ref=e1103]:
                  - paragraph [ref=e1104]: Phone
                  - paragraph [ref=e1105]: +92 304 7058585
              - link "Address Street 55 I8/3 Islamabad, Pakistan, WEB 40404" [ref=e1106] [cursor=pointer]:
                - /url: "#"
                - img [ref=e1108]
                - generic [ref=e1111]:
                  - paragraph [ref=e1112]: Address
                  - paragraph [ref=e1113]: Street 55 I8/3 Islamabad, Pakistan, WEB 40404
          - generic [ref=e1114]:
            - generic [ref=e1116]: Quick Info
            - generic [ref=e1118]:
              - generic [ref=e1119]:
                - img [ref=e1120]
                - generic [ref=e1123]:
                  - paragraph [ref=e1124]: Response Time
                  - paragraph [ref=e1125]: < 24 hours
              - generic [ref=e1126]:
                - img [ref=e1127]
                - generic [ref=e1130]:
                  - paragraph [ref=e1131]: Timezone
                  - paragraph [ref=e1132]: PKT (UTC+5)
              - generic [ref=e1133]:
                - img [ref=e1134]
                - generic [ref=e1136]:
                  - paragraph [ref=e1137]: Languages
                  - paragraph [ref=e1138]: English, Urdu
          - generic [ref=e1139]:
            - generic [ref=e1141]: Follow Us
            - generic [ref=e1144]:
              - link "LinkedIn" [ref=e1145] [cursor=pointer]:
                - /url: https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/
                - img [ref=e1147]
              - link "Twitter" [ref=e1151] [cursor=pointer]:
                - /url: https://x.com/
                - img [ref=e1153]
              - link "GitHub" [ref=e1155] [cursor=pointer]:
                - /url: https://github.com/ahmaddii
                - img [ref=e1157]
  - contentinfo [ref=e1160]:
    - generic [ref=e1161]:
      - generic [ref=e1162]:
        - generic [ref=e1163]:
          - link "PulsarX Logo PulsarX" [ref=e1164] [cursor=pointer]:
            - /url: "#home"
            - img "PulsarX Logo" [ref=e1167]
            - generic [ref=e1168]: PulsarX
          - paragraph [ref=e1169]: Illuminating the digital universe with innovative solutions. We transform visions into reality through cutting-edge technology and creative excellence.
          - generic [ref=e1170]:
            - img [ref=e1171]
            - generic [ref=e1173]: Crafting digital excellence since 2024
        - generic [ref=e1174]:
          - heading "Quick Links" [level=3] [ref=e1175]: Quick Links
          - list [ref=e1177]:
            - listitem [ref=e1178]:
              - link "Home" [ref=e1179] [cursor=pointer]:
                - /url: "#home"
                - text: Home
            - listitem [ref=e1180]:
              - link "About Us" [ref=e1181] [cursor=pointer]:
                - /url: "#about"
                - text: About Us
            - listitem [ref=e1182]:
              - link "Services" [ref=e1183] [cursor=pointer]:
                - /url: "#services"
                - text: Services
            - listitem [ref=e1184]:
              - link "Portfolio" [ref=e1185] [cursor=pointer]:
                - /url: "#portfolio"
                - text: Portfolio
            - listitem [ref=e1186]:
              - link "Contact" [ref=e1187] [cursor=pointer]:
                - /url: "#contact"
                - text: Contact
        - generic [ref=e1188]:
          - heading "Services" [level=3] [ref=e1189]: Services
          - list [ref=e1191]:
            - listitem [ref=e1192]:
              - link "Web Development" [ref=e1193] [cursor=pointer]:
                - /url: "#web-dev"
                - text: Web Development
            - listitem [ref=e1194]:
              - link "App Development" [ref=e1195] [cursor=pointer]:
                - /url: "#app-dev"
                - text: App Development
            - listitem [ref=e1196]:
              - link "UI/UX Design" [ref=e1197] [cursor=pointer]:
                - /url: "#ui-ux"
                - text: UI/UX Design
            - listitem [ref=e1198]:
              - link "Consulting" [ref=e1199] [cursor=pointer]:
                - /url: "#consulting"
                - text: Consulting
        - generic [ref=e1200]:
          - heading "Get In Touch" [level=3] [ref=e1201]: Get In Touch
          - generic [ref=e1203]:
            - generic [ref=e1204] [cursor=pointer]:
              - img [ref=e1205]
              - generic [ref=e1208]: Islamabad, Punjab, PK
            - generic [ref=e1209] [cursor=pointer]:
              - img [ref=e1210]
              - generic [ref=e1212]: +92 304 7058585
            - generic [ref=e1213] [cursor=pointer]:
              - img [ref=e1214]
              - generic [ref=e1217]: pulsarx.inc@gmail.com
          - generic [ref=e1218]:
            - paragraph [ref=e1219]: Follow us on social media
            - generic [ref=e1220]:
              - link "LinkedIn" [ref=e1221] [cursor=pointer]:
                - /url: https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/
                - img [ref=e1223]
              - link "Twitter" [ref=e1227] [cursor=pointer]:
                - /url: https://x.com/
                - img [ref=e1229]
              - link "GitHub" [ref=e1231] [cursor=pointer]:
                - /url: https://github.com/ahmaddii
                - img [ref=e1233]
              - link "Email" [ref=e1236] [cursor=pointer]:
                - /url: mailto:contact@pulsarx.com
                - img [ref=e1238]
      - generic [ref=e1242]:
        - heading "Stay Updated" [level=3] [ref=e1243]
        - paragraph [ref=e1244]: Subscribe to our newsletter for the latest updates and insights
        - generic [ref=e1245]:
          - textbox "Enter your email" [ref=e1246]
          - button "Subscribe" [ref=e1247] [cursor=pointer]
      - generic [ref=e1248]:
        - paragraph [ref=e1249]: © 2026 PulsarX. All rights reserved to Pakistan 🇵🇰
        - generic [ref=e1250]:
          - link "Privacy Policy" [ref=e1251] [cursor=pointer]:
            - /url: https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/
          - link "Terms of Service" [ref=e1252] [cursor=pointer]:
            - /url: https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/
          - link "Cookies" [ref=e1253] [cursor=pointer]:
            - /url: https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/
    - button "Back to top" [ref=e1254] [cursor=pointer]:
      - img
  - region "Notifications (F8)":
    - list
  - alert [ref=e1255]
```

# Test source

```ts
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
  146 |     await expect(page.getByText('Developing comprehensive digital strategies to optimize your online presence')).toBeVisible();
  147 |     await expect(page.getByText('Growth Planning')).toBeVisible();
> 148 |     await expect(page.getByText('Analytics')).toBeVisible();
      |                                               ^ Error: expect(locator).toBeVisible() failed
  149 |     await expect(page.getByText('ROI Focused')).toBeVisible();
  150 | 
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
```