// Main JavaScript for MaltaGovAuctions

document.addEventListener('DOMContentLoaded', function() {
    console.log('MaltaGovAuctions app initialized');
    
    // Fetch all auction assets on page load
    fetchAuctionAssets();
    
    // Filter buttons functionality
    const filterButtons = document.querySelectorAll('.filters .btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter logic
            const filterType = this.textContent.toLowerCase();
            console.log('Filtering by:', filterType);
            
            if (filterType === 'all') {
                fetchAuctionAssets();
            } else if (['vessels', 'real estate', 'vehicles', 'currency'].includes(filterType)) {
                // Convert UI filter name to API type parameter
                const typeMap = {
                    'vessels': 'vessel',
                    'real estate': 'real_estate',
                    'vehicles': 'vehicle',
                    'currency': 'currency'
                };
                fetchAuctionAssetsByType(typeMap[filterType]);
            }
        });
    });
    
    // Add event delegation for view details buttons
    document.getElementById('auction-listings').addEventListener('click', function(event) {
        if (event.target.classList.contains('btn') && event.target.textContent === 'View Details') {
            const card = event.target.closest('.auction-card');
            const title = card.querySelector('.card-title').textContent;
            const details = card.dataset.details ? JSON.parse(card.dataset.details) : {};
            
            showAssetDetails(title, details);
        }
    });
});

// Fetch all auction assets
async function fetchAuctionAssets() {
    try {
        // In a real implementation, this would fetch from the API
        // For demo purposes, we'll use mock data
        const mockAssets = [
            {
                type: 'vessel',
                seizureReason: 'debt',
                legalStatus: {
                    unSanctionsCompliance: true,
                    localCourtOrder: 'MT/ARR/2025-087'
                },
                imoNumber: '9456782',
                arrestWarrantId: 'MT/ARR/2025-087',
                description: 'Seized Tanker (IMO: 9456782)',
                debtAmount: '€214,500',
                source: 'Transport Malta',
                dateAdded: new Date().toISOString()
            },
            {
                type: 'currency',
                seizureReason: 'sanctions',
                legalStatus: {
                    unSanctionsCompliance: false,
                    localCourtOrder: null
                },
                contrabandType: 'currency',
                description: 'Russian-Minted Libyan Dinar',
                value: '€926,000,000',
                origin: 'Russia',
                source: 'Customs Department',
                dateAdded: new Date().toISOString()
            },
            {
                type: 'vehicle',
                seizureReason: 'contraband',
                legalStatus: {
                    unSanctionsCompliance: true,
                    localCourtOrder: null
                },
                description: 'Luxury SUV (2023)',
                value: '€95,000',
                origin: 'Libya',
                source: 'Customs Department',
                dateAdded: new Date().toISOString()
            },
            {
                type: 'real_estate',
                seizureReason: 'debt',
                legalStatus: {
                    unSanctionsCompliance: true,
                    localCourtOrder: 'MT/COURT/2025-112'
                },
                description: 'Waterfront Villa in St. Julian\'s',
                debtAmount: '€1,250,000',
                source: 'Court-Ordered Sales',
                dateAdded: new Date().toISOString()
            }
        ];
        
        // Render the assets
        renderAuctionItems(mockAssets);
        
        // In production, this would be:
        // const response = await fetch('/api/assets');
        // if (!response.ok) throw new Error('Failed to fetch assets');
        // const assets = await response.json();
        // renderAuctionItems(assets);
    } catch (error) {
        console.error('Error fetching auction assets:', error);
        showErrorMessage('Failed to load auction data. Please try again later.');
    }
}

// Fetch auction assets by type
async function fetchAuctionAssetsByType(type) {
    try {
        console.log(`Fetching assets of type: ${type}`);
        
        // In a real implementation, this would fetch from the API
        // For demo purposes, we'll filter our mock data
        const mockAssets = [
            {
                type: 'vessel',
                seizureReason: 'debt',
                legalStatus: {
                    unSanctionsCompliance: true,
                    localCourtOrder: 'MT/ARR/2025-087'
                },
                imoNumber: '9456782',
                arrestWarrantId: 'MT/ARR/2025-087',
                description: 'Seized Tanker (IMO: 9456782)',
                debtAmount: '€214,500',
                source: 'Transport Malta',
                dateAdded: new Date().toISOString()
            },
            {
                type: 'vessel',
                seizureReason: 'debt',
                legalStatus: {
                    unSanctionsCompliance: true,
                    localCourtOrder: 'MT/ARR/2025-092'
                },
                imoNumber: '8765432',
                arrestWarrantId: 'MT/ARR/2025-092',
                description: 'Commercial Yacht (IMO: 8765432)',
                debtAmount: '€175,000',
                source: 'Transport Malta',
                dateAdded: new Date().toISOString()
            },
            {
                type: 'currency',
                seizureReason: 'sanctions',
                legalStatus: {
                    unSanctionsCompliance: false,
                    localCourtOrder: null
                },
                contrabandType: 'currency',
                description: 'Russian-Minted Libyan Dinar',
                value: '€926,000,000',
                origin: 'Russia',
                source: 'Customs Department',
                dateAdded: new Date().toISOString()
            },
            {
                type: 'vehicle',
                seizureReason: 'contraband',
                legalStatus: {
                    unSanctionsCompliance: true,
                    localCourtOrder: null
                },
                description: 'Luxury SUV (2023)',
                value: '€95,000',
                origin: 'Libya',
                source: 'Customs Department',
                dateAdded: new Date().toISOString()
            },
            {
                type: 'real_estate',
                seizureReason: 'debt',
                legalStatus: {
                    unSanctionsCompliance: true,
                    localCourtOrder: 'MT/COURT/2025-112'
                },
                description: 'Waterfront Villa in St. Julian\'s',
                debtAmount: '€1,250,000',
                source: 'Court-Ordered Sales',
                dateAdded: new Date().toISOString()
            }
        ];
        
        // Filter by type
        const filteredAssets = mockAssets.filter(asset => asset.type === type);
        
        // Render the filtered assets
        renderAuctionItems(filteredAssets);
        
        // In production, this would be:
        // const response = await fetch(`/api/assets/type/${type}`);
        // if (!response.ok) throw new Error(`Failed to fetch ${type} assets`);
        // const assets = await response.json();
        // renderAuctionItems(assets);
    } catch (error) {
        console.error(`Error fetching ${type} assets:`, error);
        showErrorMessage(`Failed to load ${type} auction data. Please try again later.`);
    }
}

