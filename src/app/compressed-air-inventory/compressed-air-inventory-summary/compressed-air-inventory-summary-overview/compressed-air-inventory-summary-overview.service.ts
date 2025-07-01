import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PumpInventoryService } from '../../../pump-inventory/pump-inventory.service';
import { ConvertPumpInventoryService } from '../../../pump-inventory/convert-pump-inventory.service';
import { PsatService } from '../../../psat/psat.service';
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
  numberOfPumps: number;
  energyUse: number;
  energyCost: number;
  systemColor: string;
  co2EmissionOutput: number,
  pumpItemResults: Array<{ data: CompressedAirItem, results: PumpInventoryResults, name: string }>;
}


export interface PumpInventoryResults {
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