let allProducts = []; // Store all products globally
const productsPerPage = 8; // Number of products per page
let currentPage = 1; // Track the current page
let cart = JSON.parse(localStorage.getItem('cart')) || []; // Load cart from localStorage or use empty cart



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




// Show the pop-up
function showPopup(message, callback) {
    const popup = document.getElementById("popup");
    const popupMessage = document.getElementById("popup-message");
    const popupClose = document.getElementById("popup-close");

    // Set the message
    popupMessage.textContent = message;

    // Show the pop-up
    popup.style.display = "flex";

    // Close the pop-up
    popupClose.onclick = () => {
        popup.style.display = "none"; // Hide the pop-up
        if (callback) callback(); // Execute callback if provided
    };
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





// Fetch product data
fetch('products.json')
    .then(response => response.json())
    .then(products => {
        allProducts = products; // Save products for filtering
        renderProducts(products, currentPage); // Initially render all products
        renderPagination(products); // Render pagination controls
        updateCartCount(); // Update cart count on page load
        
   // Add event listeners for search after products are loaded
   document.getElementById("search-button").addEventListener("click", handleSearch);
   document.getElementById("search-input").addEventListener("keyup", handleSearchOnEnter);

    })
    .catch(error => console.error('Error fetching product data:', error));

// Function to render products on the page
// function renderProducts(products, page) {
//     const productContainer = document.querySelector('#product-container');
//     productContainer.innerHTML = ''; // Clear previous content
//     const startIndex = (page - 1) * productsPerPage;
//     const endIndex = startIndex + productsPerPage;
//     const productsToDisplay = products.slice(startIndex, endIndex);

//     productsToDisplay.forEach(product => {
//         const cardHTML = `
//             <div class="product-card">
//                 <a href="product-detail.html?id=${product.id}" class="product-link">
//                     <img src="${product.image}" alt="${product.name}" class="product-image"></a>
//                     <div class="product-details">
//                         <h3 class="product-name">${product.name}</h3>
//                         <p class="product-category">Category: ${product.category}</p>
//                         <p class="product-description">${product.description}</p>
//                         <p class="product-price">$${product.price.toFixed(2)}</p>
//                         <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
//                     </div>
//             </div>
//         `;
//         productContainer.innerHTML += cardHTML;
//     });

//     // Add event listeners to "Add to Cart" buttons
//     document.querySelectorAll('.add-to-cart').forEach(button => {
//         button.addEventListener('click', () => {
//             const productId = parseInt(button.getAttribute('data-id')); // Ensure it's an integer
//             addToCart(productId);
//         });
//     });
// }


document.getElementById("search-button").addEventListener("click", () => {
    const query = document.getElementById("search-input").value.trim().toLowerCase();
    if (query) {
        const filteredProducts = allProducts.filter(product => 
            product.name.toLowerCase().includes(query) || 
            product.category.toLowerCase().includes(query) || 
            product.description.toLowerCase().includes(query)
        );
        currentPage = 1; // Reset to the first page
        renderProducts(filteredProducts, currentPage);
        renderPagination(filteredProducts); // Update pagination for search results
    } else {
        // If search input is empty, show all products
        renderProducts(allProducts, currentPage);
        renderPagination(allProducts);
    }
});

document.getElementById("search-input").addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        document.getElementById("search-button").click();
    }
});











