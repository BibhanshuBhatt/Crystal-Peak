// script.js

// Global variables
let currentSlide = 0;
let currentTestimonial = 0;
const slides = document.querySelectorAll('.slide');
const testimonials = document.querySelectorAll('.testimonial');
const modal = document.getElementById('bookingModal');
const closeModal = document.querySelector('.close');
const bookingForm = document.getElementById('bookingForm');

// WhatsApp number (replace with your actual WhatsApp number)
const WHATSAPP_NUMBER = '+919411385974'; // Replace with your WhatsApp number

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeSlider();
    initializeTestimonials();
    initializeNavigation();
    initializeModal();
    initializeFormValidation();
    initializeScrollAnimations();
});

// Hero Image Slider
function initializeSlider() {
    if (slides.length === 0) return;
    
    // Start the slider
    setInterval(nextSlide, 4000); // Change every 5 seconds instead of 2
}

function nextSlide() {
    if (slides.length === 0) return;
    
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

// Testimonials Slider
function initializeTestimonials() {
    if (testimonials.length === 0) return;
    
    // Auto-rotate testimonials every 5 seconds
    setInterval(nextTestimonial, 2500);
}

function nextTestimonial() {
    if (testimonials.length === 0) return;
    
    testimonials[currentTestimonial].classList.remove('active');
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    testimonials[currentTestimonial].classList.add('active');
}

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) {
                navMenu.classList.remove('active');
            }
            if (hamburger) {
                hamburger.classList.remove('active');
            }
        });
    });
    
    // Smooth scrolling for anchor links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.backdropFilter = 'blur(15px)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        }
    });
}

// Modal functionality
function initializeModal() {
    if (!modal || !closeModal) return;
    
    // Close modal when clicking the X
    closeModal.addEventListener('click', hideBookingForm);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideBookingForm();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            hideBookingForm();
        }
    });
}

// Show booking form modal
function showBookingForm(roomType = '') {
    if (!modal) return;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Pre-select room type if provided
    if (roomType) {
        const roomTypeSelect = document.getElementById('roomType');
        if (roomTypeSelect) {
            roomTypeSelect.value = roomType;
        }
    }
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');
    
    if (checkInInput) checkInInput.setAttribute('min', today);
    if (checkOutInput) checkOutInput.setAttribute('min', today);
}

// Hide booking form modal
function hideBookingForm() {
    if (!modal) return;
    
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
    
    // Reset form
    if (bookingForm) {
        bookingForm.reset();
    }
}

// Form validation and submission
function initializeFormValidation() {
    if (!bookingForm) return;
    
    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');
    
    // Update checkout minimum date when check-in changes
    if (checkInInput && checkOutInput) {
        checkInInput.addEventListener('change', () => {
            const checkInDate = new Date(checkInInput.value);
            checkInDate.setDate(checkInDate.getDate() + 1); // Minimum 1 night stay
            const minCheckOut = checkInDate.toISOString().split('T')[0];
            checkOutInput.setAttribute('min', minCheckOut);
            
            // Clear checkout if it's before the new minimum
            if (checkOutInput.value && checkOutInput.value <= checkInInput.value) {
                checkOutInput.value = '';
            }
        });
    }
    
    // Form submission
    bookingForm.addEventListener('submit', handleBookingSubmission);
}

// Handle booking form submission
function handleBookingSubmission(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(bookingForm);
    const bookingDetails = {};
    
    for (let [key, value] of formData.entries()) {
        bookingDetails[key] = value;
    }
    
    // Validate required fields
    if (!validateBookingForm(bookingDetails)) {
        return;
    }
    
    // Generate WhatsApp message
    const whatsappMessage = generateWhatsAppMessage(bookingDetails);
    
    // Send to WhatsApp
    sendToWhatsApp(whatsappMessage);
}

// Validate booking form
function validateBookingForm(data) {
    const requiredFields = ['fullName', 'phone', 'checkIn', 'checkOut', 'roomType', 'numberOfPersons', 'adults'];
    
    for (let field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showNotification(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
            return false;
        }
    }
    
    // Validate dates
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkIn < today) {
        showNotification('Check-in date cannot be in the past', 'error');
        return false;
    }
    
    if (checkOut <= checkIn) {
        showNotification('Check-out date must be after check-in date', 'error');
        return false;
    }
    
    // Validate phone number
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
        showNotification('Please enter a valid phone number', 'error');
        return false;
    }
    
    return true;
}

