// Test script for MaltaGovAuctions MVP
import { AuctionAsset } from './models/types';
import { scrapeTransportMaltaArrestWarrants } from './scrapers/transportMalta';
import { processCustomsSeizureReports } from './scrapers/customs';
import { readFileSync } from 'fs';
import { 
  checkSanctions, 
  redactSensitiveFields, 
  generateComplianceDisclaimer 
} from './utils/compliance';
import { 
  processAssetsForDisplay, 
  processAssetsForStorage, 
  canUserBidOnAsset 
} from './utils/complianceIntegration';

/**
 * Main test function to run all tests
 */
async function runTests() {
  console.log('=== STARTING MALTAGOVAUCTIONS MVP TESTS ===\n');
  
  // Test data scraping
  await testDataScraping();
  
  // Test compliance engine
  testComplianceEngine();
  
  // Test integration
  testIntegration();
  
  console.log('\n=== ALL TESTS COMPLETED ===');
}

/**
 * Test data scraping functionality
 */
async function testDataScraping() {
  console.log('--- Testing Data Scraping ---');
  
  // Test Transport Malta scraper
  console.log('\nTesting Transport Malta scraper:');
  console.log('Note: In a real environment, this would make an HTTP request to Transport Malta');
  
  // Create mock data for testing
  const mockTransportMaltaData: AuctionAsset[] = [
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
    }
  ];
  
  console.log(`Found ${mockTransportMaltaData.length} vessels with arrest warrants`);
  console.log(`Sample vessel: ${mockTransportMaltaData[0].description}`);
  
  // Test Customs scraper
  console.log('\nTesting Customs seizure reports processor:');
  try {
    // Read sample CSV data
    const csvData = readFileSync('./src/scrapers/sample_customs_data.csv', 'utf-8');
    const customsData = await processCustomsSeizureReports(csvData);
    
    console.log(`Processed ${customsData.length} customs seizure reports`);
    if (customsData.length > 0) {
      console.log(`Sample customs item: ${customsData[0].description}`);
      console.log(`Origin: ${customsData[0].origin}`);
      console.log(`Value: ${customsData[0].value}`);
    }
  } catch (error) {
    console.error('Error testing Customs scraper:', error);
  }
}

/**
 * Test compliance engine functionality
 */
function testComplianceEngine() {
  console.log('\n--- Testing Compliance Engine ---');
  
  // Test assets for compliance checks
  const testAssets: AuctionAsset[] = [
    {
      type: 'vessel',
      seizureReason: 'debt',
      legalStatus: {
        unSanctionsCompliance: true,
        localCourtOrder: 'MT/ARR/2025-087'
      },
      description: 'Seized Tanker (IMO: 9456782)',
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
      description: 'Russian-Minted Libyan Dinar',
      value: '€926,000,000',
      origin: 'Russia',
      source: 'Customs Department',
      dateAdded: new Date().toISOString(),
      serialNumbers: ['RU12345', 'RU67890']
    },
    {
      type: 'vehicle',
      seizureReason: 'contraband',
      legalStatus: {
        unSanctionsCompliance: true,
        localCourtOrder: null
      },
      description: 'Luxury SUV owned by Mr. John Smith with passport #AB123456',
      value: '€95,000',
      origin: 'Libya',
      source: 'Customs Department',
      dateAdded: new Date().toISOString()
    }
  ];
  
  // Test sanctions checking
  console.log('\nTesting sanctions checking:');
  testAssets.forEach(asset => {
    const status = checkSanctions(asset);
    console.log(`${asset.description}: ${status}`);
  });
  
  // Test redaction
  console.log('\nTesting sensitive field redaction:');
  testAssets.forEach(asset => {
    const redacted = redactSensitiveFields(asset);
    console.log(`Original: ${asset.description}`);
    console.log(`Redacted: ${redacted.description}`);
    
    if (asset.serialNumbers && redacted.serialNumbers) {
      console.log(`Original serials: ${asset.serialNumbers.join(', ')}`);
      console.log(`Redacted serials: ${redacted.serialNumbers.join(', ')}`);
    }
  });
  
  // Test compliance disclaimers
  console.log('\nTesting compliance disclaimers:');
  testAssets.forEach(asset => {
    const disclaimer = generateComplianceDisclaimer(asset);
    console.log(`${asset.type}: ${disclaimer}`);
  });
}

/**
 * Test integration between components
 */
function testIntegration() {
  console.log('\n--- Testing Integration ---');
  
  // Test assets
  const testAssets: AuctionAsset[] = [
    {
      type: 'vessel',
      seizureReason: 'debt',
      legalStatus: {
        unSanctionsCompliance: true,
        localCourtOrder: 'MT/ARR/2025-087'
      },
      description: 'Seized Tanker (IMO: 9456782)',
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
      description: 'Russian-Minted Libyan Dinar',
      value: '€926,000,000',
      origin: 'Russia',
      source: 'Customs Department',
      dateAdded: new Date().toISOString()
    }
  ];
  
  // Test processing assets for display
  console.log('\nTesting asset processing for display:');
  const displayAssets = processAssetsForDisplay(testAssets);
  displayAssets.forEach(asset => {
    console.log(`Asset: ${asset.description}`);
    console.log(`Sanction Status: ${asset.sanctionStatus}`);
    console.log(`Compliance Disclaimer: ${asset.complianceDisclaimer}`);
  });
  
  // Test processing assets for storage
  console.log('\nTesting asset processing for storage:');
  const storageAssets = processAssetsForStorage(testAssets);
  storageAssets.forEach(asset => {
    console.log(`Asset: ${asset.description}`);
    console.log(`UN Sanctions Compliance: ${asset.legalStatus.unSanctionsCompliance}`);
  });
  
  // Test bidder eligibility
  console.log('\nTesting bidder eligibility:');
  
  const testUsers = [
    {
      name: 'Regular User',
      verificationLevel: 2,
      country: 'Malta',
      sanctionsChecked: true
    },
    {
      name: 'High-Level User',
      verificationLevel: 4,
      country: 'Germany',
      sanctionsChecked: true
    },
    {
      name: 'Sanctioned User',
      verificationLevel: 3,
      country: 'Russia',
      sanctionsChecked: true
    }
  ];
  
  testAssets.forEach(asset => {
    console.log(`\nAsset: ${asset.description}`);
    
    testUsers.forEach(user => {
      const eligibility = canUserBidOnAsset(asset, user);
      console.log(`${user.name} (Level ${user.verificationLevel}, ${user.country}): ${eligibility.canBid ? 'Can bid' : 'Cannot bid'}`);
      if (!eligibility.canBid && eligibility.message) {
        console.log(`Reason: ${eligibility.message}`);
      }
    });
  });
}

// Run all tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});
