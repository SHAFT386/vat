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
    
    // Pagination variables
    const productsPerPage = 100;
    let currentPage = 1;
    
    // Load products with pagination
    loadProducts();
    
    // Functions
    function loadProducts() {
        const productContainer = document.getElementById('product-container');
        productContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading products...</p></div>';
        
        // Generate 1000 products with the new image naming format
        const totalProducts = 250;
        const mockProducts = [];
        
        for (let i = 1; i <= totalProducts; i++) {
            mockProducts.push({
                id: i.toString(),
                image: `images/1 (${i}).png`
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
            
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="Product ${product.id}">
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
});