// Generate WhatsApp message
function generateWhatsAppMessage(data) {
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    let message = `🏨 *ROYAL PALACE HOTEL - BOOKING REQUEST*\n\n`;
    message += `👤 *Guest Details:*\n`;
    message += `Name: ${data.fullName}\n`;
    message += `Phone: ${data.phone}\n\n`;
    
    message += `🗓️ *Booking Details:*\n`;
    message += `Check-in: ${formatDate(checkIn)}\n`;
    message += `Check-out: ${formatDate(checkOut)}\n`;
    message += `Duration: ${nights} night${nights > 1 ? 's' : ''}\n\n`;
    
    message += `🏠 *Accommodation:*\n`;
    message += `Room Type: ${data.roomType}\n`;
    message += `Number of Persons: ${data.numberOfPersons}\n`;
    message += `Adults: ${data.adults}\n`;
    message += `Children: ${data.children || '0'}\n\n`;
    
    if (data.specialRequests && data.specialRequests.trim()) {
        message += `📝 *Special Requests:*\n`;
        message += `${data.specialRequests}\n\n`;
    }
    
    message += `Please confirm availability and provide booking details. Thank you! 🙏`;
    
    return message;
}

// Format date for display
function formatDate(date) {
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Send booking details to WhatsApp
function sendToWhatsApp(message) {
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER.replace(/[\s\-\+]/g, '')}?text=${encodedMessage}`;
    
    // Show loading state
    const submitButton = document.querySelector('.submit-button');
    if (submitButton) {
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecting to WhatsApp...';
        submitButton.disabled = true;
        
        setTimeout(() => {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }, 2000);
    }
    
    // Open WhatsApp
    window.open(whatsappURL, '_blank');
    
    // Hide modal after short delay
    setTimeout(() => {
        hideBookingForm();
        showNotification('Redirecting to WhatsApp for booking confirmation!', 'success');
    }, 1000);
}

// WhatsApp float button functionality
function openWhatsApp() {
    const message = encodeURIComponent('Hello! I would like to inquire about booking a room at Royal Palace Hotel. Could you please provide more information?');
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER.replace(/[\s\-\+]/g, '')}?text=${message}`;
    window.open(whatsappURL, '_blank');
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
        <i class="fas fa-times notification-close"></i>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 350px;
        animation: slideInRight 0.3s ease-out;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
    `;
    
    // Add animation styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .notification-close {
            cursor: pointer;
            margin-left: auto;
            opacity: 0.7;
            transition: opacity 0.2s;
        }
        .notification-close:hover {
            opacity: 1;
        }
    `;
    document.head.appendChild(styleSheet);
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Close notification functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Scroll animations
function initializeScrollAnimations() {
    // Create intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.room-card, .amenity-card, .gallery-item, .about-text, .about-image');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
    
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        const hero = document.querySelector('.hero');
        
        if (hero) {
            hero.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Gallery lightbox functionality
function initializeGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            openLightbox(index);
        });
    });
}

function openLightbox(index) {
    // Create lightbox overlay
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-overlay';
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        cursor: pointer;
    `;
    
    const lightboxContent = document.createElement('div');
    lightboxContent.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        position: relative;
    `;
    
    const closeButton = document.createElement('div');
    closeButton.innerHTML = '&times;';
    closeButton.style.cssText = `
        position: absolute;
        top: -40px;
        right: 0;
        color: white;
        font-size: 30px;
        cursor: pointer;
        z-index: 3001;
    `;
    
    lightboxContent.appendChild(closeButton);
    lightbox.appendChild(lightboxContent);
    document.body.appendChild(lightbox);
    
    // Close lightbox
    const closeLightbox = () => {
        document.body.removeChild(lightbox);
        document.body.style.overflow = 'auto';
    };
    
    lightbox.addEventListener('click', closeLightbox);
    closeButton.addEventListener('click', closeLightbox);
    
    document.body.style.overflow = 'hidden';
}

// Smooth scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add scroll to top button
function addScrollToTopButton() {
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollButton.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 30px;
        background: var(--primary-gold);
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        cursor: pointer;
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 999;
        font-size: 18px;
    `;
    
    scrollButton.addEventListener('click', scrollToTop);
    document.body.appendChild(scrollButton);
    
    // Show/hide scroll button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollButton.style.opacity = '1';
            scrollButton.style.transform = 'translateY(0)';
        } else {
            scrollButton.style.opacity = '0';
            scrollButton.style.transform = 'translateY(20px)';
        }
    });
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSlider();
    initializeTestimonials();
    initializeNavigation();
    initializeModal();
    initializeFormValidation();
    initializeScrollAnimations();
    initializeGallery();
    addScrollToTopButton();
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 100);
});

// Handle window resize
window.addEventListener('resize', () => {
    // Recalculate any position-dependent elements
    const modal = document.getElementById('bookingModal');
    if (modal && modal.style.display === 'block') {
        // Reposition modal if needed
        modal.style.display = 'block';
    }
});

// Performance optimization: Lazy loading for images
function initializeLazyLoading() {
    const imageElements = document.querySelectorAll('[style*="background-image"]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                // Add any lazy loading logic here if needed
                observer.unobserve(img);
            }
        });
    });
    
    imageElements.forEach(img => {
        imageObserver.observe(img);
    });
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
    // You can add error reporting here
});

// Service worker registration for PWA features (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
            console.log('SW registered: ', registration);
        }).catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}