# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: run-1783922220766-movdki/pr-1.spec.ts >> PulsarX Landing Page Functionality >> Services Section (#services) >> should display features for "Web Development" service
- Location: src/temp_tests/run-1783922220766-movdki/pr-1.spec.ts:107:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('div').filter({ hasText: /^Web DevelopmentCrafting responsive, high-performance websites tailored to your business needs/ }).first().getByRole('button', { name: 'Learn More' })
Expected: visible
Error: strict mode violation: locator('div').filter({ hasText: /^Web DevelopmentCrafting responsive, high-performance websites tailored to your business needs/ }).first().getByRole('button', { name: 'Learn More' }) resolved to 6 elements:
    1) <button class="jsx-52a1e3b25473c0c8 group/btn inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300">…</button> aka getByRole('button', { name: 'Learn More' }).first()
    2) <button class="jsx-52a1e3b25473c0c8 group/btn inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300">…</button> aka getByRole('button', { name: 'Learn More' }).nth(1)
    3) <button class="jsx-52a1e3b25473c0c8 group/btn inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300">…</button> aka getByRole('button', { name: 'Learn More' }).nth(2)
    4) <button class="jsx-52a1e3b25473c0c8 group/btn inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300">…</button> aka getByRole('button', { name: 'Learn More' }).nth(3)
    5) <button class="jsx-52a1e3b25473c0c8 group/btn inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300">…</button> aka getByRole('button', { name: 'Learn More' }).nth(4)
    6) <button class="jsx-52a1e3b25473c0c8 group/btn inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300">…</button> aka getByRole('button', { name: 'Learn More' }).nth(5)

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('div').filter({ hasText: /^Web DevelopmentCrafting responsive, high-performance websites tailored to your business needs/ }).first().getByRole('button', { name: 'Learn More' })

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
        - link "Home" [ref=e1255] [cursor=pointer]:
          - /url: "#home"
          - generic [ref=e1256]: Home
        - link "About" [ref=e1257] [cursor=pointer]:
          - /url: "#about"
          - generic [ref=e1258]: About
        - link "Services" [ref=e1259] [cursor=pointer]:
          - /url: "#services"
          - generic [ref=e1261]: Services
        - link "Projects" [ref=e1262] [cursor=pointer]:
          - /url: "#projects"
          - generic [ref=e1263]: Projects
        - link "Testimonials" [ref=e1264] [cursor=pointer]:
          - /url: "#testimonials"
          - generic [ref=e1265]: Testimonials
        - link "Contact" [ref=e1266] [cursor=pointer]:
          - /url: "#contact"
          - generic [ref=e1267]: Contact
      - link "Get Started" [ref=e26] [cursor=pointer]:
        - /url: mailto:pulsarx.inc@gmail.com
  - main [ref=e27]:
    - generic [ref=e29]:
      - generic [ref=e34]: Leading Software Development Agency
      - heading "Transforming Ideas into Digital Reality" [level=1] [ref=e35]:
        - text: Transforming Ideas into
        - text: Digital Reality
      - paragraph [ref=e36]: We build scalable, high-performance software solutions tailored to your business needs. From web applications to complex enterprise systems, we deliver excellence.
      - generic [ref=e37]:
        - link "Get Started" [ref=e38] [cursor=pointer]:
          - /url: mailto:pulsarx.inc@gmail.com
          - text: Get Started
          - img [ref=e39]
        - button "Contact Us" [ref=e41] [cursor=pointer]
      - generic [ref=e42]:
        - generic [ref=e43]:
          - img [ref=e45]
          - generic [ref=e48]: 100+
          - generic [ref=e49]: Projects Delivered
        - generic [ref=e50]:
          - img [ref=e52]
          - generic [ref=e55]: 50+
          - generic [ref=e56]: Global Clients
        - generic [ref=e57]:
          - img [ref=e59]
          - generic [ref=e61]: 99.9%
          - generic [ref=e62]: Uptime Guarantee
        - generic [ref=e63]:
          - img [ref=e65]
          - generic [ref=e66]: 2x
          - generic [ref=e67]: ROI Average
    - generic [ref=e69]:
      - generic [ref=e70]:
        - generic [ref=e71]:
          - img [ref=e72]
          - generic [ref=e74]: About Us
        - heading "Discover PulsarX" [level=2] [ref=e75]
        - paragraph [ref=e76]: Where innovation meets excellence. We're on a mission to illuminate the digital universe with transformative solutions.
      - generic [ref=e77]:
        - generic [ref=e80]:
          - img "PulsarX Team" [ref=e82]
          - generic [ref=e86]: Building the Future
        - generic [ref=e89]:
          - generic [ref=e90]:
            - heading "Our Story" [level=3] [ref=e91]: Our Story
            - paragraph [ref=e93]: Founded with a passion for innovation and a commitment to excellence, PulsarX has grown from a small idea into a dynamic force in the digital landscape. We believe in the power of technology to transform businesses and create meaningful impact that resonates across industries.
          - generic [ref=e94]:
            - generic [ref=e97]:
              - img [ref=e99]
              - generic [ref=e103]:
                - heading "Our Mission" [level=4] [ref=e104]:
                  - text: Our Mission
                  - img [ref=e105]
                - paragraph [ref=e108]: To empower businesses with cutting-edge digital solutions that drive growth, efficiency, and success in an ever-evolving world.
            - generic [ref=e111]:
              - img [ref=e113]
              - generic [ref=e116]:
                - heading "Our Vision" [level=4] [ref=e117]:
                  - text: Our Vision
                  - img [ref=e118]
                - paragraph [ref=e121]: To be a leading digital partner, recognized for our creativity, technical expertise, and unwavering dedication to client satisfaction.
          - link "Learn More About Us" [ref=e123] [cursor=pointer]:
            - /url: https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/
            - generic [ref=e124]:
              - text: Learn More About Us
              - img [ref=e125]
      - generic [ref=e129]:
        - generic [ref=e130] [cursor=pointer]:
          - img [ref=e134]
          - generic [ref=e139]: 500+
          - generic [ref=e140]: Happy Clients
        - generic [ref=e142] [cursor=pointer]:
          - img [ref=e146]
          - generic [ref=e149]: 1000+
          - generic [ref=e150]: Projects Completed
        - generic [ref=e152] [cursor=pointer]:
          - img [ref=e156]
          - generic [ref=e159]: 98%
          - generic [ref=e160]: Success Rate
        - generic [ref=e162] [cursor=pointer]:
          - img [ref=e166]
          - generic [ref=e168]: 5+
          - generic [ref=e169]: Years Experience
    - generic [ref=e172]:
      - generic [ref=e173]:
        - generic [ref=e174]:
          - img [ref=e175]
          - generic [ref=e177]: What We Offer
        - heading "Our Services" [level=2] [ref=e178]
        - paragraph [ref=e179]: We offer a wide range of digital solutions to help your business thrive in the modern digital landscape.
      - generic [ref=e180]:
        - generic [ref=e183]:
          - img [ref=e186]
          - generic [ref=e189]:
            - img [ref=e191]
            - generic [ref=e194]:
              - heading "Web Development" [level=3] [ref=e195]
              - paragraph [ref=e196]: Crafting responsive, high-performance websites tailored to your business needs using the latest technologies.
              - generic [ref=e197]:
                - generic [ref=e198]:
                  - img [ref=e199]
                  - generic [ref=e202]: Responsive Design
                - generic [ref=e203]:
                  - img [ref=e204]
                  - generic [ref=e207]: Fast Performance
                - generic [ref=e208]:
                  - img [ref=e209]
                  - generic [ref=e212]: SEO Optimized
              - button "Learn More" [ref=e214] [cursor=pointer]:
                - text: Learn More
                - img [ref=e215]
        - generic [ref=e219]:
          - img [ref=e222]
          - generic [ref=e227]:
            - img [ref=e229]
            - generic [ref=e234]:
              - heading "App Development" [level=3] [ref=e235]
              - paragraph [ref=e236]: Building intuitive and scalable mobile applications for iOS and Android platforms that engage your users.
              - generic [ref=e237]:
                - generic [ref=e238]:
                  - img [ref=e239]
                  - generic [ref=e242]: iOS & Android
                - generic [ref=e243]:
                  - img [ref=e244]
                  - generic [ref=e247]: Cross-Platform
                - generic [ref=e248]:
                  - img [ref=e249]
                  - generic [ref=e252]: Native Feel
              - button "Learn More" [ref=e254] [cursor=pointer]:
                - text: Learn More
                - img [ref=e255]
        - generic [ref=e259]:
          - img [ref=e262]
          - generic [ref=e268]:
            - img [ref=e270]
            - generic [ref=e276]:
              - heading "UI/UX Design" [level=3] [ref=e277]
              - paragraph [ref=e278]: Creating visually stunning and user-friendly interfaces that enhance user experience and brand identity.
              - generic [ref=e279]:
                - generic [ref=e280]:
                  - img [ref=e281]
                  - generic [ref=e284]: Modern Design
                - generic [ref=e285]:
                  - img [ref=e286]
                  - generic [ref=e289]: User Research
                - generic [ref=e290]:
                  - img [ref=e291]
                  - generic [ref=e294]: Prototyping
              - button "Learn More" [ref=e296] [cursor=pointer]:
                - text: Learn More
                - img [ref=e297]
        - generic [ref=e301]:
          - img [ref=e304]
          - generic [ref=e306]:
            - img [ref=e308]
            - generic [ref=e310]:
              - heading "Digital Strategy" [level=3] [ref=e311]
              - paragraph [ref=e312]: Developing comprehensive digital strategies to optimize your online presence and achieve your business goals.
              - generic [ref=e313]:
                - generic [ref=e314]:
                  - img [ref=e315]
                  - generic [ref=e318]: Growth Planning
                - generic [ref=e319]:
                  - img [ref=e320]
                  - generic [ref=e323]: Analytics
                - generic [ref=e324]:
                  - img [ref=e325]
                  - generic [ref=e328]: ROI Focused
              - button "Learn More" [ref=e330] [cursor=pointer]:
                - text: Learn More
                - img [ref=e331]
        - generic [ref=e335]:
          - img [ref=e338]
          - generic [ref=e348]:
            - img [ref=e350]
            - generic [ref=e360]:
              - heading "AI Solutions" [level=3] [ref=e361]
              - paragraph [ref=e362]: Integrating cutting-edge AI technologies to automate processes, gain insights, and drive innovation.
              - generic [ref=e363]:
                - generic [ref=e364]:
                  - img [ref=e365]
                  - generic [ref=e368]: Machine Learning
                - generic [ref=e369]:
                  - img [ref=e370]
                  - generic [ref=e373]: Automation
                - generic [ref=e374]:
                  - img [ref=e375]
                  - generic [ref=e378]: Data Analysis
              - button "Learn More" [ref=e380] [cursor=pointer]:
                - text: Learn More
                - img [ref=e381]
        - generic [ref=e385]:
          - img [ref=e388]
          - generic [ref=e393]:
            - img [ref=e395]
            - generic [ref=e400]:
              - heading "Consultancy" [level=3] [ref=e401]
              - paragraph [ref=e402]: Providing expert advice and guidance to help you navigate the complex digital landscape and make informed decisions.
              - generic [ref=e403]:
                - generic [ref=e404]:
                  - img [ref=e405]
                  - generic [ref=e408]: Expert Advice
                - generic [ref=e409]:
                  - img [ref=e410]
                  - generic [ref=e413]: Strategy
                - generic [ref=e414]:
                  - img [ref=e415]
                  - generic [ref=e418]: Best Practices
              - button "Learn More" [ref=e420] [cursor=pointer]:
                - text: Learn More
                - img [ref=e421]
      - generic [ref=e423]:
        - paragraph [ref=e424]: Need a custom solution? We're here to help.
        - button "Get in Touch" [ref=e425] [cursor=pointer]:
          - generic [ref=e426]:
            - text: Get in Touch
            - img [ref=e427]
    - generic [ref=e431]:
      - generic [ref=e432]:
        - heading "Featured Masterpieces" [level=2] [ref=e433]
        - paragraph [ref=e434]: Explore a selection of our most impactful projects, where innovation meets execution.
      - generic [ref=e435]:
        - generic [ref=e438]:
          - img [ref=e442]
          - heading "Nebula Dashboard" [level=3] [ref=e446]
          - paragraph [ref=e447]: A high-performance analytics dashboard for visualizing complex datasets in real-time. Features dark mode and customizable widgets.
          - generic [ref=e448]:
            - generic [ref=e449]: React
            - generic [ref=e450]: Next.js
            - generic [ref=e451]: Tailwind
            - generic [ref=e452]: Recharts
          - link "View Case Study" [ref=e453] [cursor=pointer]:
            - /url: "#"
            - text: View Case Study
            - img [ref=e454]
        - generic [ref=e459]:
          - img [ref=e463]
          - heading "Quantum Commerce" [level=3] [ref=e466]
          - paragraph [ref=e467]: Next-generation e-commerce platform with AI-driven product recommendations and sub-second page loads.
          - generic [ref=e468]:
            - generic [ref=e469]: TypeScript
            - generic [ref=e470]: Node.js
            - generic [ref=e471]: GraphQL
            - generic [ref=e472]: Stripe
          - link "View Case Study" [ref=e473] [cursor=pointer]:
            - /url: "#"
            - text: View Case Study
            - img [ref=e474]
        - generic [ref=e479]:
          - img [ref=e483]
          - heading "Cyber Sentinel" [level=3] [ref=e486]
          - paragraph [ref=e487]: AI-powered cybersecurity threat detection system. Monitors network traffic and identifies anomalies instantly.
          - generic [ref=e488]:
            - generic [ref=e489]: Python
            - generic [ref=e490]: TensorFlow
            - generic [ref=e491]: FastAPI
            - generic [ref=e492]: Docker
          - link "View Case Study" [ref=e493] [cursor=pointer]:
            - /url: "#"
            - text: View Case Study
            - img [ref=e494]
    - generic [ref=e498]:
      - generic [ref=e499]:
        - generic [ref=e500]:
          - img [ref=e501]
          - generic [ref=e504]: Wall of Love
        - heading "Trusted by Visionaries" [level=2] [ref=e505]
        - paragraph [ref=e506]: Don't just take our word for it. Here's what the founders and leaders we work with have to say.
      - generic [ref=e507]:
        - generic [ref=e508]:
          - generic [ref=e510]:
            - generic [ref=e512]:
              - img [ref=e513]
              - img [ref=e515]
              - img [ref=e517]
              - img [ref=e519]
              - img [ref=e521]
            - paragraph [ref=e524]: “PulsarX transformed our online presence. Their team is professional, creative, and delivered beyond our expectations!”
            - generic [ref=e526]:
              - img "Faraz Ali" [ref=e527]
              - generic [ref=e528]:
                - paragraph [ref=e529]: Faraz Ali
                - paragraph [ref=e530]: CEO, Innovatech
          - generic [ref=e532]:
            - generic [ref=e534]:
              - img [ref=e535]
              - img [ref=e537]
              - img [ref=e539]
              - img [ref=e541]
              - img [ref=e543]
            - paragraph [ref=e546]: “The app they developed for us is fantastic. User-friendly, robust, and has significantly improved our customer engagement.”
            - generic [ref=e548]:
              - img "John Smith" [ref=e549]
              - generic [ref=e550]:
                - paragraph [ref=e551]: John Smith
                - paragraph [ref=e552]: Marketing Director, BizSolutions
          - generic [ref=e554]:
            - generic [ref=e556]:
              - img [ref=e557]
              - img [ref=e559]
              - img [ref=e561]
              - img [ref=e563]
              - img [ref=e565]
            - paragraph [ref=e568]: “Exceptional UI/UX design work. PulsarX understood our brand perfectly and created a stunning interface.”
            - generic [ref=e570]:
              - img "Alice Brown" [ref=e571]
              - generic [ref=e572]:
                - paragraph [ref=e573]: Alice Brown
                - paragraph [ref=e574]: Founder, Creative Co.
          - generic [ref=e576]:
            - generic [ref=e578]:
              - img [ref=e579]
              - img [ref=e581]
              - img [ref=e583]
              - img [ref=e585]
              - img [ref=e587]
            - paragraph [ref=e590]: “Working with PulsarX was a game-changer. They brought our vision to life with incredible attention to detail.”
            - generic [ref=e592]:
              - img "Michael Chen" [ref=e593]
              - generic [ref=e594]:
                - paragraph [ref=e595]: Michael Chen
                - paragraph [ref=e596]: CTO, FutureScale
          - generic [ref=e598]:
            - generic [ref=e600]:
              - img [ref=e601]
              - img [ref=e603]
              - img [ref=e605]
              - img [ref=e607]
              - img [ref=e609]
            - paragraph [ref=e612]: “Their development speed and code quality are unmatched. Highly recommended for any serious startup.”
            - generic [ref=e614]:
              - img "Sarah Johnson" [ref=e615]
              - generic [ref=e616]:
                - paragraph [ref=e617]: Sarah Johnson
                - paragraph [ref=e618]: Product Lead, TechFlow
          - generic [ref=e620]:
            - generic [ref=e622]:
              - img [ref=e623]
              - img [ref=e625]
              - img [ref=e627]
              - img [ref=e629]
              - img [ref=e631]
            - paragraph [ref=e634]: “A truly partner-centric approach. They didn't just build software; they helped us build a business.”
            - generic [ref=e636]:
              - img "David Wilson" [ref=e637]
              - generic [ref=e638]:
                - paragraph [ref=e639]: David Wilson
                - paragraph [ref=e640]: Founder, StartUp Hub
          - generic [ref=e642]:
            - generic [ref=e644]:
              - img [ref=e645]
              - img [ref=e647]
              - img [ref=e649]
              - img [ref=e651]
              - img [ref=e653]
            - paragraph [ref=e656]: “PulsarX transformed our online presence. Their team is professional, creative, and delivered beyond our expectations!”
            - generic [ref=e658]:
              - img "Faraz Ali" [ref=e659]
              - generic [ref=e660]:
                - paragraph [ref=e661]: Faraz Ali
                - paragraph [ref=e662]: CEO, Innovatech
          - generic [ref=e664]:
            - generic [ref=e666]:
              - img [ref=e667]
              - img [ref=e669]
              - img [ref=e671]
              - img [ref=e673]
              - img [ref=e675]
            - paragraph [ref=e678]: “The app they developed for us is fantastic. User-friendly, robust, and has significantly improved our customer engagement.”
            - generic [ref=e680]:
              - img "John Smith" [ref=e681]
              - generic [ref=e682]:
                - paragraph [ref=e683]: John Smith
                - paragraph [ref=e684]: Marketing Director, BizSolutions
          - generic [ref=e686]:
            - generic [ref=e688]:
              - img [ref=e689]
              - img [ref=e691]
              - img [ref=e693]
              - img [ref=e695]
              - img [ref=e697]
            - paragraph [ref=e700]: “Exceptional UI/UX design work. PulsarX understood our brand perfectly and created a stunning interface.”
            - generic [ref=e702]:
              - img "Alice Brown" [ref=e703]
              - generic [ref=e704]:
                - paragraph [ref=e705]: Alice Brown
                - paragraph [ref=e706]: Founder, Creative Co.
          - generic [ref=e708]:
            - generic [ref=e710]:
              - img [ref=e711]
              - img [ref=e713]
              - img [ref=e715]
              - img [ref=e717]
              - img [ref=e719]
            - paragraph [ref=e722]: “Working with PulsarX was a game-changer. They brought our vision to life with incredible attention to detail.”
            - generic [ref=e724]:
              - img "Michael Chen" [ref=e725]
              - generic [ref=e726]:
                - paragraph [ref=e727]: Michael Chen
                - paragraph [ref=e728]: CTO, FutureScale
          - generic [ref=e730]:
            - generic [ref=e732]:
              - img [ref=e733]
              - img [ref=e735]
              - img [ref=e737]
              - img [ref=e739]
              - img [ref=e741]
            - paragraph [ref=e744]: “Their development speed and code quality are unmatched. Highly recommended for any serious startup.”
            - generic [ref=e746]:
              - img "Sarah Johnson" [ref=e747]
              - generic [ref=e748]:
                - paragraph [ref=e749]: Sarah Johnson
                - paragraph [ref=e750]: Product Lead, TechFlow
          - generic [ref=e752]:
            - generic [ref=e754]:
              - img [ref=e755]
              - img [ref=e757]
              - img [ref=e759]
              - img [ref=e761]
              - img [ref=e763]
            - paragraph [ref=e766]: “A truly partner-centric approach. They didn't just build software; they helped us build a business.”
            - generic [ref=e768]:
              - img "David Wilson" [ref=e769]
              - generic [ref=e770]:
                - paragraph [ref=e771]: David Wilson
                - paragraph [ref=e772]: Founder, StartUp Hub
        - generic [ref=e773]:
          - generic [ref=e775]:
            - generic [ref=e777]:
              - img [ref=e778]
              - img [ref=e780]
              - img [ref=e782]
              - img [ref=e784]
              - img [ref=e786]
            - paragraph [ref=e789]: “PulsarX transformed our online presence. Their team is professional, creative, and delivered beyond our expectations!”
            - generic [ref=e791]:
              - img "Faraz Ali" [ref=e792]
              - generic [ref=e793]:
                - paragraph [ref=e794]: Faraz Ali
                - paragraph [ref=e795]: CEO, Innovatech
          - generic [ref=e797]:
            - generic [ref=e799]:
              - img [ref=e800]
              - img [ref=e802]
              - img [ref=e804]
              - img [ref=e806]
              - img [ref=e808]
            - paragraph [ref=e811]: “The app they developed for us is fantastic. User-friendly, robust, and has significantly improved our customer engagement.”
            - generic [ref=e813]:
              - img "John Smith" [ref=e814]
              - generic [ref=e815]:
                - paragraph [ref=e816]: John Smith
                - paragraph [ref=e817]: Marketing Director, BizSolutions
          - generic [ref=e819]:
            - generic [ref=e821]:
              - img [ref=e822]
              - img [ref=e824]
              - img [ref=e826]
              - img [ref=e828]
              - img [ref=e830]
            - paragraph [ref=e833]: “Exceptional UI/UX design work. PulsarX understood our brand perfectly and created a stunning interface.”
            - generic [ref=e835]:
              - img "Alice Brown" [ref=e836]
              - generic [ref=e837]:
                - paragraph [ref=e838]: Alice Brown
                - paragraph [ref=e839]: Founder, Creative Co.
          - generic [ref=e841]:
            - generic [ref=e843]:
              - img [ref=e844]
              - img [ref=e846]
              - img [ref=e848]
              - img [ref=e850]
              - img [ref=e852]
            - paragraph [ref=e855]: “Working with PulsarX was a game-changer. They brought our vision to life with incredible attention to detail.”
            - generic [ref=e857]:
              - img "Michael Chen" [ref=e858]
              - generic [ref=e859]:
                - paragraph [ref=e860]: Michael Chen
                - paragraph [ref=e861]: CTO, FutureScale
          - generic [ref=e863]:
            - generic [ref=e865]:
              - img [ref=e866]
              - img [ref=e868]
              - img [ref=e870]
              - img [ref=e872]
              - img [ref=e874]
            - paragraph [ref=e877]: “Their development speed and code quality are unmatched. Highly recommended for any serious startup.”
            - generic [ref=e879]:
              - img "Sarah Johnson" [ref=e880]
              - generic [ref=e881]:
                - paragraph [ref=e882]: Sarah Johnson
                - paragraph [ref=e883]: Product Lead, TechFlow
          - generic [ref=e885]:
            - generic [ref=e887]:
              - img [ref=e888]
              - img [ref=e890]
              - img [ref=e892]
              - img [ref=e894]
              - img [ref=e896]
            - paragraph [ref=e899]: “A truly partner-centric approach. They didn't just build software; they helped us build a business.”
            - generic [ref=e901]:
              - img "David Wilson" [ref=e902]
              - generic [ref=e903]:
                - paragraph [ref=e904]: David Wilson
                - paragraph [ref=e905]: Founder, StartUp Hub
          - generic [ref=e907]:
            - generic [ref=e909]:
              - img [ref=e910]
              - img [ref=e912]
              - img [ref=e914]
              - img [ref=e916]
              - img [ref=e918]
            - paragraph [ref=e921]: “PulsarX transformed our online presence. Their team is professional, creative, and delivered beyond our expectations!”
            - generic [ref=e923]:
              - img "Faraz Ali" [ref=e924]
              - generic [ref=e925]:
                - paragraph [ref=e926]: Faraz Ali
                - paragraph [ref=e927]: CEO, Innovatech
          - generic [ref=e929]:
            - generic [ref=e931]:
              - img [ref=e932]
              - img [ref=e934]
              - img [ref=e936]
              - img [ref=e938]
              - img [ref=e940]
            - paragraph [ref=e943]: “The app they developed for us is fantastic. User-friendly, robust, and has significantly improved our customer engagement.”
            - generic [ref=e945]:
              - img "John Smith" [ref=e946]
              - generic [ref=e947]:
                - paragraph [ref=e948]: John Smith
                - paragraph [ref=e949]: Marketing Director, BizSolutions
          - generic [ref=e951]:
            - generic [ref=e953]:
              - img [ref=e954]
              - img [ref=e956]
              - img [ref=e958]
              - img [ref=e960]
              - img [ref=e962]
            - paragraph [ref=e965]: “Exceptional UI/UX design work. PulsarX understood our brand perfectly and created a stunning interface.”
            - generic [ref=e967]:
              - img "Alice Brown" [ref=e968]
              - generic [ref=e969]:
                - paragraph [ref=e970]: Alice Brown
                - paragraph [ref=e971]: Founder, Creative Co.
          - generic [ref=e973]:
            - generic [ref=e975]:
              - img [ref=e976]
              - img [ref=e978]
              - img [ref=e980]
              - img [ref=e982]
              - img [ref=e984]
            - paragraph [ref=e987]: “Working with PulsarX was a game-changer. They brought our vision to life with incredible attention to detail.”
            - generic [ref=e989]:
              - img "Michael Chen" [ref=e990]
              - generic [ref=e991]:
                - paragraph [ref=e992]: Michael Chen
                - paragraph [ref=e993]: CTO, FutureScale
          - generic [ref=e995]:
            - generic [ref=e997]:
              - img [ref=e998]
              - img [ref=e1000]
              - img [ref=e1002]
              - img [ref=e1004]
              - img [ref=e1006]
            - paragraph [ref=e1009]: “Their development speed and code quality are unmatched. Highly recommended for any serious startup.”
            - generic [ref=e1011]:
              - img "Sarah Johnson" [ref=e1012]
              - generic [ref=e1013]:
                - paragraph [ref=e1014]: Sarah Johnson
                - paragraph [ref=e1015]: Product Lead, TechFlow
          - generic [ref=e1017]:
            - generic [ref=e1019]:
              - img [ref=e1020]
              - img [ref=e1022]
              - img [ref=e1024]
              - img [ref=e1026]
              - img [ref=e1028]
            - paragraph [ref=e1031]: “A truly partner-centric approach. They didn't just build software; they helped us build a business.”
            - generic [ref=e1033]:
              - img "David Wilson" [ref=e1034]
              - generic [ref=e1035]:
                - paragraph [ref=e1036]: David Wilson
                - paragraph [ref=e1037]: Founder, StartUp Hub
    - generic [ref=e1039]:
      - generic [ref=e1040]:
        - generic [ref=e1041]:
          - img [ref=e1042]
          - generic [ref=e1044]: Contact Us
        - heading "Get In Touch" [level=2] [ref=e1045]
        - paragraph [ref=e1046]: Have a project in mind or just want to say hi? We'd love to hear from you and discuss how we can help bring your vision to life.
      - generic [ref=e1047]:
        - generic [ref=e1048]:
          - generic [ref=e1049]:
            - generic [ref=e1051]:
              - generic [ref=e1054]: Send us a message
              - paragraph [ref=e1055]: Fill out the form below and we'll get back to you shortly.
            - generic [ref=e1057]:
              - generic [ref=e1058]:
                - generic [ref=e1059]:
                  - generic [ref=e1060]:
                    - text: Full Name
                    - generic [ref=e1061]: "*"
                  - textbox "Full Name *" [ref=e1062]:
                    - /placeholder: John Doe
                - generic [ref=e1063]:
                  - generic [ref=e1064]:
                    - text: Email Address
                    - generic [ref=e1065]: "*"
                  - textbox "Email Address *" [ref=e1066]:
                    - /placeholder: john@example.com
              - generic [ref=e1067]:
                - generic [ref=e1068]:
                  - text: Message
                  - generic [ref=e1069]: "*"
                - textbox "Message *" [ref=e1070]:
                  - /placeholder: Tell us about your project...
              - button "Send Message" [ref=e1071] [cursor=pointer]:
                - generic [ref=e1072]:
                  - text: Send Message
                  - img
          - generic [ref=e1073]:
            - generic [ref=e1075]: Book a Call
            - generic [ref=e1077]:
              - paragraph [ref=e1079]: Prefer to talk directly? Schedule a free 15-minute consultation with our experts.
              - link "Schedule Meeting" [ref=e1080] [cursor=pointer]:
                - /url: https://calendly.com/
                - img [ref=e1081]
                - text: Schedule Meeting
        - generic [ref=e1084]:
          - generic [ref=e1085]:
            - generic [ref=e1087]: Contact Info
            - generic [ref=e1089]:
              - link "Email pulsarx.inc@gmail.com" [ref=e1090] [cursor=pointer]:
                - /url: mailto:pulsarx.inc@gmail.com
                - img [ref=e1092]
                - generic [ref=e1095]:
                  - paragraph [ref=e1096]: Email
                  - paragraph [ref=e1097]: pulsarx.inc@gmail.com
              - link "Phone +92 304 7058585" [ref=e1098] [cursor=pointer]:
                - /url: tel:+923047058585
                - img [ref=e1100]
                - generic [ref=e1102]:
                  - paragraph [ref=e1103]: Phone
                  - paragraph [ref=e1104]: +92 304 7058585
              - link "Address Street 55 I8/3 Islamabad, Pakistan, WEB 40404" [ref=e1105] [cursor=pointer]:
                - /url: "#"
                - img [ref=e1107]
                - generic [ref=e1110]:
                  - paragraph [ref=e1111]: Address
                  - paragraph [ref=e1112]: Street 55 I8/3 Islamabad, Pakistan, WEB 40404
          - generic [ref=e1113]:
            - generic [ref=e1115]: Quick Info
            - generic [ref=e1117]:
              - generic [ref=e1118]:
                - img [ref=e1119]
                - generic [ref=e1122]:
                  - paragraph [ref=e1123]: Response Time
                  - paragraph [ref=e1124]: < 24 hours
              - generic [ref=e1125]:
                - img [ref=e1126]
                - generic [ref=e1129]:
                  - paragraph [ref=e1130]: Timezone
                  - paragraph [ref=e1131]: PKT (UTC+5)
              - generic [ref=e1132]:
                - img [ref=e1133]
                - generic [ref=e1135]:
                  - paragraph [ref=e1136]: Languages
                  - paragraph [ref=e1137]: English, Urdu
          - generic [ref=e1138]:
            - generic [ref=e1140]: Follow Us
            - generic [ref=e1143]:
              - link "LinkedIn" [ref=e1144] [cursor=pointer]:
                - /url: https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/
                - img [ref=e1146]
              - link "Twitter" [ref=e1150] [cursor=pointer]:
                - /url: https://x.com/
                - img [ref=e1152]
              - link "GitHub" [ref=e1154] [cursor=pointer]:
                - /url: https://github.com/ahmaddii
                - img [ref=e1156]
  - contentinfo [ref=e1159]:
    - generic [ref=e1160]:
      - generic [ref=e1161]:
        - generic [ref=e1162]:
          - link "PulsarX Logo PulsarX" [ref=e1163] [cursor=pointer]:
            - /url: "#home"
            - img "PulsarX Logo" [ref=e1166]
            - generic [ref=e1167]: PulsarX
          - paragraph [ref=e1168]: Illuminating the digital universe with innovative solutions. We transform visions into reality through cutting-edge technology and creative excellence.
          - generic [ref=e1169]:
            - img [ref=e1170]
            - generic [ref=e1172]: Crafting digital excellence since 2024
        - generic [ref=e1173]:
          - heading "Quick Links" [level=3] [ref=e1174]: Quick Links
          - list [ref=e1176]:
            - listitem [ref=e1177]:
              - link "Home" [ref=e1178] [cursor=pointer]:
                - /url: "#home"
                - text: Home
            - listitem [ref=e1179]:
              - link "About Us" [ref=e1180] [cursor=pointer]:
                - /url: "#about"
                - text: About Us
            - listitem [ref=e1181]:
              - link "Services" [ref=e1182] [cursor=pointer]:
                - /url: "#services"
                - text: Services
            - listitem [ref=e1183]:
              - link "Portfolio" [ref=e1184] [cursor=pointer]:
                - /url: "#portfolio"
                - text: Portfolio
            - listitem [ref=e1185]:
              - link "Contact" [ref=e1186] [cursor=pointer]:
                - /url: "#contact"
                - text: Contact
        - generic [ref=e1187]:
          - heading "Services" [level=3] [ref=e1188]: Services
          - list [ref=e1190]:
            - listitem [ref=e1191]:
              - link "Web Development" [ref=e1192] [cursor=pointer]:
                - /url: "#web-dev"
                - text: Web Development
            - listitem [ref=e1193]:
              - link "App Development" [ref=e1194] [cursor=pointer]:
                - /url: "#app-dev"
                - text: App Development
            - listitem [ref=e1195]:
              - link "UI/UX Design" [ref=e1196] [cursor=pointer]:
                - /url: "#ui-ux"
                - text: UI/UX Design
            - listitem [ref=e1197]:
              - link "Consulting" [ref=e1198] [cursor=pointer]:
                - /url: "#consulting"
                - text: Consulting
        - generic [ref=e1199]:
          - heading "Get In Touch" [level=3] [ref=e1200]: Get In Touch
          - generic [ref=e1202]:
            - generic [ref=e1203] [cursor=pointer]:
              - img [ref=e1204]
              - generic [ref=e1207]: Islamabad, Punjab, PK
            - generic [ref=e1208] [cursor=pointer]:
              - img [ref=e1209]
              - generic [ref=e1211]: +92 304 7058585
            - generic [ref=e1212] [cursor=pointer]:
              - img [ref=e1213]
              - generic [ref=e1216]: pulsarx.inc@gmail.com
          - generic [ref=e1217]:
            - paragraph [ref=e1218]: Follow us on social media
            - generic [ref=e1219]:
              - link "LinkedIn" [ref=e1220] [cursor=pointer]:
                - /url: https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/
                - img [ref=e1222]
              - link "Twitter" [ref=e1226] [cursor=pointer]:
                - /url: https://x.com/
                - img [ref=e1228]
              - link "GitHub" [ref=e1230] [cursor=pointer]:
                - /url: https://github.com/ahmaddii
                - img [ref=e1232]
              - link "Email" [ref=e1235] [cursor=pointer]:
                - /url: mailto:contact@pulsarx.com
                - img [ref=e1237]
      - generic [ref=e1241]:
        - heading "Stay Updated" [level=3] [ref=e1242]
        - paragraph [ref=e1243]: Subscribe to our newsletter for the latest updates and insights
        - generic [ref=e1244]:
          - textbox "Enter your email" [ref=e1245]
          - button "Subscribe" [ref=e1246] [cursor=pointer]
      - generic [ref=e1247]:
        - paragraph [ref=e1248]: © 2026 PulsarX. All rights reserved to Pakistan 🇵🇰
        - generic [ref=e1249]:
          - link "Privacy Policy" [ref=e1250] [cursor=pointer]:
            - /url: https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/
          - link "Terms of Service" [ref=e1251] [cursor=pointer]:
            - /url: https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/
          - link "Cookies" [ref=e1252] [cursor=pointer]:
            - /url: https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/
    - button "Back to top" [ref=e1253] [cursor=pointer]:
      - img
  - region "Notifications (F8)":
    - list
  - alert [ref=e1254]
