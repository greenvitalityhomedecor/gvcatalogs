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
 * @param {string} catalogId - The ID of the catalog the product belongs to.
 */
export function addToCart(product, catalogId, catalogName) {
    console.log('addToCart: Called with product:', product, 'catalogId:', catalogId, 'and catalogName:', catalogName);
    const cart = getCart();
    const cartItemId = `${catalogId}-${product.sku}`;

    if (cart[cartItemId]) {
        cart[cartItemId].quantity++;
        console.log(`addToCart: Incrementing quantity for existing item ${cartItemId}. New quantity: ${cart[cartItemId].quantity}`);
    } else {
        cart[cartItemId] = {
            sku: product.sku,
            catalogId: catalogId,
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
    const cartItemId = `${catalogId}-${sku}`;

    if (cart[cartItemId]) {
        delete cart[cartItemId];
        saveCart(cart);
    }
}

/**
 * Retrieves the current state of the cart.
 * @returns {object} The cart object.
 */
export function getCartContents() {
    return getCart();
}
