import { readFileSync } from 'fs';
import { scrapeTransportMaltaArrestWarrants } from './transportMalta';
import { processCustomsSeizureReports } from './customs';

/**
 * Test function to run both scrapers and combine results
 */
async function testScrapers() {
  try {
    console.log('Testing Transport Malta arrest warrants scraper...');
    // Note: In a real implementation, this would make an actual HTTP request
    // For testing purposes, we'll just log that it would be called
    console.log('Would fetch data from: https://www.transport.gov.mt/maritime/local-waters/official-notices/warrants-of-arrest-124');
    
    // For testing, we'll create some mock data
    const mockTransportMaltaData = [
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
    
    console.log('\nTesting Customs seizure reports processor...');
    // Read sample CSV data
    const csvData = readFileSync('./sample_customs_data.csv', 'utf-8');
    const customsData = await processCustomsSeizureReports(csvData);
    
    console.log(`Processed ${customsData.length} customs seizure reports`);
    
    // Combine results
    const allAssets = [...mockTransportMaltaData, ...customsData];
    console.log(`\nTotal assets: ${allAssets.length}`);
    
    // Display sample data
    console.log('\nSample assets:');
    allAssets.forEach((asset, index) => {
      console.log(`\nAsset ${index + 1}:`);
      console.log(`Type: ${asset.type}`);
      console.log(`Description: ${asset.description}`);
      console.log(`Seizure Reason: ${asset.seizureReason}`);
      console.log(`Source: ${asset.source}`);
      if (asset.debtAmount) console.log(`Debt Amount: ${asset.debtAmount}`);
      if (asset.value) console.log(`Value: ${asset.value}`);
      if (asset.origin) console.log(`Origin: ${asset.origin}`);
      console.log(`UN Sanctions Compliance: ${asset.legalStatus.unSanctionsCompliance ? 'CLEAR' : 'BLOCKED'}`);
    });
    
    return allAssets;
  } catch (error) {
    console.error('Error testing scrapers:', error);
    return [];
  }
}

// Run the test
testScrapers().then(() => {
  console.log('\nScraper testing completed');
});

export { testScrapers };
