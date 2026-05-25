/**
 * PRODIFY // INVENTORY DASHBOARD ORCHESTRATOR
 * Core Client-Side Logic & API Integrations
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  let productsState = [];
  let currentFilters = {
    search: '',
    category: '',
    sortBy: 'newest'
  };
  let searchDebounceTimeout = null;

  // --- DOM ELEMENTS ---
  const elements = {
    tbody: document.getElementById('inventory-tbody'),
    emptyState: document.getElementById('empty-state'),
    apiStatus: document.getElementById('api-status'),
    apiStatusIndicator: document.querySelector('.status-indicator'),
    
    // Stats elements
    totalProducts: document.getElementById('val-total-products'),
    totalValue: document.getElementById('val-total-value'),
    avgPrice: document.getElementById('val-avg-price'),
    lowStock: document.getElementById('val-low-stock'),
    
    // Controls elements
    searchInput: document.getElementById('search-input'),
    filterCategory: document.getElementById('filter-category'),
    sortBy: document.getElementById('sort-by'),
    btnAddProduct: document.getElementById('btn-add-product'),
    btnResetFilters: document.getElementById('btn-reset-filters'),
    
    // Modal elements
    modal: document.getElementById('product-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalClose: document.getElementById('modal-close'),
    btnModalCancel: document.getElementById('btn-modal-cancel'),
    productForm: document.getElementById('product-form'),
    productIdInput: document.getElementById('product-id'),
    
    // Form Inputs
    inputName: document.getElementById('input-name'),
    inputCategory: document.getElementById('input-category'),
    inputPrice: document.getElementById('input-price'),
    inputStock: document.getElementById('input-stock'),
    inputDescription: document.getElementById('input-description'),
    modalErrorSummary: document.getElementById('modal-error-summary'),
    summaryErrorText: document.getElementById('summary-error-text'),
    
    // Toast Container
    toastContainer: document.getElementById('toast-container')
  };

  // --- INIT APPLICATION ---
  fetchProducts();
  setupEventListeners();

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Add Product Modal trigger
    elements.btnAddProduct.addEventListener('click', () => openModal());
    
    // Modal close hooks
    elements.modalClose.addEventListener('click', closeModal);
    elements.btnModalCancel.addEventListener('click', closeModal);
    
    // Close modal when clicking on overlay background
    elements.modal.addEventListener('click', (e) => {
      if (e.target === elements.modal) closeModal();
    });

    // Form submission
    elements.productForm.addEventListener('submit', handleFormSubmit);

    // Search input (with Debouncing)
    elements.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimeout);
      currentFilters.search = e.target.value;
      searchDebounceTimeout = setTimeout(() => {
        fetchProducts();
      }, 350); // 350ms debounce
    });

    // Category filter change
    elements.filterCategory.addEventListener('change', (e) => {
      currentFilters.category = e.target.value;
      fetchProducts();
    });

    // Sorting change
    elements.sortBy.addEventListener('change', (e) => {
      currentFilters.sortBy = e.target.value;
      fetchProducts();
    });

    // Reset filters empty state button
    elements.btnResetFilters.addEventListener('click', () => {
      elements.searchInput.value = '';
      elements.filterCategory.value = '';
      elements.sortBy.value = 'newest';
      currentFilters = { search: '', category: '', sortBy: 'newest' };
      fetchProducts();
    });

    // Real-time Field-level Form Validation Indicators
    elements.inputName.addEventListener('blur', () => validateField(elements.inputName, 'error-name', 'Name is required (min 2 chars).', (val) => val.trim().length >= 2));
    elements.inputCategory.addEventListener('blur', () => validateField(elements.inputCategory, 'error-category', 'Category is required (min 2 chars).', (val) => val.trim().length >= 2));
    elements.inputPrice.addEventListener('blur', () => validateField(elements.inputPrice, 'error-price', 'Price must be greater than 0.', (val) => Number(val) > 0));
    elements.inputStock.addEventListener('blur', () => validateField(elements.inputStock, 'error-stock', 'Stock must be a non-negative integer.', (val) => Number.isInteger(Number(val)) && Number(val) >= 0));
  }

  // --- API OPERATIONS ---

  // 1. Fetch & Filter Catalog
  async function fetchProducts() {
    showTableLoading();
    
    // Construct Query String
    const params = new URLSearchParams();
    if (currentFilters.search) params.append('search', currentFilters.search);
    if (currentFilters.category) params.append('category', currentFilters.category);
    if (currentFilters.sortBy) params.append('sortBy', currentFilters.sortBy);

    try {
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error('API server returned an error');
      
      const products = await response.json();
      productsState = products;
      
      // Update UI
      renderProductsTable(products);
      updateDashboardStats();
      setApiStatus(true);
    } catch (error) {
      console.error('Fetch error:', error);
      setApiStatus(false);
      showToast('Connection Refused', 'Could not retrieve catalog from CRUD API server.', 'error');
      renderErrorState();
    }
  }

  // 2. Add / Edit Product Submit
  async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Comprehensive client validation before send
    const isFormValid = validateAllFields();
    if (!isFormValid) {
      elements.modalErrorSummary.classList.remove('hidden');
      elements.summaryErrorText.textContent = "Please correct the highlighted form errors.";
      return;
    }
    
    elements.modalErrorSummary.classList.add('hidden');
    
    const productId = elements.productIdInput.value;
    const isEditMode = !!productId;
    
    const productPayload = {
      name: elements.inputName.value,
      category: elements.inputCategory.value,
      price: parseFloat(elements.inputPrice.value),
      stock: parseInt(elements.inputStock.value, 10),
      description: elements.inputDescription.value
    };

    const endpoint = isEditMode ? `/api/products/${productId}` : '/api/products';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productPayload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Validation messages from server
        const errorMsg = responseData.messages ? responseData.messages.join(' | ') : (responseData.message || 'Operation failed.');
        throw new Error(errorMsg);
      }

      // Success
      closeModal();
      showToast(
        isEditMode ? 'Catalog Updated' : 'Product Added',
        `Successfully saved "${productPayload.name}" in inventory.`,
        'success'
      );
      fetchProducts();
    } catch (error) {
      console.error('Submit error:', error);
      elements.modalErrorSummary.classList.remove('hidden');
      elements.summaryErrorText.textContent = error.message;
      showToast('Validation Error', error.message, 'error');
    }
  }

  // 3. Delete Product Flow
  async function deleteProduct(id, name, tableRowElement) {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Delete operation failed.');
      }

      // Premium animation fade-out before reloading state
      tableRowElement.classList.add('row-delete-fade');
      showToast('Product Removed', `"${name}" has been deleted from inventory.`, 'warning');
      
      setTimeout(() => {
        fetchProducts();
      }, 400); // match CSS transition duration

    } catch (error) {
      console.error('Delete error:', error);
      showToast('Deletion Failed', error.message, 'error');
    }
  }

  // --- UI RENDERING ---

  function renderProductsTable(products) {
    elements.tbody.innerHTML = '';

    if (products.length === 0) {
      elements.emptyState.classList.remove('hidden');
      return;
    }

    elements.emptyState.classList.add('hidden');

    products.forEach(product => {
      const tr = document.createElement('tr');
      tr.dataset.id = product.id;

      // Determine stock status and class
      let stockBadgeClass = 'badge-in-stock';
      let stockBadgeText = 'In Stock';
      
      if (product.stock === 0) {
        stockBadgeClass = 'badge-out-of-stock';
        stockBadgeText = 'Out of Stock';
      } else if (product.stock < 5) {
        stockBadgeClass = 'badge-low-stock';
        stockBadgeText = 'Low Stock';
      }

      tr.innerHTML = `
        <td>
          <div class="product-meta">
            <span class="product-name">${escapeHTML(product.name)}</span>
            <span class="product-desc" title="${escapeHTML(product.description || 'No description provided.')}">
              ${escapeHTML(product.description || 'No description.')}
            </span>
          </div>
        </td>
        <td><span class="badge badge-category">${escapeHTML(product.category)}</span></td>
        <td class="text-right font-medium">$${product.price.toFixed(2)}</td>
        <td class="text-center font-semibold">${product.stock}</td>
        <td class="text-center"><span class="badge ${stockBadgeClass}">${stockBadgeText}</span></td>
        <td class="text-right">
          <div class="action-buttons">
            <button class="btn-icon edit" title="Edit Product" data-action="edit">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-icon delete" title="Delete Product" data-action="delete">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      `;

      // Wire Row Action Handlers
      tr.querySelector('[data-action="edit"]').addEventListener('click', () => {
        openModal(product);
      });

      tr.querySelector('[data-action="delete"]').addEventListener('click', () => {
        deleteProduct(product.id, product.name, tr);
      });

      elements.tbody.appendChild(tr);
    });
  }

  function updateDashboardStats() {
    // 1. Total Products Count
    const total = productsState.length;
    elements.totalProducts.textContent = total;

    // 2. Total Value & 3. Low Stock Alerts
    let value = 0;
    let lowStockCount = 0;
    
    productsState.forEach(p => {
      value += p.price * p.stock;
      if (p.stock < 5) {
        lowStockCount++;
      }
    });

    elements.totalValue.textContent = `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    elements.lowStock.textContent = lowStockCount;

    // Pulse stats card if low stock alerts > 0
    const lowStockCard = elements.lowStock.closest('.stat-card');
    if (lowStockCount > 0) {
      lowStockCard.style.borderColor = 'rgba(245, 158, 11, 0.4)';
      lowStockCard.style.boxShadow = '0 0 15px rgba(245, 158, 11, 0.1)';
    } else {
      lowStockCard.style.borderColor = 'var(--border-color)';
      lowStockCard.style.boxShadow = 'var(--shadow-premium)';
    }

    // 4. Average Price
    const avg = total > 0 ? (productsState.reduce((sum, p) => sum + p.price, 0) / total) : 0;
    elements.avgPrice.textContent = `$${avg.toFixed(2)}`;
  }

  // --- MODAL CONTROL ---
  
  function openModal(product = null) {
    clearModalErrors();
    elements.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Lock background scroll

    if (product) {
      // Edit Mode
      elements.modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Product`;
      elements.productIdInput.value = product.id;
      elements.inputName.value = product.name;
      elements.inputCategory.value = product.category;
      elements.inputPrice.value = product.price;
      elements.inputStock.value = product.stock;
      elements.inputDescription.value = product.description || '';
    } else {
      // Create Mode
      elements.modalTitle.innerHTML = `<i class="fa-solid fa-cube"></i> Add Product`;
      elements.productIdInput.value = '';
      elements.productForm.reset();
    }
  }

  function closeModal() {
    elements.modal.classList.add('hidden');
    document.body.style.overflow = 'auto'; // Restore background scroll
    elements.productForm.reset();
    clearModalErrors();
  }

  // --- CLIENT-SIDE FORM VALIDATION HELPERS ---

  function validateField(inputElement, errorSpanId, errorMessage, validationFn) {
    const errorSpan = document.getElementById(errorSpanId);
    const value = inputElement.value;
    const isValid = validationFn(value);

    if (!isValid) {
      inputElement.style.borderColor = 'var(--danger)';
      errorSpan.textContent = errorMessage;
      return false;
    } else {
      inputElement.style.borderColor = 'var(--border-color)';
      errorSpan.textContent = '';
      return true;
    }
  }

  function validateAllFields() {
    const isNameValid = validateField(elements.inputName, 'error-name', 'Name is required (min 2 characters).', (val) => val.trim().length >= 2);
    const isCategoryValid = validateField(elements.inputCategory, 'error-category', 'Category is required (min 2 characters).', (val) => val.trim().length >= 2);
    const isPriceValid = validateField(elements.inputPrice, 'error-price', 'Price must be a positive number.', (val) => val.trim() !== '' && Number(val) > 0);
    const isStockValid = validateField(elements.inputStock, 'error-stock', 'Stock must be a non-negative integer.', (val) => val.trim() !== '' && Number.isInteger(Number(val)) && Number(val) >= 0);

    return isNameValid && isCategoryValid && isPriceValid && isStockValid;
  }

  function clearModalErrors() {
    elements.modalErrorSummary.classList.add('hidden');
    const inputs = [elements.inputName, elements.inputCategory, elements.inputPrice, elements.inputStock];
    inputs.forEach(input => input.style.borderColor = 'var(--border-color)');
    
    const errors = ['error-name', 'error-category', 'error-price', 'error-stock', 'error-description'];
    errors.forEach(errId => document.getElementById(errId).textContent = '');
  }

  // --- TOAST SYSTEMS ---

  function showToast(title, message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Choose icon based on toast type
    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    else if (type === 'warning') iconClass = 'fa-circle-exclamation';
    else if (type === 'error') iconClass = 'fa-triangle-exclamation';

    toast.innerHTML = `
      <div class="toast-icon"><i class="fa-solid ${iconClass}"></i></div>
      <div class="toast-content">
        <div class="toast-title">${escapeHTML(title)}</div>
        <div class="toast-message">${escapeHTML(message)}</div>
      </div>
    `;

    elements.toastContainer.appendChild(toast);

    // Auto remove logic
    setTimeout(() => {
      toast.classList.add('removing');
      toast.addEventListener('transitionend', () => {
        toast.remove();
      });
    }, 4000);
  }

  // --- MISC UTILITIES ---

  function setApiStatus(isOnline) {
    if (isOnline) {
      elements.apiStatus.textContent = 'API: Connected';
      elements.apiStatusIndicator.classList.remove('offline');
    } else {
      elements.apiStatus.textContent = 'API: Connection Failed';
      elements.apiStatusIndicator.classList.add('offline');
    }
  }

  function showTableLoading() {
    elements.tbody.innerHTML = `
      <tr>
        <td colspan="6" class="table-loading">
          <div class="spinner"></div>
          <span>Refresing inventory...</span>
        </td>
      </tr>
    `;
  }

  function renderErrorState() {
    elements.tbody.innerHTML = `
      <tr>
        <td colspan="6" class="table-loading" style="color: var(--danger)">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block"></i>
          <span>Failed to connect to backend server. Ensure Express is running locally on port 3000.</span>
        </td>
      </tr>
    `;
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
});
