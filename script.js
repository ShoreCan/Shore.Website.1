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

    // Waitlist Form Submission Logic
    const waitlistForm = document.getElementById('waitlistForm');
    const formMessage = document.getElementById('formMessage');

    if (waitlistForm && formMessage) {
        waitlistForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const formData = new FormData(waitlistForm);

            try {
                const response = await fetch(waitlistForm.action, {
                    method: waitlistForm.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formMessage.textContent = "Thank you for joining the waitlist! We'll keep you updated.";
                    formMessage.style.color = "var(--color-leaf)";
                    waitlistForm.reset();
                } else {
                    const data = await response.json();
                    if (data.errors) {
                        formMessage.textContent = "Error: " + data.errors.map(error => error.message).join(", ");
                    } else {
                        formMessage.textContent = "Oops! There was an error submitting your email. Please try again.";
                    }
                    formMessage.style.color = "red";
                }
            } catch (error) {
                formMessage.textContent = "Network error. Please check your connection and try again.";
                formMessage.style.color = "red";
                console.error('Submission error:', error);
            }
        });
    }

    // NEW: Age Gate Logic
    const ageGate = document.getElementById('ageGate');
    const ageGateForm = document.getElementById('ageGateForm');
    const dobMonth = document.getElementById('dobMonth');
    const dobDay = document.getElementById('dobDay');
    const dobYear = document.getElementById('dobYear');
    const ageGateMessage = document.getElementById('ageGateMessage');
    const underageLink = document.querySelector('.underage-link a');

    const MIN_AGE = 21;
    const REDIRECT_URL_UNDERAGE = "https://www.google.com"; // Consider a specific 'underage' page or a different safe site

    // Populate year dropdown with a range of years (e.g., up to 100 years back)
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 100; // Go back 100 years
    for (let i = currentYear; i >= minYear; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        dobYear.appendChild(option);
    }

    // Function to check if user is 21 or older
    function isAgeValid(birthMonth, birthDay, birthYear) {
        const today = new Date();
        const birthDate = new Date(birthYear, birthMonth - 1, birthDay); // Month is 0-indexed in JS (Jan=0, Dec=11)

        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= MIN_AGE;
    }

    // Function to show the age gate
    function showAgeGate() {
        if (ageGate) { // Only show if the element exists
            ageGate.classList.add('show');
            document.body.classList.add('no-scroll'); // Prevent scrolling of main content
        }
    }

    // Function to hide the age gate
    function hideAgeGate() {
        if (ageGate) { // Only hide if the element exists
            ageGate.classList.remove('show');
            document.body.classList.remove('no-scroll');
        }
    }

    // Check localStorage on page load to see if age is already verified
    const ageVerified = localStorage.getItem('ageVerified');
    if (ageVerified === 'true') {
        hideAgeGate(); // Already verified, hide it
    } else {
        // If not verified, show the age gate.
        // It's good practice to wrap this in a setTimeout for slight delay
        // to ensure CSS transitions apply smoothly, but direct call works too.
        showAgeGate();
    }

    // Handle age gate form submission
    if (ageGateForm) {
        ageGateForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission

            const month = parseInt(dobMonth.value);
            const day = parseInt(dobDay.value);
            const year = parseInt(dobYear.value);

            // Basic validation for empty fields
            if (isNaN(month) || isNaN(day) || isNaN(year) || !month || !day || !year) {
                ageGateMessage.textContent = "Please enter your full date of birth.";
                return;
            }

            // More robust date validity check (e.g., Feb 30th or invalid month/day combo)
            const testDate = new Date(year, month - 1, day); // month - 1 because Date constructor is 0-indexed for month
            // Check if the month/day/year parsed correctly and didn't overflow (e.g., Feb 30 becomes Mar 2)
            if (testDate.getMonth() + 1 !== month || testDate.getDate() !== day || testDate.getFullYear() !== year) {
                ageGateMessage.textContent = "Please enter a valid date.";
                return;
            }

            if (isAgeValid(month, day, year)) {
                localStorage.setItem('ageVerified', 'true'); // Store verification
                hideAgeGate(); // Hide the age gate
            } else {
                ageGateMessage.textContent = "Sorry, you must be 21 or older to visit this site.";
                // Redirect underage users
                setTimeout(() => {
                    window.location.href = REDIRECT_URL_UNDERAGE;
                }, 2000); // Redirect after 2 seconds
            }
        });
    }

    // Handle click on "I am not 21 or older" link
    if (underageLink) {
        underageLink.addEventListener('click', (e) => {
            // No specific JS needed here unless you want to log or prevent default.
            // It will simply follow the href as a normal link, which should lead to REDIRECT_URL_UNDERAGE.
        });
    }
});
