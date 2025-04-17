import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OperationDataOptions, MotorItem, MotorPropertyDisplayOptions } from '../../../motor-inventory';
import { MotorCatalogService } from '../motor-catalog.service';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { OperationsDataService } from './operations-data.service';
import { PsatService } from '../../../../psat/psat.service';
import { Settings } from '../../../../shared/models/settings';
import { OperatingHours } from '../../../../shared/models/operations';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { PercentLoadEstimationService } from '../../../../calculator/motors/percent-load-estimation/percent-load-estimation.service';

@Component({
    selector: 'app-operations-data',
    templateUrl: './operations-data.component.html',
    styleUrls: ['./operations-data.component.css'],
    standalone: false
})
export class OperationsDataComponent implements OnInit {


  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  @ViewChild('loadFactorModal', { static: false }) public loadFactorModal: ModalDirective;


  motorForm: UntypedFormGroup;
  selectedMotorItemSub: Subscription;
  displayOptions: OperationDataOptions;
  displayForm: boolean = true;
  showOperatingHoursModal: boolean = false;
  operationsOperatingHours: OperatingHours;
  formWidth: number;
  selectedMotor: MotorItem;
  disableEstimateCurrent: boolean;
  disableEstimateLoadFactor: boolean;
  disableEstimateEfficiency: boolean;
  constructor(private motorCatalogService: MotorCatalogService, private motorInventoryService: MotorInventoryService,
    private operationsDataService: OperationsDataService, private psatService: PsatService, private percentLoadEstimationService: PercentLoadEstimationService) { }

  ngOnInit(): void {
    this.selectedMotorItemSub = this.motorCatalogService.selectedMotorItem.subscribe(selectedMotor => {
      if (selectedMotor) {
        this.motorForm = this.operationsDataService.getFormFromOperationData(selectedMotor.operationData);
      }
    });
    let allDisplayOptions: MotorPropertyDisplayOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions;
    this.displayOptions = allDisplayOptions.operationDataOptions;
    this.disableEstimateCurrent = !(allDisplayOptions.nameplateDataOptions.fullLoadSpeed && allDisplayOptions.nameplateDataOptions.ratedVoltage && allDisplayOptions.nameplateDataOptions.fullLoadAmps && allDisplayOptions.operationDataOptions.averageLoadFactor);
    this.disableEstimateLoadFactor = !(allDisplayOptions.nameplateDataOptions.ratedVoltage && allDisplayOptions.operationDataOptions.averageLoadFactor && allDisplayOptions.operationDataOptions.efficiencyAtAverageLoad && allDisplayOptions.operationDataOptions.currentAtLoad);
    this.disableEstimateEfficiency = !(allDisplayOptions.operationDataOptions.averageLoadFactor && allDisplayOptions.nameplateDataOptions.fullLoadSpeed);
  }

  ngOnDestroy() {
    this.selectedMotorItemSub.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100);
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

  toggleForm() {
    this.displayForm = !this.displayForm;
    // this.focusOut();
  }

  // focusOut() {
  //   this.motorInventoryService.focusedDataGroup.next('operation-data')
  //   this.motorInventoryService.focusedField.next('default');
  // }


  calculateEfficiency() {
    let loadFactorPercent: number = this.motorForm.controls.averageLoadFactor.value;
    let efficiency: number = this.motorCatalogService.estimateEfficiency(loadFactorPercent, true);
    this.motorForm.controls.efficiencyAtAverageLoad.patchValue(efficiency);
    this.save();
  }

  calculateCurrent() {
    if (!this.disableEstimateCurrent) {
      let loadFactorPercent: number = this.motorForm.controls.averageLoadFactor.value;
      let estimatedCurrentAtLoad = this.motorCatalogService.estimateCurrent(loadFactorPercent);
      this.motorForm.controls.currentAtLoad.patchValue(estimatedCurrentAtLoad);
    }
  }

  calculatePowerFactor() {
    if (!this.disableEstimateLoadFactor) {
      let settings: Settings = this.motorInventoryService.settings.getValue();
      let selectedMotorItem = this.motorCatalogService.getUpdatedSelectedMotorItem();
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

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
    this.motorInventoryService.modalOpen.next(false);
  }

  openOperatingHoursModal() {
    let selectedMotorItem = this.motorCatalogService.getUpdatedSelectedMotorItem();
    this.operationsOperatingHours = selectedMotorItem.operationData.operatingHours;
    this.showOperatingHoursModal = true;
    this.motorInventoryService.modalOpen.next(true);
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.motorForm.controls.annualOperatingHours.patchValue(oppHours.hoursPerYear);
    let selectedMotor: MotorItem = this.motorCatalogService.selectedMotorItem.getValue();
    selectedMotor.operationData.operatingHours = oppHours;
    this.save();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  showLoadFactorModal() {
    let selectedMotorItem = this.motorCatalogService.getUpdatedSelectedMotorItem();
    this.percentLoadEstimationService.fieldMeasurementInputs = {
      phase1Voltage: 0,
      phase1Amps: 0,
      phase2Voltage: 0,
      phase2Amps: 0,
      phase3Voltage: 0,
      phase3Amps: 0,
      ratedVoltage: selectedMotorItem.nameplateData.ratedVoltage,
      ratedCurrent: 0,
      powerFactor: this.motorForm.controls.averageLoadFactor.value
    }
    this.selectedMotor = this.motorCatalogService.getUpdatedSelectedMotorItem();
    this.motorInventoryService.modalOpen.next(true);
    this.loadFactorModal.show();
  }

  hideLoadFactorModal() {
    this.loadFactorModal.hide();
    this.motorInventoryService.modalOpen.next(false);
  }

  applyModalData() {
    let percentLoad: number;
    percentLoad = this.percentLoadEstimationService.getResults(this.percentLoadEstimationService.fieldMeasurementInputs).percentLoad;
    this.motorForm.controls.averageLoadFactor.patchValue(Number(percentLoad.toFixed(1)));
    this.save();
    this.hideLoadFactorModal();
  }

  focusHelp(str: string) {
    this.focusField(str);
    this.motorInventoryService.helpPanelTab.next('help');
  }
}
