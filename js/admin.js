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

let auth, db;

const ADMIN_EMAIL = 'admin@jrex.com';

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

    onAuthStateChanged(auth, (user) => {
        if (user) {
            showAdminPanel();
            loadProducts();
        } else {
            showLoginForm();
        }
    });

    document.getElementById('login').addEventListener('submit', async function (e) {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        try {
            await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
        } catch (error) {
            errorDiv.textContent = 'Incorrect password.';
            console.error('Login error:', error);
        }
    });

    document.getElementById('addProductForm').addEventListener('submit', async function (e) {
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
        <input type="number" value="${product.rate}" step="0.01" onchange="updateProductRate('${product.id}', this.value)">
        <span style="color: var(--text-gray); margin: 0 1rem;">₦</span>
        <button class="btn-small" onclick="editProduct('${product.id}', '${product.name.replace(/'/g, "\\'")}')">Edit</button>
        <button class="btn-small btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
    `;
    productsList.appendChild(productItem);
}

async function addProduct(name, rate, type) {
    const productsRef = collection(db, 'products');
    await addDoc(productsRef, { name, rate, type, createdAt: new Date() });
}

async function updateProductRate(id, newRate) {
    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, { rate: parseFloat(newRate) });
}

async function editProduct(id, currentName) {
    const newName = prompt('Enter new product name:', currentName);
    if (newName && newName !== currentName) {
        const productRef = doc(db, 'products', id);
        await updateDoc(productRef, { name: newName });
    }
}

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        const productRef = doc(db, 'products', id);
        await deleteDoc(productRef);
    }
}

async function logout() {
    await signOut(auth);
}

window.updateProductRate = updateProductRate;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.logout = logout;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
