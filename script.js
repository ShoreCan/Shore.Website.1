// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

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
        // Handle both 'index.html' and empty path for root
        if (currentPath === itemPath || (currentPath === '' && itemPath === 'index.html')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });


    // Reveal on Scroll Animation
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-on-scroll').forEach(section => {
        observer.observe(section);
    });

    // Testimonial Carousel (Basic functionality)
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

        carouselDots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });

        let autoSlideInterval;
        const startAutoSlide = () => {
            autoSlideInterval = setInterval(() => {
                const nextSlide = (currentSlide + 1) % slides.length;
                goToSlide(nextSlide);
            }, 5000);
        };

        const stopAutoSlide = () => {
            clearInterval(autoSlideInterval);
        };

        testimonialCarousel.addEventListener('mouseenter', stopAutoSlide);
        testimonialCarousel.addEventListener('mouseleave', startAutoSlide);

        testimonialCarousel.addEventListener('scroll', () => {
            const scrollPosition = testimonialCarousel.scrollLeft;
            const cardWidth = slides[0].offsetWidth + (parseFloat(getComputedStyle(slides[0]).marginRight) || 0);
            currentSlide = Math.round(scrollPosition / cardWidth);
            updateDots();
        });

        updateDots();
        startAutoSlide();
    }

    // Waitlist Form Submission Logic
    const waitlistForm = document.getElementById('waitlistForm');
    const formMessage = document.getElementById('formMessage');

    if (waitlistForm && formMessage) {
        waitlistForm.addEventListener('submit', async (event) => {
            event.preventDefault();

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
                    formMessage.textContent = "Thank you for joining the waitlist! We'll keep you updated."; // Default to English success message
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

    // Age Gate Logic
    const ageGate = document.getElementById('ageGate');
    const ageGateForm = document.getElementById('ageGateForm');
    const dobMonth = document.getElementById('dobMonth');
    const dobDay = document.getElementById('dobDay');
    const dobYear = document.getElementById('dobYear');
    const ageGateMessage = document.getElementById('ageGateMessage');
    const underageLink = document.querySelector('.underage-link a');

    const MIN_AGE = 21;
    const REDIRECT_URL_UNDERAGE = "https://www.google.com";

    // Populate year dropdown (adjust range as needed)
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 100;
    for (let i = currentYear; i >= minYear; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        dobYear.appendChild(option);
    }

    function isAgeValid(birthMonth, birthDay, birthYear) {
        const today = new Date();
        const birthDate = new Date(birthYear, birthMonth - 1, birthDay); // Month is 0-indexed

        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= MIN_AGE;
    }

    function showAgeGate() {
        if (ageGate) {
            ageGate.classList.add('show');
            document.body.classList.add('no-scroll');
        }
    }

    function hideAgeGate() {
        if (ageGate) {
            ageGate.classList.remove('show');
            document.body.classList.remove('no-scroll');
        }
    }

    // --- NEW: Multi-language Logic ---
    const languageSelect = document.getElementById('languageSelect');
    let translations = {}; // Object to hold all loaded translations for all languages
    let currentLang = localStorage.getItem('preferredLang') || 'en'; // Get preferred lang from local storage or default to English

    // Function to fetch translations from JSON files
    async function fetchTranslations(lang) {
        try {
            const response = await fetch(`./lang/${lang}.json`);
            if (!response.ok) {
                // If specific lang file not found, try to load English as fallback
                console.warn(`Translation file not found for ${lang}. Falling back to English.`);
                const fallbackResponse = await fetch('./lang/en.json');
                if (!fallbackResponse.ok) {
                     throw new Error(`Could not load translations for ${lang} or fallback 'en'.`);
                }
                return await fallbackResponse.json();
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching translations for ${lang}:`, error);
            return {}; // Return empty object on critical error
        }
    }

    // Function to apply translations to the DOM elements
    function applyTranslations() {
        const currentTranslations = translations[currentLang];
        if (!currentTranslations) {
            console.warn(`Translations for ${currentLang} are not available yet.`);
            return;
        }

        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (currentTranslations[key]) {
                element.textContent = currentTranslations[key];
            } else {
                console.warn(`Translation key '${key}' not found for language '${currentLang}'.`);
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (currentTranslations[key]) {
                element.placeholder = currentTranslations[key];
            } else {
                console.warn(`Placeholder translation key '${key}' not found for language '${currentLang}'.`);
            }
        });

        // Specific handling for page title in the <head>
        const pageTitleElement = document.querySelector('title');
        if (pageTitleElement && pageTitleElement.hasAttribute('data-i18n')) {
            const key = pageTitleElement.getAttribute('data-i18n');
            if (currentTranslations[key]) {
                pageTitleElement.textContent = currentTranslations[key];
            }
        }

        // Specific handling for age gate month options (important for translation of default 'Month' option)
        const dobMonthOptions = dobMonth.querySelectorAll('option');
        dobMonthOptions.forEach(option => {
            const key = option.getAttribute('data-i18n');
            if (key && currentTranslations[key]) {
                option.textContent = currentTranslations[key];
            }
        });

        // Update age gate messages dynamically
        if (ageGateMessage.textContent) { // Only update if there's an existing message from a previous attempt
             // This might require more specific handling based on error state,
             // or clearing it and letting the form re-validate and set a new message.
             // For now, if a message is present, we'll try to re-translate it if its key is known.
             // Best to clear and let re-validation happen on language change if possible.
             ageGateMessage.textContent = ''; // Clear existing message on lang change
        }

        // Update waitlist form message dynamically if present
        if (formMessage && formMessage.textContent) {
            // Similarly, waitlist message might need specific re-translation if visible
            formMessage.textContent = ''; // Clear existing message on lang change
        }
    }

    // Initial language setup on page load
    async function initializeLanguage() {
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('lang');

        // Determine effective language: URL param > localStorage > browser lang > default 'en'
        if (langParam && languageSelect.querySelector(`option[value="${langParam}"]`)) {
            currentLang = langParam;
        } else if (localStorage.getItem('preferredLang')) {
            currentLang = localStorage.getItem('preferredLang');
        } else {
            const browserLang = navigator.language.split('-')[0];
            if (languageSelect.querySelector(`option[value="${browserLang}"]`)) {
                 currentLang = browserLang;
            } else {
                 currentLang = 'en';
            }
        }

        // Set the dropdown to the determined language
        if (languageSelect) {
            languageSelect.value = currentLang;
        }
        
        // Load translations for the current language (and potentially fallback)
        translations[currentLang] = await fetchTranslations(currentLang);
        
        // Apply translations to the page
        applyTranslations();
    }

    // Event listener for language switcher change
    if (languageSelect) {
        languageSelect.addEventListener('change', async (event) => {
            currentLang = event.target.value;
            localStorage.setItem('preferredLang', currentLang); // Save user's preference

            // Load translations for the newly selected language if not already cached
            if (!translations[currentLang]) {
                translations[currentLang] = await fetchTranslations(currentLang);
            }
            applyTranslations(); // Re-apply translations for the new language

            // Update URL with lang parameter for direct sharing/refresh
            const url = new URL(window.location.href);
            url.searchParams.set('lang', currentLang);
            window.history.pushState({path: url.href}, '', url.href);
        });
    }

    // Call the language initialization function when the DOM is ready
    initializeLanguage();
});