function renderProducts(products, page) {
    const productContainer = document.querySelector('#product-container');
    productContainer.innerHTML = ''; // Clear previous content
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToDisplay = products.slice(startIndex, endIndex);
    if (products.length === 0) {
        productContainer.innerHTML = '<p>No products found.</p>';
        return;
    }
    productContainer.classList.toggle('single-result', products.length === 1); 
    productsToDisplay.forEach(product => {
        const cardHTML = `
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
        productContainer.innerHTML += cardHTML;
    });

    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const productId = parseInt(button.getAttribute('data-id'));
            addToCart(productId);
        });
    });
}


// Function to add a product to the cart
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        // Check if the product is already in the cart
        const existingProduct = cart.find(item => item.id === product.id);
        if (existingProduct) {
            existingProduct.quantity += 1; // Increase quantity if already in cart
        } else {
            // Add new product with quantity 1 if not in cart
            cart.push({...product, quantity: 1});
        }
        localStorage.setItem('cart', JSON.stringify(cart)); // Save the updated cart to localStorage
        updateCartCount(); // Update the cart count in the navbar
        showTemporaryMessage("Item added to cart!", "success");
    }
}

// Function to update the cart count in the navbar
function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0); // Count total items in the cart
    document.getElementById('cart-count').textContent = cartCount; // Update the cart count in the navbar
}

// Function to render pagination controls (Box-Type)
function renderPagination(products) {
    const paginationContainer = document.querySelector('#pagination-controls');
    paginationContainer.innerHTML = ''; // Clear previous pagination controls

    const totalPages = Math.ceil(products.length / productsPerPage); // Calculate total number of pages

    // Create Previous Button
    const prevButton = document.createElement('button');
    prevButton.classList.add('pagination-btn');
    prevButton.innerText = 'Previous';
    prevButton.disabled = currentPage === 1; // Disable if on the first page
    prevButton.addEventListener('click', () => changePage(currentPage - 1, products));

    // Add Previous button to pagination container
    paginationContainer.appendChild(prevButton);

    // Display page number buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.classList.add('page-btn');
        pageButton.innerText = i;
        pageButton.disabled = i === currentPage; // Disable the current page button
        pageButton.addEventListener('click', () => changePage(i, products));

        paginationContainer.appendChild(pageButton);
    }

    // Create Next Button
    const nextButton = document.createElement('button');
    nextButton.classList.add('pagination-btn');
    nextButton.innerText = 'Next';
    nextButton.disabled = currentPage === totalPages; // Disable if on the last page
    nextButton.addEventListener('click', () => changePage(currentPage + 1, products));

    // Add Next button to pagination container
    paginationContainer.appendChild(nextButton);
}

// Function to handle page change
function changePage(page, products) {
    const totalPages = Math.ceil(products.length / productsPerPage);
    
    // Ensure the page number is within valid bounds
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    currentPage = page; // Update the current page number
    renderProducts(products, currentPage); // Render products for the new page
    renderPagination(products); // Re-render pagination controls
}

// Filter products by category
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
        const category = button.getAttribute('data-category');
        let filteredProducts;

        if (category === 'All') {
            filteredProducts = allProducts; // Show all products
        } else {
            filteredProducts = allProducts.filter(product => product.category === category);
        }

        currentPage = 1; // Reset to first page when filtering
        renderProducts(filteredProducts, currentPage); // Render filtered products
        renderPagination(filteredProducts); // Render pagination for filtered products
    });
});

// Load the cart data from localStorage and render cart items
document.addEventListener('DOMContentLoaded', () => {
    renderCartItems();  // Display cart items when the page loads
    updateCartCount();  // Update cart count in the navbar
});

// Function to render cart items
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; // Clear previous items
    let totalPrice = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    cart.forEach(item => {
        const itemHTML = `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p class="cart-item-price">$${item.price}</p>
                    <p class="cart-item-quantity">Quantity: ${item.quantity}</p>
                    <button class="remove-item" data-id="${item.id}">Remove</button>
                </div>
            </div>
        `;
        cartItemsContainer.innerHTML += itemHTML;
        totalPrice += item.price * item.quantity;
    });

    // Update total price
    document.getElementById('total-price').textContent = totalPrice.toFixed(2);

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.getAttribute('data-id');
            removeFromCart(productId);
        });
    });
}

// Function to remove a product from the cart
function removeFromCart(productId) {
    const productIndex = cart.findIndex(item => item.id === parseInt(productId)); // Convert to integer
    if (productIndex !== -1) {
        cart.splice(productIndex, 1);  // Remove the item from the cart array
        localStorage.setItem('cart', JSON.stringify(cart));  // Save the updated cart to localStorage
        renderCartItems();  // Re-render the cart items
        updateCartCount();  // Update the cart count in the navbar
    }
}
