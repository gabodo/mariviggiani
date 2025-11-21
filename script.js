// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
        }
    });
});

// Shopping Cart Logic
let cart = [];

// Courses data (translated names)
const courses = [
    { id: 1, name: 'Viaje de Descubrimiento de Propósito', price: 97 },
    { id: 2, name: 'Constructor de Negocio con Propósito', price: 147 },
    { id: 3, name: 'Maestría Espiritual para Mamás', price: 97 }
];

// Get cart from localStorage
function getCart() {
    const cartData = localStorage.getItem('mariViCart');
    return cartData ? JSON.parse(cartData) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('mariViCart', JSON.stringify(cart));
}

// Add item to cart
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    saveCart(cart);
    updateCartCount();
    announceItemAdded(name);
}

// Remove item from cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    updateCartDisplay();
    updateCartCount();
}

// Get total price
function getTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Update cart count in nav
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Announce item added for accessibility (Spanish)
function announceItemAdded(name) {
    let liveRegion = document.getElementById('announcement');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'announcement';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-9999px';
        document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = `${name} añadido al carrito.`;
    setTimeout(() => { liveRegion.textContent = ''; }, 1000);
}

// Create and show cart modal (Spanish content)
function showCartModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('cart-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'cart-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'cart-title');
    modal.innerHTML = `
        <div class="modal-overlay" tabindex="-1">
            <div class="modal-content">
                <header>
                    <h2 id="cart-title">Carrito de Compras</h2>
                    <button id="close-cart" class="close-button" aria-label="Cerrar carrito">&times;</button>
                </header>
                <div id="cart-items" class="cart-items">
                    ${cart.length > 0 ? cart.map(item => `
                        <div class="cart-item">
                            <div class="item-details">
                                <span>${item.name}</span>
                                <span>$${item.price} x ${item.quantity}</span>
                            </div>
                            <button class="remove-item" data-id="${item.id}" aria-label="Eliminar ${item.name} del carrito">Eliminar</button>
                        </div>
                    `).join('') : '<p>Tu carrito está vacío.</p>'}
                </div>
                ${cart.length > 0 ? `
                <div class="cart-total">
                    <strong>Total: $${getTotal()}</strong>
                </div>
                <div class="cart-actions">
                    <button id="checkout-btn" class="cta-button">Proceder al Pago</button>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Focus management
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    firstFocusable.focus();

    // Trap focus in modal
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {/* Lines omitted intentionally */}
            } else {
                if (document.activeElement === lastFocusable) {/* Lines omitted intentionally */}
            }
        }
        if (e.key === 'Escape') {
            modal.remove();
        }
    });

    // Close on overlay click
    modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target === modal.querySelector('.modal-overlay')) {
            modal.remove();
        }
    });

    // Close button
    document.getElementById('close-cart').addEventListener('click', () => modal.remove());

    // Remove item
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            removeFromCart(id);
        });
    });

    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            window.location.href = 'checkout.html';
        });
    }
}

// Update cart display in modal (if open, but since we recreate, not needed yet)
function updateCartDisplay() {
    // If modal is open, it would be recreated on next open, but for simplicity, we recreate on show
}

// Form submission handler with accessibility announcement (Spanish)
document.getElementById('contact-form')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const form = this;
    const fields = ['name', 'email', 'message'];
    let firstInvalid = null;

    // basic validation
    fields.forEach(id => {
        const input = form.querySelector('#' + id);
        if (!input) return;
        const val = input.value.trim();
        if (!val) {
            input.setAttribute('aria-invalid', 'true');
            input.classList.add('input-invalid');
            if (!firstInvalid) firstInvalid = input;
        } else {
            input.removeAttribute('aria-invalid');
            input.classList.remove('input-invalid');
        }
    });

    // simple email format check
    const email = form.querySelector('#email');
    if (email && email.value.trim()) {
        const re = /\S+@\S+\.\S+/;
        if (!re.test(email.value.trim())) {
            email.setAttribute('aria-invalid', 'true');
            email.classList.add('input-invalid');
            if (!firstInvalid) firstInvalid = email;
        }
    }

    let liveRegion = document.getElementById('form-announcement');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'form-announcement';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-9999px';
        document.body.appendChild(liveRegion);
    }

    if (firstInvalid) {
        liveRegion.textContent = 'Por favor, completa los campos obligatorios correctamente.';
        firstInvalid.focus();
        return;
    }

    // Success
    liveRegion.textContent = '¡Gracias por tu mensaje! Te contactaré pronto.';
    form.reset();
    form.querySelector('#name')?.focus();
});

