// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            // Toggle body scroll lock for mobile menu overlay
            document.body.classList.toggle('no-scroll');
        });

        // Close menu when a link is clicked (for single-page navigation or general UX)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // Add 'active' class to current navigation link
    const currentPath = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('.main-nav .nav-links a');

    navItems.forEach(item => {
        const itemPath = item.getAttribute('href');
        if (currentPath === itemPath || (currentPath === '' && itemPath === 'index.html')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active'); // Ensure only one is active
        }
    });


    // Reveal on Scroll Animation
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the item is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once it's visible
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-on-scroll').forEach(section => {
        observer.observe(section);
    });

    // Testimonial Carousel (Basic functionality - enhance with a library for full features)
    const testimonialCarousel = document.querySelector('.testimonial-carousel');
    const carouselDots = document.querySelectorAll('.carousel-dot');

    if (testimonialCarousel && carouselDots.length > 0) {
        let currentSlide = 0;
        const slides = testimonialCarousel.querySelectorAll('.testimonial-card');

        const updateDots = () => {
            carouselDots.forEach((dot, index) => {
                if (index === currentSlide) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        };

        const goToSlide = (slideIndex) => {
            if (slideIndex < 0 || slideIndex >= slides.length) return;
            currentSlide = slideIndex;
            testimonialCarousel.scrollLeft = slides[currentSlide].offsetLeft;
            updateDots();
        };

        // Click listeners for dots
        carouselDots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });

        // Optional: Auto-slide
        let autoSlideInterval;
        const startAutoSlide = () => {
            autoSlideInterval = setInterval(() => {
                const nextSlide = (currentSlide + 1) % slides.length;
                goToSlide(nextSlide);
            }, 5000); // Change slide every 5 seconds
        };

        const stopAutoSlide = () => {
            clearInterval(autoSlideInterval);
        };

        // Pause auto-slide on hover
        testimonialCarousel.addEventListener('mouseenter', stopAutoSlide);
        testimonialCarousel.addEventListener('mouseleave', startAutoSlide);

        // Update active dot on manual scroll (more advanced for real-time tracking)
        testimonialCarousel.addEventListener('scroll', () => {
            const scrollPosition = testimonialCarousel.scrollLeft;
            const cardWidth = slides[0].offsetWidth + (parseFloat(getComputedStyle(slides[0]).marginRight) || 0); // Include margin
            currentSlide = Math.round(scrollPosition / cardWidth);
            updateDots();
        });

        // Initialize carousel
        updateDots();
        startAutoSlide();
    }
});
