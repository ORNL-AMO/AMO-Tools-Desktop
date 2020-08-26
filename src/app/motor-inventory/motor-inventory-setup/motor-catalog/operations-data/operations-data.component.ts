import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OperationDataOptions, MotorItem } from '../../../motor-inventory';
import { MotorCatalogService } from '../motor-catalog.service';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { OperationsDataService } from './operations-data.service';
import { PsatService } from '../../../../psat/psat.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-operations-data',
  templateUrl: './operations-data.component.html',
  styleUrls: ['./operations-data.component.css']
})
export class OperationsDataComponent implements OnInit {

  motorForm: FormGroup;
  selectedMotorItemSub: Subscription;
  displayOptions: OperationDataOptions;
  displayForm: boolean = true;
  constructor(private motorCatalogService: MotorCatalogService, private motorInventoryService: MotorInventoryService,
    private operationsDataService: OperationsDataService, private psatService: PsatService) { }

  ngOnInit(): void {
    this.selectedMotorItemSub = this.motorCatalogService.selectedMotorItem.subscribe(selectedMotor => {
      if (selectedMotor) {
        this.motorForm = this.operationsDataService.getFormFromOperationData(selectedMotor.operationData);
      }
    });
    this.displayOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.operationDataOptions;
  }

  ngOnDestroy() {
    this.selectedMotorItemSub.unsubscribe();
  }

  save() {
    let selectedMotor: MotorItem = this.motorCatalogService.selectedMotorItem.getValue();
    selectedMotor.operationData = this.operationsDataService.updateOperationDataFromForm(this.motorForm, selectedMotor.operationData);
    this.motorInventoryService.updateMotorItem(selectedMotor);
  }

  focusField(str: string) {
    this.motorInventoryService.focusedDataGroup.next('operation-data');
    this.motorInventoryService.focusedField.next(str);
  }

  toggleForm(){
    this.displayForm = !this.displayForm;
    this.focusOut();
  }

  focusOut() {
    this.motorInventoryService.focusedDataGroup.next('operation-data')
    this.motorInventoryService.focusedField.next('default');
  }


  calculateEfficiency(){
    let loadFactor: number = this.motorForm.controls.averageLoadFactor.value;
    let efficiency: number = this.motorCatalogService.estimateEfficiency(loadFactor);
    this.motorForm.controls.efficiencyAtAverageLoad.patchValue(efficiency);
    this.save();
  }

  calculateCurrent(){
      let settings: Settings = this.motorInventoryService.settings.getValue();
      let motorInventoryData = this.motorInventoryService.motorInventoryData.getValue()
      let selectedMotorItem = this.motorCatalogService.selectedMotorItem.getValue();
      let department = motorInventoryData.departments.find(department => { return department.id = selectedMotorItem.departmentId });
      selectedMotorItem = department.catalog.find(motorItem => { return motorItem.id == selectedMotorItem.id });

      let motorPower: number = selectedMotorItem.nameplateData.ratedMotorPower;
      let ratedVoltage: number = selectedMotorItem.nameplateData.ratedVoltage;
      let motorRpm: number = selectedMotorItem.nameplateData.motorRpm;
      let lineFrequency: number = selectedMotorItem.nameplateData.lineFrequency;
      let efficiencyClass: number = selectedMotorItem.nameplateData.efficiencyClass;
      let loadFactor: number = this.motorForm.controls.averageLoadFactor.value;
      let fullLoadAmps: number = selectedMotorItem.nameplateData.fullLoadAmps;      
      //90 for specified efficiency isn't used in calc with efficiency class set
      let motorCurrent: number = this.psatService.motorCurrent(motorPower, motorRpm, lineFrequency, efficiencyClass, loadFactor, ratedVoltage, fullLoadAmps, 90, settings);
      this.motorForm.controls.currentAtLoad.patchValue(motorCurrent);
      this.save();
  }

  calculatePowerFactor(){
    let settings: Settings = this.motorInventoryService.settings.getValue();
    let motorInventoryData = this.motorInventoryService.motorInventoryData.getValue()
    let selectedMotorItem = this.motorCatalogService.selectedMotorItem.getValue();
    let department = motorInventoryData.departments.find(department => { return department.id = selectedMotorItem.departmentId });
    selectedMotorItem = department.catalog.find(motorItem => { return motorItem.id == selectedMotorItem.id });

    let motorPower: number = selectedMotorItem.nameplateData.ratedMotorPower;
    let ratedVoltage: number = selectedMotorItem.nameplateData.ratedVoltage;
    let efficiencyAtAverageLoad: number = this.motorForm.controls.efficiencyAtAverageLoad.value;
    let loadFactor: number = this.motorForm.controls.averageLoadFactor.value;
    let motorCurrent: number = this.motorForm.controls.currentAtLoad.value; 
    let powerFactorAtLoad: number = this.psatService.motorPowerFactor(motorPower, loadFactor, motorCurrent, efficiencyAtAverageLoad, ratedVoltage, settings);
    this.motorForm.controls.powerFactorAtLoad.patchValue(powerFactorAtLoad);
    this.save();    
  }
}