// Checkout specific logic
function initializeCheckout() {
    cart = getCart();
    if (cart.length === 0) {
        // Redirect to academy if empty cart
        window.location.href = 'academy.html';
        return;
    }

    // Populate order summary
    const orderItems = document.getElementById('order-items');
    orderItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <span class="order-item-name">${item.name}</span>
            <span class="order-item-price">$${item.price} x ${item.quantity}</span>
        </div>
    `).join('');

    document.getElementById('order-total').textContent = getTotal();

    // Payment form submit
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const requiredFields = ['billing-name', 'billing-email', 'billing-address', 'billing-city', 'billing-state', 'billing-zip', 'card-number', 'card-expiry', 'card-cvv'];
            let firstInvalid = null;

            requiredFields.forEach(id => {
                const input = document.getElementById(id);
                if (!input) return;
                const val = input.value.trim();
                if (!val) {
                    input.setAttribute('aria-invalid', 'true');
                    input.classList.add('input-invalid');
                    if (!firstInvalid) firstInvalid = input;
                } else {
                    input.removeAttribute('aria-invalid');
                    input.classList.remove('input-invalid');
                }
            });

            // Basic card number check (digits and length)
            const card = document.getElementById('card-number');
            if (card && card.value.trim()) {
                const digits = card.value.replace(/\s+/g, '');
                if (!/^\d{12,19}$/.test(digits)) {
                    card.setAttribute('aria-invalid', 'true');
                    card.classList.add('input-invalid');
                    if (!firstInvalid) firstInvalid = card;
                }
            }

            if (firstInvalid) {
                announceMessage('Por favor, completa correctamente los campos requeridos.', 'polite');
                firstInvalid.focus();
                return;
            }

            // Simulate payment processing
            const submitBtn = document.getElementById('submit-payment');
            submitBtn.disabled = true;
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Procesando...';

            setTimeout(() => {
                // Clear cart and redirect to thank-you/confirmation (simple flow)
                localStorage.removeItem('mariViCart');
                announceMessage('Pago procesado. Gracias por tu compra.', 'polite');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                window.location.href = 'index.html';
            }, 1500);
        });
    }
}

// General announce function for checkout (Spanish)
function announceMessage(message, type = 'polite') {
    let liveRegion = document.getElementById('checkout-announcement');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'checkout-announcement';
        liveRegion.setAttribute('aria-live', type);
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-9999px';
        document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = message;
    setTimeout(() => { liveRegion.textContent = ''; }, 5000);
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    cart = getCart();
    updateCartCount();

    // Mobile navigation toggle
    const navToggle = document.querySelectorAll('.nav-toggle');
    navToggle.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const header = btn.closest('header');
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!expanded));
            if (header) header.classList.toggle('nav-open');
        });
    });

    // Close nav on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('header.nav-open').forEach(h => h.classList.remove('nav-open'));
            document.querySelectorAll('.nav-toggle').forEach(b => b.setAttribute('aria-expanded', 'false'));
        }
    });

    // Close nav when clicking a link
    document.querySelectorAll('#primary-navigation a').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelectorAll('header.nav-open').forEach(h => h.classList.remove('nav-open'));
            document.querySelectorAll('.nav-toggle').forEach(b => b.setAttribute('aria-expanded', 'false'));
        });
    });

    // Check if on checkout page
    if (document.querySelector('.checkout')) {
        initializeCheckout();
    }

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const id = parseInt(button.dataset.id);
            const name = button.dataset.name;
            const price = parseFloat(button.dataset.price);
            addToCart(id, name, price);
            button.textContent = '¡Añadido!';
            setTimeout(() => {/* Omitted for brevity */}, 2000);
        });
    });

    // Cart link
    const cartLink = document.getElementById('cart-link');
    if (cartLink) {
        cartLink.addEventListener('click', (e) => {
            e.preventDefault();
            showCartModal();
        });
    }
});
