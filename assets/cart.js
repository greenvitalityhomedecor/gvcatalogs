// gvcatalogs/assets/cart.js

const CART_STORAGE_KEY = 'greenvitality_cart';

/**
 * Retrieves the cart from localStorage.
 * @returns {object} The cart object.
 */
function getCart() {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : {};
}

/**
 * Saves the cart to localStorage.
 * @param {object} cart - The cart object to save.
 */
function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

/**
 * Adds a product to the cart or increments its quantity.
 * @param {object} product - The product object to add.
 * @param {string} catalogName - The name of the catalog the product belongs to.
 */
export function addToCart(product, catalogName) {
    // Ensure sku and catalogName are trimmed to prevent whitespace issues
    const trimmedSku = product.sku.trim();
    const trimmedCatalogName = catalogName.trim();
    const cartItemId = `${trimmedCatalogName}-${trimmedSku}`;
    console.log(`addToCart: Called with product: ${product.name}, sku: "${trimmedSku}", catalogName: "${trimmedCatalogName}", Generated cartItemId: "${cartItemId}"`);
    const cart = getCart();

    if (cart[cartItemId]) {
        cart[cartItemId].quantity++;
        console.log(`addToCart: Incrementing quantity for existing item ${cartItemId}. New quantity: ${cart[cartItemId].quantity}`);
    } else {
        cart[cartItemId] = {
            sku: product.sku,
            catalogName: catalogName, // Store the catalog name here
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        };
        console.log(`addToCart: Adding new item ${cartItemId} with details:`, cart[cartItemId]);
    }
    saveCart(cart);
    console.log('addToCart: Cart state after operation:', cart);
}

/**
 * Updates the quantity of a specific item in the cart.
 * @param {string} sku - The SKU of the item to update.
 * @param {string} catalogId - The catalog ID of the item.
 * @param {number} quantity - The new quantity.
 */
export function updateQuantity(sku, catalogId, quantity) {
    const cart = getCart();
    const cartItemId = `${catalogId}-${sku}`;
    console.log('removeFromCart: Generated cartItemId:', cartItemId);

    if (cart[cartItemId]) {
        if (quantity > 0) {
            cart[cartItemId].quantity = quantity;
        } else {
            delete cart[cartItemId];
        }
        saveCart(cart);
    }
}

/**
 * Removes an item from the cart.
 * @param {string} sku - The SKU of the item to remove.
 * @param {string} catalogId - The catalog ID of the item.
 */
export function removeFromCart(sku, catalogId) {
    const cart = getCart();
    // Ensure sku and catalogId are trimmed to prevent whitespace issues
    const trimmedSku = sku.trim();
    const trimmedCatalogId = catalogId.trim();
    const cartItemId = `${trimmedCatalogId}-${trimmedSku}`;
    if (cart[cartItemId]) {
        delete cart[cartItemId];
        saveCart(cart);
    } else {
        console.log(`removeFromCart: Item with cartItemId "${cartItemId}" not found in cart.`);
    }
}

/**
 * Retrieves the current state of the cart.
 * @returns {object} The cart object.
 */
export function getCartContents() {
    return getCart();
}

/**
 * Renders the cart contents into a specified container element.
 * @param {HTMLElement} containerElement - The element to render the cart into.
 */