```

# Test source

```ts
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
  72  |       await expect(page.getByRole('heading', { name: 'About Us' })).toBeVisible();
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
> 115 |       await expect(webDevCard.getByRole('button', { name: 'Learn More' })).toBeVisible();
      |                                                                            ^ Error: expect(locator).toBeVisible() failed
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
  173 |       await page.waitForLoadState('networkidle');
  174 | 
  175 |       await expect(page.getByRole('heading', { name: 'Book a Call' })).toBeVisible();
  176 |       await expect(page.getByText(/Prefer to talk directly\? Schedule a free 15-minute consultation with our experts\./)).toBeVisible();
  177 |       const scheduleMeetingLink = page.getByRole('link', { name: 'Schedule Meeting' });
  178 |       await expect(scheduleMeetingLink).toBeVisible();
  179 |       await expect(scheduleMeetingLink).toHaveAttribute('href', 'https://calendly.com/');
  180 |     });
  181 | 
  182 |     test('should display "Contact Info" and "Quick Info"', async () => {
  183 |       await page.goto(BASE_URL + '#contact');
  184 |       await page.waitForLoadState('networkidle');
  185 | 
  186 |       await expect(page.getByRole('heading', { name: 'Contact Info' })).toBeVisible();
  187 |       await expect(page.getByRole('link', { name: 'pulsarx.inc@gmail.com' })).toBeVisible();
  188 |       await expect(page.getByRole('link', { name: '+92 304 7058585' })).toBeVisible();
  189 |       await expect(page.getByRole('link', { name: 'Street 55 I8/3 Islamabad, Pakistan, WEB 40404' })).toBeVisible();
  190 | 
  191 |       await expect(page.getByRole('heading', { name: 'Quick Info' })).toBeVisible();
  192 |       await expect(page.getByText('Response Time')).toBeVisible();
  193 |       await expect(page.getByText('< 24 hours')).toBeVisible();
  194 |       await expect(page.getByText('Timezone')).toBeVisible();
  195 |       await expect(page.getByText('PKT (UTC+5)')).toBeVisible();
  196 |       await expect(page.getByText('Languages')).toBeVisible();
  197 |       await expect(page.getByText('English, Urdu')).toBeVisible();
  198 |     });
  199 | 
  200 |     test('should display "Follow Us" social media links', async () => {
  201 |       await page.goto(BASE_URL + '#contact');
  202 |       await page.waitForLoadState('networkidle');
  203 | 
  204 |       await expect(page.getByRole('heading', { name: 'Follow Us' })).toBeVisible();
  205 |       await expect(page.getByLabel('LinkedIn')).toBeVisible();
  206 |       await expect(page.getByLabel('LinkedIn')).toHaveAttribute('href', 'https://www.linkedin.com/in/malik-ahmad-rasheed-3768902a9/');
  207 |       await expect(page.getByLabel('Twitter')).toBeVisible();
  208 |       await expect(page.getByLabel('Twitter')).toHaveAttribute('href', 'https://x.com/');
  209 |       await expect(page.getByLabel('GitHub')).toBeVisible();
  210 |       await expect(page.getByLabel('GitHub')).toHaveAttribute('href', 'https://github.com/ahmaddii');
  211 |       // The email link here in the 'Follow Us' section of the contact section has href 'mailto:contact@pulsarx.com' which is different from the Contact Info card.
  212 |       // I will test this specific href as it appears in the HTML.
  213 |       await expect(page.getByLabel('Email')).toBeVisible();
  214 |       await expect(page.getByLabel('Email')).toHaveAttribute('href', 'mailto:contact@pulsarx.com');
  215 |     });
```