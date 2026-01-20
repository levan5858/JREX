// Using CoinGecko Free API
const CRYPTO_IDS = ['bitcoin', 'ethereum', 'binancecoin', 'tether', 'solana', 'cardano'];
const API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=' + CRYPTO_IDS.join(',') + '&vs_currencies=usd';

async function fetchCryptoPrices() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        const tickerContainer = document.getElementById('crypto-ticker');
        tickerContainer.innerHTML = '';
        
        CRYPTO_IDS.forEach(cryptoId => {
            if (data[cryptoId]) {
                const price = data[cryptoId].usd;
                const displayName = cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1).replace('coin', '');
                
                const tickerItem = document.createElement('div');
                tickerItem.className = 'ticker-item';
                tickerItem.innerHTML = `
                    <span class="ticker-name">${displayName}</span>
                    <span class="ticker-price">$${price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                `;
                
                tickerContainer.appendChild(tickerItem);
            }
        });
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
        document.getElementById('crypto-ticker').innerHTML = `
            <div class="ticker-item">
                <span class="ticker-name">Error</span>
                <span class="ticker-price">Unable to load prices</span>
            </div>
        `;
    }
}

// Fetch prices on load and every 60 seconds
fetchCryptoPrices();
setInterval(fetchCryptoPrices, 60000);