export function renderCart(containerElement) {
    const cart = getCartContents();
    const items = Object.values(cart);
    const MINIMUM_ORDER = 12000;

    if (items.length === 0) {
        containerElement.innerHTML = '<p class="cart-empty-message">Your shopping cart is empty.</p>';
        return;
    }

    // Calculate total order value
    const totalOrderValue = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const amountRemaining = MINIMUM_ORDER - totalOrderValue;
    const progressPercentage = Math.min((totalOrderValue / MINIMUM_ORDER) * 100, 100);

    // Group items by catalog
    const groupedByCatalog = items.reduce((acc, item) => {
        const catalogName = item.catalogName || 'Unknown Catalog';
        if (!acc[catalogName]) {
            acc[catalogName] = [];
        }
        acc[catalogName].push(item);
        return acc;
    }, {});

    let cartHtml = '';

    for (const catalogName in groupedByCatalog) {
        cartHtml += `<div class="cart-catalog-group">`;
        cartHtml += `<h2 class="catalog-title">From ${catalogName}</h2>`;

        groupedByCatalog[catalogName].forEach(item => {
            cartHtml += `
                <div class="cart-item" data-sku="${item.sku}" data-catalog="${item.catalogName}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details-wrapper">
                        <div class="cart-item-info">
                            <span class="cart-item-name">${item.name}</span>
                            <span class="cart-item-price-each">₹${item.price.toFixed(2)} each</span>
                        </div>
                        <div class="cart-item-actions-group">
                            <div class="quantity-controls">
                                <button class="quantity-btn minus-btn" data-sku="${item.sku}" data-catalog="${item.catalogName}">-</button>
                                <span class="item-quantity">${item.quantity}</span>
                                <button class="quantity-btn plus-btn" data-sku="${item.sku}" data-catalog="${item.catalogName}">+</button>
                            </div>
                            <button class="remove-item-btn" data-sku="${item.sku}" data-catalog="${item.catalogName}">x</button>
                            <span class="cart-item-subtotal">₹${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        cartHtml += `</div>`;
    }

    // Add order summary, progress bar, and button
    cartHtml += `
        <div class="order-summary">
            <div class="order-total">
                <span>Total:</span>
                <span>₹${totalOrderValue.toFixed(2)}</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${progressPercentage}%;"></div>
            </div>
            <p class="progress-text">
                ${amountRemaining > 0 ? `You are ₹${amountRemaining.toFixed(2)} away from the minimum order of ₹${MINIMUM_ORDER}.` : 'You have reached the minimum order amount!'}
            </p>
            <button id="place-order-enquiry" class="place-order-btn" ${totalOrderValue < MINIMUM_ORDER ? 'disabled' : ''}>
                Place Order Enquiry
            </button>
        </div>
    `;

    containerElement.innerHTML = cartHtml;

    console.log('renderCart: Attaching event listeners...');

    // Add event listeners for plus buttons
    containerElement.querySelectorAll('.plus-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const sku = e.target.dataset.sku;
            const catalogId = e.target.dataset.catalog;
            console.log('plus-btn click: sku =', sku, 'catalogId =', catalogId);
            const cart = getCart();
            const cartItemId = `${catalogId}-${sku}`;
            if (cart[cartItemId]) {
                updateQuantity(sku, catalogId, cart[cartItemId].quantity + 1);
                renderCart(containerElement);
            }
        });
    });

    containerElement.querySelectorAll('.minus-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const sku = e.target.dataset.sku;
            const catalogId = e.target.dataset.catalog;
            console.log('minus-btn click: sku =', sku, 'catalogId =', catalogId);
            console.log('minus-btn click: e.target =', e.target, 'e.currentTarget =', e.currentTarget);
            const cart = getCart();
            const cartItemId = `${catalogId}-${sku}`;
            if (cart[cartItemId] && cart[cartItemId].quantity > 1) {
                updateQuantity(sku, catalogId, cart[cartItemId].quantity - 1);
            } else {
                removeFromCart(sku, catalogId);
            }
            renderCart(containerElement);
        });
    });

    // Add event listeners for remove buttons
    const removeButtons = containerElement.querySelectorAll('.remove-item-btn');
    console.log(`renderCart: Found ${removeButtons.length} remove buttons.`);
    removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const sku = e.target.dataset.sku;
            const catalogId = e.target.dataset.catalog;
            console.log('remove-item-btn click: sku =', sku, 'catalogId =', catalogId);
            console.log('remove-item-btn click: e.target =', e.target, 'e.currentTarget =', e.currentTarget);
            removeFromCart(sku, catalogId);
            renderCart(containerElement);
        });
    });

    // Add event listener for the "Place Order Enquiry" button
    const placeOrderBtn = containerElement.querySelector('#place-order-enquiry');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', () => {
            const cart = getCartContents();
            const orderSummary = formatCartForWhatsApp(cart);
            // const whatsappUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(orderSummary)}`;
            const whatsappUrl = `https://api.whatsapp.com/send/?phone=917899579366&text=${encodeURIComponent(orderSummary)}`;
            window.open(whatsappUrl, '_blank');
        });
    }
}

/**
 * Formats the cart contents into a string for WhatsApp.
 * @param {object} cart - The cart object.
 * @returns {string} A formatted string of the order summary.
 */
function formatCartForWhatsApp(cart) {
    const items = Object.values(cart);
    if (items.length === 0) {
        return 'My cart is empty.';
    }

    let summary = 'Hello! I would like to place an enquiry for the following items:\n\n';

    items.forEach(item => {
        summary += `*SKU:* ${item.sku}\n`;
        summary += `*CatalogID:* ${item.catalogName}\n`;
        summary += `*Name:* ${item.name}\n`;
        summary += `*Quantity:* ${item.quantity}\n\n`;
    });

    const totalOrderValue = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    summary += `*Total Estimated Value:* ₹${totalOrderValue.toFixed(2)}\n`;

    return summary;
}
