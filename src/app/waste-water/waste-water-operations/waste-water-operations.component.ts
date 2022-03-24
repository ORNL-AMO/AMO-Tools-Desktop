import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Co2SavingsData } from '../../calculator/utilities/co2-savings/co2-savings.service';
import { AssessmentCo2SavingsService } from '../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { WasteWater, WasteWaterData, WasteWaterOperations } from '../../shared/models/waste-water';
import { CompareService, OperationsDifferent } from '../modify-conditions/compare.service';
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
  @Input()
  isModification: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;


  co2SavingsFormDisabled: boolean = false;
  co2SavingsData: Co2SavingsData;
  operationsForm: FormGroup;
  oldSettings: WasteWaterOperations;
  
  showUpdateDataReminder: boolean = false;
  showSuccessMessage: boolean = false;

  idString: string = 'baseline';
  modificationIndex: number;
  selectedModificationIdSub: Subscription;
  operationsDifferent: OperationsDifferent;
  totalEmissionOutputRateDifferent: boolean;
  wasteWaterDifferentSub: Subscription;
  settings: Settings;

  constructor(
    private operationsService: WasteWaterOperationsService,
    private wasteWaterService: WasteWaterService,
    private compareService: CompareService, 
    private assessmentCo2SavingsService: AssessmentCo2SavingsService,
    private cd: ChangeDetectorRef) { }


  ngOnInit() {
    this.settings = this.wasteWaterService.settings.getValue();
    if (this.isModification) {
      this.idString = 'modification';
      this.selectedModificationIdSub = this.wasteWaterService.selectedModificationId.subscribe(val => {
        if (val) {
          let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
          this.modificationIndex = wasteWater.modifications.findIndex(modification => { return modification.id == val });
          let modificationData: WasteWaterData = this.wasteWaterService.getModificationFromId();
          this.operationsForm = this.operationsService.getFormFromObj(modificationData.operations);
          this.initRenderCO2DataForm(modificationData.co2SavingsData);
        }
      });
    } else {
      let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
      this.operationsForm = this.operationsService.getFormFromObj(wasteWater.baselineData.operations);
      this.setCo2SavingsData(wasteWater.baselineData.co2SavingsData);
    }

    if(!this.inSetup && !this.selected){
      this.co2SavingsFormDisabled = true;
      this.operationsForm.controls.MaxDays.disable();
      this.operationsForm.controls.operatingMonths.disable();
      this.operationsForm.controls.EnergyCostUnit.disable();
    }

    this.wasteWaterDifferentSub = this.compareService.wasteWaterDifferent.subscribe(wasteWaterDifferent => {
      this.operationsDifferent = wasteWaterDifferent.operationsDifferent;
      this.totalEmissionOutputRateDifferent = wasteWaterDifferent.co2DataDifferent.totalEmissionOutputRate
      this.cd.detectChanges();
    });
  }

  updateCo2SavingsData(co2SavingsData?: Co2SavingsData) {
    this.co2SavingsData = co2SavingsData;
    this.saveOperations();
  }

  initRenderCO2DataForm(modificationCo2SavingsData: Co2SavingsData) {
    // ensure component destroyed before resetting co2SavingsData
    this.co2SavingsData = undefined;
    setTimeout(() => {
      this.setCo2SavingsData(modificationCo2SavingsData);
    }, 10);
  }

  setCo2SavingsData(co2SavingsData: Co2SavingsData) {
    if (co2SavingsData) {
      this.co2SavingsData = co2SavingsData;
    } else {
      let co2SavingsData: Co2SavingsData = this.assessmentCo2SavingsService.getCo2SavingsDataFromSettingsObject(this.settings);
      this.co2SavingsData = co2SavingsData;
    }
  }

  saveOperations() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    if (this.isModification) {
      let operations: WasteWaterOperations = this.operationsService.getObjFromForm(this.operationsForm);
      wasteWater.modifications[this.modificationIndex].operations = operations;
      wasteWater.modifications[this.modificationIndex].co2SavingsData = this.co2SavingsData;
      wasteWater.modifications[this.modificationIndex].exploreOpportunities = false;
    } else {
      let operations: WasteWaterOperations = this.operationsService.getObjFromForm(this.operationsForm);
      wasteWater.baselineData.operations = operations;
      wasteWater.baselineData.co2SavingsData = this.co2SavingsData;
    }
    this.wasteWaterService.updateWasteWater(wasteWater);
    
  }

  focusField(str: string) {
    this.wasteWaterService.focusedField.next(str);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.isFirstChange()) {
      this.setFormControlStatus();
    }
  }

  setFormControlStatus() {
    if (this.selected === true) {
      this.operationsForm.controls.MaxDays.enable();
      this.operationsForm.controls.operatingMonths.enable();
      this.operationsForm.controls.EnergyCostUnit.enable();
      this.co2SavingsFormDisabled = false;
    } else if (this.selected === false) {
      this.operationsForm.controls.MaxDays.disable();
      this.operationsForm.controls.operatingMonths.disable();
      this.operationsForm.controls.EnergyCostUnit.disable();
      this.co2SavingsFormDisabled = true;
    }
  }

  ngOnDestroy() {
    if (this.isModification){
      this.selectedModificationIdSub.unsubscribe();
    } 
    this.wasteWaterDifferentSub.unsubscribe();
  }

}
