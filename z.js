document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navList = document.querySelector('.nav-list');
    
    mobileMenu.addEventListener('click', function() {
        this.classList.toggle('active');
        navList.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-list a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            navList.classList.remove('active');
        });
    });
    
    // Floating Action Button
    const fabMain = document.querySelector('.fab-main');
    const fabOptions = document.querySelector('.fab-options');
    
    fabMain.addEventListener('click', function() {
        fabOptions.classList.toggle('active');
    });
    
    // Shopping Cart functionality
    const cartBtn = document.getElementById('cart-btn');
    const closeCart = document.getElementById('close-cart');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const checkoutBtn = document.getElementById('checkout-btn');
    const closeModal = document.getElementById('close-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Open cart
    cartBtn.addEventListener('click', function(e) {
        e.preventDefault();
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        updateCartUI();
    });
    
    // Close cart
    closeCart.addEventListener('click', function() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    });
    
    cartOverlay.addEventListener('click', function() {
        cartSidebar.classList.remove('active');
        this.classList.remove('active');
        checkoutModal.classList.remove('active');
    });
    
    // Open checkout modal
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) return;
        cartSidebar.classList.remove('active');
        checkoutModal.classList.add('active');
        updateOrderSummary();
    });
    
    // Close checkout modal
    closeModal.addEventListener('click', function() {
        checkoutModal.classList.remove('active');
        cartOverlay.classList.remove('active');
    });
    
    // Add to cart functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const productCard = e.target.closest('.product-card');
            const productId = productCard.dataset.id;
            const productTitle = productCard.querySelector('.product-title').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            const productImage = productCard.querySelector('.product-image img').src;
            
            addToCart(productId, productTitle, productPrice, productImage);
        }
    });
    
    // Cart quantity controls
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-btn')) {
            const cartItem = e.target.closest('.cart-item');
            const productId = cartItem.dataset.id;
            const isIncrease = e.target.classList.contains('increase');
            
            updateCartItemQuantity(productId, isIncrease);
        }
        
        if (e.target.classList.contains('remove-item')) {
            const cartItem = e.target.closest('.cart-item');
            const productId = cartItem.dataset.id;
            
            removeFromCart(productId);
        }
    });
    
    // Checkout form submission
    const checkoutForm = document.getElementById('checkout-form');
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('checkout-name').value;
        const phone = document.getElementById('checkout-phone').value;
        const email = document.getElementById('checkout-email').value;
        const address = document.getElementById('checkout-address').value;
        const notes = document.getElementById('checkout-notes').value;
        
        // Format WhatsApp message
        let message = `*New Order from SIEGE MODERN APPLIANCES Website*%0A%0A`;
        message += `*Customer Name:* ${name}%0A`;
        message += `*Phone:* ${phone}%0A`;
        if (email) message += `*Email:* ${email}%0A`;
        message += `*Delivery Address:* ${address}%0A`;
        if (notes) message += `*Additional Notes:* ${notes}%0A%0A`;
        
        message += `*Order Details:*%0A`;
        cart.forEach(item => {
            message += `- ${item.title} (${item.quantity} x ${item.price})%0A`;
        });
        
        message += `%0A*Total Amount:* ${calculateCartTotal()}`;
        
        // Open WhatsApp with the message
        window.open(`https://wa.me/256700559785?text=${message}`, '_blank');
        
        // Clear cart and close modals
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        checkoutModal.classList.remove('active');
        cartOverlay.classList.remove('active');
        
        // Show success message
        alert('Your order has been placed successfully! We will contact you shortly.');
    });
    
    // Product sorting
    const sortSelect = document.getElementById('sort');
    sortSelect.addEventListener('change', function() {
        sortProducts(this.value);
    });
    
    // Product search
    const productSearch = document.getElementById('product-search');
    const searchBtn = document.querySelector('.search-btn');
    
    searchBtn.addEventListener('click', function() {
        searchProducts(productSearch.value);
    });
    
    productSearch.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchProducts(this.value);
        }
    });
    
    // Pagination variables
    const productsPerPage = 166;
    let currentPage = 1;
    
    // Load products with pagination
    loadProducts();
    
    // Initialize cart count
    updateCartCount();
    
    // Add notification style
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 10000;
        }
        
        .notification.show {
            opacity: 1;
        }
        
        .notification i {
            margin-right: 10px;
            font-size: 1.2rem;
        }
    `;
    document.head.appendChild(style);
    
    // Functions
    function addToCart(id, title, price, image) {
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id,
                title,
                price,
                image,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showAddToCartNotification(title);
    }
    
    function updateCartItemQuantity(id, isIncrease) {
        const item = cart.find(item => item.id === id);
        
        if (item) {
            if (isIncrease) {
                item.quantity += 1;
            } else {
                item.quantity -= 1;
                if (item.quantity < 1) {
                    removeFromCart(id);
                    return;
                }
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartUI();
        }
    }
    
    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
        updateCartCount();
    }
    
    function updateCartUI() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            cartTotal.textContent = 'UGX 0';
            return;
        }
        
        cartItemsContainer.innerHTML = '';
        
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.dataset.id = item.id;
            
            cartItem.innerHTML = `
                <div class="cart-item-img">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <p class="cart-item-price">${item.price}</p>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn decrease">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn increase">+</button>
                        </div>
                        <button class="remove-item">Remove</button>
                    </div>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItem);
        });
        
        cartTotal.textContent = calculateCartTotal();
    }
    
    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        
        cartCount.textContent = totalItems;
        
        if (totalItems > 0) {
            cartCount.style.display = 'flex';
        } else {
            cartCount.style.display = 'none';
        }
    }
    
    function calculateCartTotal() {
        return cart.reduce((total, item) => {
            const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
            return total + (price * item.quantity);
        }, 0).toLocaleString('en-US', { style: 'currency', currency: 'UGX' });
    }
    
    function showAddToCartNotification(productName) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${productName} added to cart</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    function updateOrderSummary() {
        const orderSummary = document.getElementById('order-summary-items');
        const orderTotal = document.getElementById('order-total');
        
        orderSummary.innerHTML = '';
        
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-summary-item';
            itemElement.innerHTML = `
                <span>${item.title} (${item.quantity})</span>
                <span>${item.price}</span>
            `;
            orderSummary.appendChild(itemElement);
        });
        
        orderTotal.textContent = calculateCartTotal();
    }
    
    function loadProducts() {
        const productContainer = document.getElementById('product-container');
        productContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading products...</p></div>';
        
        // Generate 1000 mock products
        const totalProducts = 1000;
        const categories = ['Televisions', 'Audio Systems', 'Home Appliances', 'Kitchen Appliances', 'Computers & Laptops', 'Mobile Phones'];
        const mockProducts = [];
        
        for (let i = 1; i <= totalProducts; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const price = Math.floor(Math.random() * 5000000) + 100000; // Random price between 100,000 and 5,100,000 UGX
            
            mockProducts.push({
                id: i.toString(),
                title: `${category.split(' ')[0]} Product ${i}`,
                price: `UGX ${price.toLocaleString()}`,
                image: `https://picsum.photos/500/300?random=${i}`,
                rating: Math.floor(Math.random() * 5) + 1,
                category: category,
                date: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
            });
        }
        
        // Display first page
        displayProducts(mockProducts.slice(0, productsPerPage));
        
        // Setup pagination
        setupPagination(mockProducts);
    }
    
    function displayProducts(products) {
        const productContainer = document.getElementById('product-container');
        
        if (products.length === 0) {
            productContainer.innerHTML = '<p class="no-products">No products found</p>';
            return;
        }
        
        productContainer.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.id = product.id;
            productCard.dataset.category = product.category;
            productCard.dataset.price = parseFloat(product.price.replace(/[^0-9.]/g, ''));
            productCard.dataset.title = product.title.toLowerCase();
            productCard.dataset.date = product.date;
            
            // Generate star ratings
            const stars = Array(5).fill('<i class="far fa-star"></i>')
                .fill('<i class="fas fa-star"></i>', 0, product.rating)
                .join('');
            
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-price">${product.price}</p>
                    <div class="product-rating">
                        ${stars}
                    </div>
                    <button class="add-to-cart">Add to Cart</button>
                </div>
            `;
            
            productContainer.appendChild(productCard);
        });
    }
    
    function setupPagination(products) {
        const paginationContainer = document.getElementById('pagination');
        const totalPages = Math.ceil(products.length / productsPerPage);
        
        paginationContainer.innerHTML = '';
        
        // Previous button
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '&laquo;';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateProductsDisplay(products);
            }
        });
        paginationContainer.appendChild(prevButton);
        
        // Page numbers
        const pageNumbers = document.createElement('ul');
        pageNumbers.className = 'page-numbers';
        
        // Always show first page
        addPageNumber(1, products, pageNumbers);
        
        // Show ellipsis if needed
        if (currentPage > 3) {
            const ellipsis = document.createElement('li');
            ellipsis.innerHTML = '<span>...</span>';
            pageNumbers.appendChild(ellipsis);
        }
        
        // Show current page and neighbors
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = startPage; i <= endPage; i++) {
            addPageNumber(i, products, pageNumbers);
        }
        
        // Show ellipsis if needed
        if (currentPage < totalPages - 2) {
            const ellipsis = document.createElement('li');
            ellipsis.innerHTML = '<span>...</span>';
            pageNumbers.appendChild(ellipsis);
        }
        
        // Always show last page if different from first
        if (totalPages > 1) {
            addPageNumber(totalPages, products, pageNumbers);
        }
        
        paginationContainer.appendChild(pageNumbers);
        
        // Next button
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '&raquo;';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateProductsDisplay(products);
            }
        });
        paginationContainer.appendChild(nextButton);
    }
    
    function addPageNumber(pageNumber, products, container) {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.textContent = pageNumber;
        button.className = currentPage === pageNumber ? 'active' : '';
        
        button.addEventListener('click', () => {
            currentPage = pageNumber;
            updateProductsDisplay(products);
        });
        
        li.appendChild(button);
        container.appendChild(li);
    }
    
    function updateProductsDisplay(products) {
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const productsToDisplay = products.slice(startIndex, endIndex);
        
        displayProducts(productsToDisplay);
        setupPagination(products);
        
        // Scroll to top of products section
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    }
    
    function sortProducts(sortBy) {
        const productContainer = document.getElementById('product-container');
        const products = Array.from(productContainer.children);
        
        products.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
                case 'price-high':
                    return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
                case 'name-asc':
                    return a.dataset.title.localeCompare(b.dataset.title);
                case 'name-desc':
                    return b.dataset.title.localeCompare(a.dataset.title);
                case 'newest':
                    return new Date(b.dataset.date) - new Date(a.dataset.date);
                case 'popular':
                    // In a real app, you would use actual popularity data
                    return Math.random() - 0.5;
                default:
                    return 0;
            }
        });
        
        // Reappend sorted products
        products.forEach(product => productContainer.appendChild(product));
    }
    
    function searchProducts(query) {
        const productContainer = document.getElementById('product-container');
        const products = Array.from(productContainer.children);
        const searchTerm = query.toLowerCase().trim();
        
        products.forEach(product => {
            const title = product.dataset.title;
            const category = product.dataset.category.toLowerCase();
            
            if (title.includes(searchTerm) || category.includes(searchTerm)) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    }
});