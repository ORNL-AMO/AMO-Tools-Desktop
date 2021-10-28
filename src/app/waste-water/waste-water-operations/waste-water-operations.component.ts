import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { SettingsService } from '../../settings/settings.service';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { WasteWater, WasteWaterOperations } from '../../shared/models/waste-water';
import { ConvertWasteWaterService } from '../convert-waste-water.service';
import { SystemBasicsService } from '../system-basics/system-basics.service';
import { WasteWaterService } from '../waste-water.service';
import { WasteWaterOperationsService } from './waste-water-operations.service';

@Component({
  selector: 'app-waste-water-operations',
  templateUrl: './waste-water-operations.component.html',
  styleUrls: ['./waste-water-operations.component.css']
})
export class WasteWaterOperationsComponent implements OnInit {
  @Input()
  assessment: Assessment;



  operationsForm: FormGroup;
  oldSettings: WasteWaterOperations;
  
  showUpdateDataReminder: boolean = false;
  showSuccessMessage: boolean = false;

  constructor(private operationsService: WasteWaterOperationsService, private systemBasicsService: SystemBasicsService,
    private wasteWaterService: WasteWaterService, private convertWasteWaterService: ConvertWasteWaterService,
    private indexedDbService: IndexedDbService, private settingsDbService: SettingsDbService) { }


  ngOnInit() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
   // this.systemBasicsForm = this.systemBasicsService.getFormFromObj(wasteWater.systemBasics);    
    this.operationsForm = this.operationsService.getFormFromObj(wasteWater.baselineData.operations);
    //this.oldSettings = this.operationsService.getObjFromForm(this.operationsForm);

    
  }

  saveOperations() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    let operations: WasteWaterOperations = this.operationsService.getObjFromForm(this.operationsForm);
    wasteWater.baselineData.operations = operations;
    wasteWater.systemBasics = {
      MaxDays: this.operationsForm.controls.MaxDays.value, 
      operatingMonths: this.operationsForm.controls.operatingMonths.value
    }
    wasteWater.baselineData.aeratorPerformanceData.EnergyCostUnit = this.operationsForm.controls.EnergyCostUnit.value;

    this.wasteWaterService.updateWasteWater(wasteWater);
  }

  focusField(str: string) {
    this.wasteWaterService.focusedField.next(str);
  }

}
