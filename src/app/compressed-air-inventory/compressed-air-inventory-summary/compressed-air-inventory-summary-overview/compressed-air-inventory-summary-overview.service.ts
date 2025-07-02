import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';
import { ConvertCompressedAirInventoryService } from '../../convert-compressed-air-inventory.service';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment/compressed-air-assessment.service';
import { AssessmentCo2SavingsService } from '../../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { CompressedAirItem } from '../../compressed-air-inventory';
@Injectable()
export class CompressedAirInventorySummaryOverviewService {
  inventorySummary: BehaviorSubject<InventorySummary>;

  constructor(
    private compressedAirInventoryService: CompressedAirInventoryService,
    private convertCompressedAirInventoryService: ConvertCompressedAirInventoryService,
    private compressedAirAssessmentService: CompressedAirAssessmentService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService
  ) {
    this.inventorySummary = new BehaviorSubject<InventorySummary>({
      totalEnergyUse: 0,
      totalEnergyCost: 0,
      totalCompressors: 0,
      totalEmissions: 0,
      systemSummaryItems: new Array()
    });
  }
}


export interface InventorySummary {
  totalEnergyUse: number,
  totalEnergyCost: number,
  totalCompressors: number,
  totalEmissions: number,
  systemSummaryItems: Array<SystemSummaryItem>
}

export interface SystemSummaryItem {
  systemName: string;
  numberOfCompressors: number;
  energyUse: number;
  energyCost: number;
  systemColor: string;
  co2EmissionOutput: number,
  compressedAirItemResults: Array<{ data: CompressedAirItem, results: CompressedAirItemResults, name: string }>;
}


export interface CompressedAirItemResults {
  energyUse: number;
  emissionOutput?: number;
  energyCost: number;
  emissionsOutput: number;
}

export const SystemRGBColors: Array<string> = [
  '33, 97, 140',
  '17, 122, 101',
  '185, 119, 14',
  '123, 125, 125',
  '40, 55, 71',
  '231, 76, 60',
  '46, 204, 113',
  '2, 136, 209',
  '255, 87, 34',
]