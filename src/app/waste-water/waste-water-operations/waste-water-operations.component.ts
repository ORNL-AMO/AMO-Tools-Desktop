import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
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



  operationsForm: FormGroup;
  oldSettings: WasteWaterOperations;
  
  showUpdateDataReminder: boolean = false;
  showSuccessMessage: boolean = false;

  idString: string = 'baseline';
  modificationIndex: number;
  selectedModificationIdSub: Subscription;
  operationsDifferent: OperationsDifferent;
  wasteWaterDifferentSub: Subscription;
  settings: Settings;

  constructor(
    private operationsService: WasteWaterOperationsService,
    private wasteWaterService: WasteWaterService,
    private compareService: CompareService, 
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
        }
      });
    } else {
      let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
      this.operationsForm = this.operationsService.getFormFromObj(wasteWater.baselineData.operations);
    }

    if(!this.inSetup){
      this.operationsForm.controls.MaxDays.disable();
      this.operationsForm.controls.operatingMonths.disable();
    }

    this.wasteWaterDifferentSub = this.compareService.wasteWaterDifferent.subscribe(val => {
      this.operationsDifferent = val.operationsDifferent;
      this.cd.detectChanges();
    });


  }

  saveOperations() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    if (this.isModification) {
      let operations: WasteWaterOperations = this.operationsService.getObjFromForm(this.operationsForm);
      wasteWater.modifications[this.modificationIndex].operations = operations;
      wasteWater.modifications[this.modificationIndex].exploreOpportunities = false;
    } else {
      let operations: WasteWaterOperations = this.operationsService.getObjFromForm(this.operationsForm);
      wasteWater.baselineData.operations = operations;
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
      this.operationsForm.controls.EnergyCostUnit.enable();
    } else if (this.selected === false) {
      this.operationsForm.controls.EnergyCostUnit.disable();
    }
  }

  ngOnDestroy() {
    if (this.isModification){
      this.selectedModificationIdSub.unsubscribe();
    } 
    this.wasteWaterDifferentSub.unsubscribe();
  }

}