// Render auction items dynamically
function renderAuctionItems(auctions) {
    const container = document.getElementById('auction-listings');
    
    // Clear existing items
    container.innerHTML = '';
    
    if (auctions.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="alert alert-info">No auction items found matching your criteria.</p></div>';
        return;
    }
    
    // Render each auction item
    auctions.forEach(asset => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';
        
        // Store asset details as JSON in data attribute for modal
        card.dataset.details = JSON.stringify(asset);
        
        // Determine card type class
        let cardTypeClass = '';
        let badgeText = '';
        
        switch (asset.type) {
            case 'vessel':
                cardTypeClass = 'vessel-card';
                badgeText = 'Vessel';
                break;
            case 'currency':
                cardTypeClass = 'currency-card';
                badgeText = 'Currency';
                break;
            case 'vehicle':
                cardTypeClass = 'vehicle-card';
                badgeText = 'Vehicle';
                break;
            case 'real_estate':
                cardTypeClass = 'real-estate-card';
                badgeText = 'Real Estate';
                break;
        }
        
        // Create sanction badge
        const sanctionBadge = getSanctionBadge(asset.legalStatus.unSanctionsCompliance ? 'CLEAR' : 'BLOCKED');
        
        // Create card HTML
        card.innerHTML = `
            <div class="card auction-card ${cardTypeClass}">
                <div class="card-header">
                    <span class="badge bg-secondary float-end">${badgeText}</span>
                    <h5 class="card-title">${asset.description}</h5>
                </div>
                <div class="card-body">
                    ${asset.imoNumber ? `<p>IMO: ${asset.imoNumber}</p>` : ''}
                    ${asset.arrestWarrantId ? `<p>Arrest Warrant: ${asset.arrestWarrantId}</p>` : ''}
                    ${asset.debtAmount ? `<p>Debt: ${asset.debtAmount}</p>` : ''}
                    ${asset.value ? `<p>Value: ${asset.value}</p>` : ''}
                    ${asset.origin ? `<p>Origin: ${asset.origin}</p>` : ''}
                    <p>Source: ${asset.source}</p>
                    <p>${sanctionBadge}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary">View Details</button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Show asset details in a modal
function showAssetDetails(title, details) {
    // In a real implementation, this would show a modal with details
    // For demo purposes, we'll use an alert
    let detailsText = `Details for ${title}:\n\n`;
    
    detailsText += `Type: ${details.type}\n`;
    detailsText += `Source: ${details.source}\n`;
    detailsText += `Seizure Reason: ${details.seizureReason}\n`;
    
    if (details.imoNumber) detailsText += `IMO Number: ${details.imoNumber}\n`;
    if (details.arrestWarrantId) detailsText += `Arrest Warrant: ${details.arrestWarrantId}\n`;
    if (details.debtAmount) detailsText += `Debt Amount: ${details.debtAmount}\n`;
    if (details.value) detailsText += `Value: ${details.value}\n`;
    if (details.origin) detailsText += `Origin: ${details.origin}\n`;
    
    detailsText += `UN Sanctions Compliance: ${details.legalStatus.unSanctionsCompliance ? 'CLEAR' : 'BLOCKED'}\n`;
    
    alert(detailsText);
}

// Show error message
function showErrorMessage(message) {
    const container = document.getElementById('auction-listings');
    container.innerHTML = `<div class="col-12"><p class="alert alert-danger">${message}</p></div>`;
}

// Format currency values
function formatCurrency(value, currency = '€') {
    if (!value) return 'Unknown';
    
    // Remove any existing currency symbol
    value = value.toString().replace(/[€$£]/g, '');
    
    // Format the number
    return currency + parseFloat(value).toLocaleString('en-MT');
}

// Get sanction status badge HTML
function getSanctionBadge(status) {
    if (status === 'CLEAR') {
        return '<span class="badge bg-success">Sanctions: None ✅</span>';
    } else if (status === 'BLOCKED') {
        return '<span class="badge bg-danger">Sanctions: BLOCKED ⛔</span>';
    } else {
        return '<span class="badge bg-warning text-dark">Sanctions: Under Review ⚠️</span>';
    }
}
