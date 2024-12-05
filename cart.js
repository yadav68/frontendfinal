let cart = JSON.parse(localStorage.getItem("cart")) || []; // Retrieve cart from localStorage



document.addEventListener("DOMContentLoaded", () => {
    const navbarLinks = document.getElementById("navbar-links");
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser) {
        navbarLinks.innerHTML = `
            <li><a href="index.html">Home</a></li>
             <li><a href="cart.html">Cart (<span id="cart-count">0</span>)</a></li>
            <li><a href="edit-user.html">Profile</a></li>
            <li><a id="logout-btn" href="#">Logout</a></li>
        `;

        document.getElementById("logout-btn").addEventListener("click", () => {
            localStorage.removeItem("currentUser");
            showPopup("You have been logged out!", () => {
                window.location.href = "index.html";
            });
        });
    }
});




// Function to render cart items
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; // Clear previous items
    let totalPrice = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        document.getElementById('total-price').textContent = '0.00';
        return;
    }

    cart.forEach(item => {
        const itemHTML = `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p class="cart-item-price">Price: $${item.price.toFixed(2)}</p>
                    <div class="cart-item-quantity">
                        <button class="decrease-quantity" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="increase-quantity" data-id="${item.id}">+</button>
                    </div>
                    <br/>
                    <button class="remove-item" data-id="${item.id}">Remove</button>
                </div>
            </div>
        `;
        cartItemsContainer.innerHTML += itemHTML;
        totalPrice += item.price * item.quantity; // Calculate total price
    });

    // Update total price
    document.getElementById('total-price').textContent = totalPrice.toFixed(2);

    // Add event listeners to increase and decrease quantity buttons
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.getAttribute('data-id');
            updateCartQuantity(productId, 1); // Increase quantity by 1
        });
    });

    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.getAttribute('data-id');
            updateCartQuantity(productId, -1); // Decrease quantity by 1
        });
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.getAttribute('data-id');
            removeFromCart(productId);
        });
    });
}

// Function to update the quantity of a product in the cart
function updateCartQuantity(productId, change) {
    const parsedProductId = Number(productId);
    const product = cart.find(item => item.id === parsedProductId);

    if (product) {
        product.quantity += change;
        if (product.quantity <= 0) {
            removeFromCart(productId); // Remove item if quantity is 0 or less
        } else {
            localStorage.setItem('cart', JSON.stringify(cart)); // Update cart in localStorage
            renderCartItems(); // Re-render cart items
        }
    }
}

// Function to remove a product from the cart
function removeFromCart(productId) {
    const parsedProductId = Number(productId);
    const productIndex = cart.findIndex(item => item.id === parsedProductId);
    if (productIndex !== -1) {
        cart.splice(productIndex, 1); // Remove the item
        localStorage.setItem('cart', JSON.stringify(cart)); // Save updated cart
        renderCartItems(); // Re-render cart items
        updateCartCount(); // Update cart count in the navbar
    }
}

// Function to update the cart count in the navbar
function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

// Initial rendering of cart items and cart count
document.addEventListener("DOMContentLoaded", () => {
    renderCartItems();
    updateCartCount();
});
