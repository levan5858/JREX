import { 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Wait for Firebase to be initialized
let auth, db;

// Check if Firebase is ready
function waitForFirebase() {
    return new Promise((resolve) => {
        const checkFirebase = setInterval(() => {
            if (window.firebaseAuth && window.firebaseDb) {
                auth = window.firebaseAuth;
                db = window.firebaseDb;
                clearInterval(checkFirebase);
                resolve();
            }
        }, 100);
    });
}

async function init() {
    await waitForFirebase();
    
    // Check auth state
    onAuthStateChanged(auth, (user) => {
        if (user) {
            showAdminPanel();
            loadProducts();
        } else {
            showLoginForm();
        }
    });

    // Login form handler
    document.getElementById('login').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Auth state change will handle UI update
        } catch (error) {
            errorDiv.textContent = getErrorMessage(error.code);
            console.error('Login error:', error);
        }
    });

    // Add product form handler
    document.getElementById('addProductForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('newProductName').value;
        const rate = parseFloat(document.getElementById('newProductRate').value);
        const type = document.getElementById('newProductType').value;

        try {
            await addProduct(name, rate, type);
            this.reset();
        } catch (error) {
            alert('Error adding product: ' + error.message);
            console.error('Add product error:', error);
        }
    });
}

function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        default:
            return 'Login failed. Please check your credentials.';
    }
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('adminPanel').classList.remove('active');
}

function showAdminPanel() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminPanel').classList.add('active');
}

async function loadProducts() {
    const productsList = document.getElementById('productsList');
    const productsLoading = document.getElementById('productsLoading');
    
    try {
        // Set up real-time listener
        const productsRef = collection(db, 'products');
        const q = query(productsRef, orderBy('name'));
        
        onSnapshot(q, (snapshot) => {
            productsLoading.style.display = 'none';
            productsList.style.display = 'block';
            productsList.innerHTML = '';

            if (snapshot.empty) {
                productsList.innerHTML = '<div class="loading">No products found. Add your first product above!</div>';
                return;
            }

            snapshot.forEach((docSnapshot) => {
                const product = { id: docSnapshot.id, ...docSnapshot.data() };
                renderProduct(product);
            });
        }, (error) => {
            productsLoading.textContent = 'Error loading products. Please refresh the page.';
            console.error('Error loading products:', error);
        });
    } catch (error) {
        productsLoading.textContent = 'Error loading products. Please refresh the page.';
        console.error('Error setting up product listener:', error);
    }
}

function renderProduct(product) {
    const productsList = document.getElementById('productsList');
    
    const productItem = document.createElement('div');
    productItem.className = 'product-item';
    productItem.innerHTML = `
        <div style="flex: 1;">
            <strong style="color: var(--accent-pink);">${product.name}</strong>
            <div style="color: var(--text-gray); font-size: 0.9rem; margin-top: 0.25rem;">${product.type}</div>
        </div>
        <input type="number" value="${product.rate}" step="0.01" data-product-id="${product.id}" onchange="updateProductRate('${product.id}', this.value)">
        <span style="color: var(--text-gray); margin: 0 1rem;">₦</span>
        <button class="btn-small" onclick="editProduct('${product.id}', '${product.name.replace(/'/g, "\\'")}')">Edit</button>
        <button class="btn-small btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
    `;
    productsList.appendChild(productItem);
}

async function addProduct(name, rate, type) {
    try {
        const productsRef = collection(db, 'products');
        await addDoc(productsRef, {
            name: name,
            rate: rate,
            type: type,
            createdAt: new Date()
        });
    } catch (error) {
        throw error;
    }
}

async function updateProductRate(id, newRate) {
    try {
        const productRef = doc(db, 'products', id);
        await updateDoc(productRef, {
            rate: parseFloat(newRate)
        });
    } catch (error) {
        alert('Error updating rate: ' + error.message);
        console.error('Update error:', error);
    }
}

async function editProduct(id, currentName) {
    const newName = prompt('Enter new product name:', currentName);
    if (newName && newName !== currentName) {
        try {
            const productRef = doc(db, 'products', id);
            await updateDoc(productRef, {
                name: newName
            });
        } catch (error) {
            alert('Error updating product: ' + error.message);
            console.error('Edit error:', error);
        }
    }
}

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const productRef = doc(db, 'products', id);
            await deleteDoc(productRef);
        } catch (error) {
            alert('Error deleting product: ' + error.message);
            console.error('Delete error:', error);
        }
    }
}

async function logout() {
    try {
        await signOut(auth);
        // Auth state change will handle UI update
    } catch (error) {
        alert('Error signing out: ' + error.message);
        console.error('Logout error:', error);
    }
}

// Make functions globally available for inline handlers
window.updateProductRate = updateProductRate;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.logout = logout;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
