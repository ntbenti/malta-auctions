import { AuctionAsset } from '../models/types';

/**
 * Processor for Customs seizure reports
 */
async function processCustomsSeizureReports(csvData: string): Promise<AuctionAsset[]> {
  try {
    // Parse CSV data from Customs reports
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');
    
    const seizures: AuctionAsset[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      
      // Create a basic object from CSV
      const rawSeizure: Record<string, string> = {};
      headers.forEach((header, index) => {
        rawSeizure[header] = values[index] || '';
      });
      
      // Map to AuctionAsset type
      const assetType = determineAssetType(rawSeizure.type);
      const seizureReason = determineSeizureReason(rawSeizure.origin);
      const contrabandType = determineContrabandType(rawSeizure.type);
      
      // Create the asset object
      const asset: AuctionAsset = {
        type: assetType,
        seizureReason: seizureReason,
        legalStatus: {
          unSanctionsCompliance: !isSanctionedOrigin(rawSeizure.origin),
          localCourtOrder: null // Customs seizures typically don't have court orders initially
        },
        description: createDescription(rawSeizure),
        value: rawSeizure.value ? `€${rawSeizure.value}` : 'Unknown',
        origin: rawSeizure.origin || 'Unknown',
        source: 'Customs Department',
        dateAdded: rawSeizure.date || new Date().toISOString()
      };
      
      // Add contraband type if applicable
      if (contrabandType) {
        asset.contrabandType = contrabandType;
      }
      
      // Add serial numbers for currency
      if (assetType === 'currency' && rawSeizure.serials) {
        asset.serialNumbers = rawSeizure.serials.split(';');
      }
      
      seizures.push(asset);
    }
    
    console.log(`Processed ${seizures.length} customs seizure reports`);
    return seizures;
  } catch (error) {
    console.error('Error processing Customs seizure reports:', error);
    return [];
  }
}

/**
 * Helper function to determine asset type from raw data
 */
function determineAssetType(type: string): AuctionAsset['type'] {
  type = (type || '').toLowerCase();
  
  if (type.includes('vessel') || type.includes('boat') || type.includes('ship')) {
    return 'vessel';
  } else if (type.includes('currency') || type.includes('money') || type.includes('cash')) {
    return 'currency';
  } else if (type.includes('car') || type.includes('vehicle') || type.includes('truck')) {
    return 'vehicle';
  } else if (type.includes('property') || type.includes('house') || type.includes('land')) {
    return 'real_estate';
  }
  
  // Default to vehicle for unknown types
  return 'vehicle';
}

/**
 * Helper function to determine seizure reason from origin
 */
function determineSeizureReason(origin: string): AuctionAsset['seizureReason'] {
  origin = (origin || '').toLowerCase();
  
  if (isSanctionedOrigin(origin)) {
    return 'sanctions';
  } else if (origin.includes('smuggled') || origin.includes('illegal')) {
    return 'contraband';
  }
  
  // Default to contraband for customs seizures
  return 'contraband';
}

/**
 * Helper function to determine contraband type
 */
function determineContrabandType(type: string): AuctionAsset['contrabandType'] | undefined {
  type = (type || '').toLowerCase();
  
  if (type.includes('drug') || type.includes('narcotic')) {
    return 'drugs';
  } else if (type.includes('weapon') || type.includes('firearm') || type.includes('ammunition')) {
    return 'weapons';
  } else if (type.includes('currency') || type.includes('money') || type.includes('cash')) {
    return 'currency';
  }
  
  return undefined;
}

/**
 * Helper function to check if origin is from sanctioned region
 */
function isSanctionedOrigin(origin: string): boolean {
  origin = (origin || '').toLowerCase();
  const SANCTIONED_REGIONS = ['russia', 'belarus', 'north korea', 'iran', 'syria', 'libya'];
  
  return SANCTIONED_REGIONS.some(region => origin.includes(region));
}

/**
 * Helper function to create a description from raw data
 */
function createDescription(data: Record<string, string>): string {
  if (data.type?.toLowerCase().includes('currency')) {
    return `${data.origin || 'Unknown origin'} currency shipment (${data.value ? '€' + data.value : 'value unknown'})`;
  } else if (data.type?.toLowerCase().includes('vehicle')) {
    return `${data.make || ''} ${data.model || ''} ${data.year || ''} (${data.origin || 'Unknown origin'})`.trim();
  } else if (data.type?.toLowerCase().includes('vessel')) {
    return `${data.length ? data.length + 'm ' : ''}${data.type || 'Vessel'} from ${data.origin || 'unknown origin'}`;
  }
  
  return `${data.type || 'Item'} from ${data.origin || 'unknown origin'}`;
}

export { processCustomsSeizureReports };
