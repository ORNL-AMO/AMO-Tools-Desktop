import { Component, OnInit, ViewChild, HostListener, Input, ElementRef, SimpleChanges } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { CoolingTowerService } from '../cooling-tower.service';
import { OperatingHours } from '../../../../shared/models/operations';
import { Subscription } from 'rxjs';
import { CoolingTowerResult, CoolingTowerOutput, CoolingTowerData } from '../../../../shared/models/chillers';

@Component({
  selector: 'app-cooling-tower-form',
  templateUrl: './cooling-tower-form.component.html',
  styleUrls: ['./cooling-tower-form.component.css']
})
export class CoolingTowerFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  index: number;
  @Input()
  isBaseline: boolean;
  @Input()
  operatingHours: OperatingHours;
  @Input()
  selected: boolean;
  
  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  coolingTowerOutputSub: Subscription;
  modificationDataSub: Subscription;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;
  showOperatingHoursModal: boolean;

  form: UntypedFormGroup;
  idString: string;
  caseResultData: CoolingTowerResult;
  isEditingName: boolean = false;
  driftEliminatorOptions: Array<{value: number, display: string}> = [
    {value: 0, display: "No"},
    {value: 1, display: "Yes"}
  ];
  constructor(private coolingTowerService: CoolingTowerService) { }

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = 'baseline_' + this.index.toString();
    }
    else {
      this.idString = 'modification_' + this.index;
    }
    this.initSubscriptions();
    if (this.selected == false) {
      this.form.disable();
    }
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
    this.coolingTowerOutputSub.unsubscribe();
    if (!this.isBaseline) {
      this.modificationDataSub.unsubscribe();
    }
  }

  ngAfterViewInit(){
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected == false) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    }
  }

  initSubscriptions() {
    this.resetDataSub = this.coolingTowerService.resetData.subscribe(value => {
      this.updateForm();
      })
    this.generateExampleSub = this.coolingTowerService.generateExample.subscribe(value => {
      this.updateForm();
    })
    this.coolingTowerOutputSub = this.coolingTowerService.coolingTowerOutput.subscribe((coolingTowerOutput: CoolingTowerOutput) => {
      this.caseResultData = coolingTowerOutput.coolingTowerCaseResults[this.index];
    });
    if (!this.isBaseline) {
      this.modificationDataSub = this.coolingTowerService.modificationData.subscribe(updatedData => {
        if (updatedData) {
          this.updateModOperationalData(updatedData);
        }
      });
    }
  }

  updateModOperationalData(updatedModificationData: Array<CoolingTowerData>) {
    let updated: CoolingTowerData = updatedModificationData[this.index];
    if (updated) {
      this.form.patchValue({
        operationalHours: updated.operationalHours,
        flowRate: updated.flowRate,
        coolingLoad: updated.coolingLoad,
        temperatureDifference: updated.temperatureDifference,
        userDefinedCoolingLoad: updated.userDefinedCoolingLoad
      });
    }
  }

  updateForm() {
    let updatedData: CoolingTowerData;
    if (this.isBaseline) {
      let currentBaseline: Array<CoolingTowerData> = this.coolingTowerService.baselineData.getValue();
      updatedData = currentBaseline[this.index];
    } else {
      let currentModification: Array<CoolingTowerData> = this.coolingTowerService.modificationData.getValue();
      updatedData = currentModification[this.index];
    }
    this.form = this.coolingTowerService.getFormFromObj(updatedData);
  }

  changeHasDriftEliminator() {
    if(this.form.controls.hasDriftEliminator.value == 0) {
      this.form.patchValue({driftLossFactor: .2});
    } else {
      this.form.patchValue({driftLossFactor: .01});
    }
    this.calculate();
  }

  showHideInputField() {
    this.form.patchValue({
      userDefinedCoolingLoad: !this.form.controls.userDefinedCoolingLoad.value
    });
    if (!this.form.controls.userDefinedCoolingLoad.value) {
      this.calculate();
    }
  }

  calculate() {
    if (!this.form.controls.userDefinedCoolingLoad.value) {
      let calculatedCoolingLoad: number = this.coolingTowerService.calculateCoolingLoad(this.form, this.settings);
      this.form.patchValue({
        coolingLoad: calculatedCoolingLoad
      })
    }
    let tmpObj: CoolingTowerData = this.coolingTowerService.getObjFromForm(this.form);
    this.coolingTowerService.updateDataArray(tmpObj, this.index, this.isBaseline);
  }
  
  removeCase() {
    this.coolingTowerService.removeCase(this.index);
  }

  editCaseName() {
    this.isEditingName = true;
  }

  doneEditingName() {
    this.isEditingName = false;
  }

  focusField(str: string) {
    this.coolingTowerService.currentField.next(str);
  }

  closeOperatingHoursModal(){
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal(){
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours){
    this.form.controls.operationalHours.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth(){
    if (this.formElement) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
