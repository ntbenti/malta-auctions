import axios from 'axios';
import * as cheerio from 'cheerio';
import { AuctionAsset } from '../models/types';

/**
 * Scraper for Transport Malta arrest warrants
 */
async function scrapeTransportMaltaArrestWarrants(): Promise<AuctionAsset[]> {
  try {
    const url = 'https://www.transport.gov.mt/maritime/local-waters/official-notices/warrants-of-arrest-124';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Extract warrant information
    const warrants: AuctionAsset[] = [];
    
    // Find all warrant entries on the page
    $('div.content-inner').find('p, h3').each((index, element) => {
      const text = $(element).text().trim();
      
      // Look for warrant information patterns
      if (text.includes('Warrant of Arrest') || text.includes('MT/ARR')) {
        // Extract warrant ID
        const warrantMatch = text.match(/MT\/ARR\/\d{4}-\d{3}/);
        const warrantId = warrantMatch ? warrantMatch[0] : null;
        
        // Extract vessel name
        const vesselNameMatch = text.match(/vessel\s+"([^"]+)"/i) || text.match(/vessel\s+([^\s]+)/i);
        const vesselName = vesselNameMatch ? vesselNameMatch[1] : 'Unknown Vessel';
        
        // Extract IMO number if available
        const imoMatch = text.match(/IMO\s+(\d+)/i);
        const imoNumber = imoMatch ? imoMatch[1] : null;
        
        // Extract debt amount if available
        const debtMatch = text.match(/€\s*([0-9,.]+)/);
        const debtAmount = debtMatch ? debtMatch[1] : null;
        
        // Create asset object
        if (warrantId) {
          const asset: AuctionAsset = {
            type: 'vessel',
            seizureReason: 'debt',
            legalStatus: {
              unSanctionsCompliance: true, // Default to compliant
              localCourtOrder: warrantId
            },
            imoNumber: imoNumber || undefined,
            arrestWarrantId: warrantId,
            description: `${vesselName}${imoNumber ? ' (IMO: ' + imoNumber + ')' : ''}`,
            debtAmount: debtAmount ? `€${debtAmount}` : 'Unknown',
            source: 'Transport Malta',
            dateAdded: new Date().toISOString()
          };
          
          warrants.push(asset);
        }
      }
    });
    
    console.log(`Found ${warrants.length} vessels with arrest warrants`);
    return warrants;
  } catch (error) {
    console.error('Error scraping Transport Malta arrest warrants:', error);
    return [];
  }
}

export { scrapeTransportMaltaArrestWarrants };
