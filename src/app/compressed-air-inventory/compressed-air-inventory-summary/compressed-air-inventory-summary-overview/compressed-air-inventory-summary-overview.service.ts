import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PumpInventoryService } from '../../../pump-inventory/pump-inventory.service';
import { ConvertPumpInventoryService } from '../../../pump-inventory/convert-pump-inventory.service';
import { PsatService } from '../../../psat/psat.service';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';
import { ConvertCompressedAirInventoryService } from '../../convert-compressed-air-inventory.service';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment/compressed-air-assessment.service';
import { AssessmentCo2SavingsService } from '../../../shared/assessment-co2-savings/assessment-co2-savings.service';
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
      //departmentSummaryItems: new Array()
    });
  }
}


export interface InventorySummary {
  totalEnergyUse: number,
  totalEnergyCost: number,
  totalCompressors: number,
  totalEmissions: number,
  //departmentSummaryItems: Array<DepartmentSummaryItem>
}