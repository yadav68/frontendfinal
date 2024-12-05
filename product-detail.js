// Load and display the cart count when the page loads
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount(); // Update the cart count on load
    loadProductDetails(); // Load product details and related products
});

// Function to update the cart count in the navbar
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById("cart-count").textContent = cartCount;
}

// Function to load product details
function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
        window.location.href = "index.html";
        return;
    }

    // Fetch product data
    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            const product = products.find(p => p.id === parseInt(productId));

            if (!product) {
                window.location.href = "index.html";
                return;
            }

            // Populate product details
            document.getElementById("product-image").src = product.image;
            document.getElementById("product-name").textContent = product.name;
            document.getElementById("product-category").innerHTML = `Category: <span>${product.category}</span>`;
            document.getElementById("product-description").textContent = product.description;
            document.getElementById("product-price").textContent = `$${product.price.toFixed(2)}`;

            // Attach a single event listener to Add to Cart button
            document.getElementById("add-to-cart-btn").onclick = () => {
                addToCart(product);
            };

            // Render related products
            renderRelatedProducts(products, product.category, product.id);
        })
        .catch(error => console.error("Error fetching product data:", error));
}

// Function to add product to cart
function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount(); // Update cart count dynamically
    showTemporaryMessage("Item added to cart!", "success");
}

// Function to render related products
function renderRelatedProducts(products, category, currentProductId) {
    const relatedProductsContainer = document.getElementById("related-products-container");
    relatedProductsContainer.innerHTML = "";

    // Filter products by category and exclude the current product
    const relatedProducts = products.filter(
        p => p.category === category && p.id !== parseInt(currentProductId)
    );

    if (relatedProducts.length === 0) {
        relatedProductsContainer.innerHTML = "<p>No related products found.</p>";
        return;
    }

    relatedProducts.forEach(product => {
        const productCard = `
            <div class="product-card">
                <a href="product-detail.html?id=${product.id}" class="product-link">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                </a>
                <div class="product-details">
                    <a href="product-detail.html?id=${product.id}" class="product-link">
                        <h3 class="product-name">${product.name}</h3>
                    </a>
                    <p class="product-category">Category: ${product.category}</p>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        `;
        relatedProductsContainer.innerHTML += productCard;
    });

    // Add event listeners to "Add to Cart" buttons for related products
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const productId = parseInt(button.getAttribute('data-id'));
            const product = products.find(p => p.id === productId);
            if (product) addToCart(product);
        });
    });
}

function showTemporaryMessage(message, type = "info") {
    const messageBox = document.createElement("div");
    messageBox.className = `message-box ${type}`;
    messageBox.textContent = message;

    // Append the message box to the body
    document.body.appendChild(messageBox);

    // Automatically remove the message after 3 seconds
    setTimeout(() => {
        if (messageBox) messageBox.remove();
    }, 3000); // Message disappears after 3 seconds
}



