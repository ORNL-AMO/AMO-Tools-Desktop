import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PumpSystemCurveFormService } from '../pump-system-curve-form.service';
import { Settings } from '../../../../shared/models/settings';
import { SystemAndEquipmentCurveService } from '../../system-and-equipment-curve.service';
import { Subscription } from 'rxjs';
import { CurveDataService } from '../../curve-data.service';
import { PumpSystemCurveData, ModificationEquipment } from '../../../../shared/models/system-and-equipment-curve';

@Component({
  selector: 'app-pump-system-curve-form',
  templateUrl: './pump-system-curve-form.component.html',
  styleUrls: ['./pump-system-curve-form.component.css']
})
export class PumpSystemCurveFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  equipmentType: string;

  modificationOptions: Array<{ display: string, value: number }> = [
    { display: 'Flow Rate', value: 0 },
    { display: 'Head', value: 1 },
  ];

  flowUnit: string;
  yValueUnit: string;
  modificationEquipmentSub: Subscription;
  modificationEquipment: ModificationEquipment

  pointOneFluidPower: number = 0;
  pointTwoFluidPower: number = 0;
  pumpSystemCurveForm: FormGroup;
  resetFormsSub: Subscription;
  pumpModificationCollapsed: string = 'closed';

  displaySpeed: boolean = true;
  equipmentInputsSub: Subscription;
  pumpModificationCollapsedSub: Subscription;

  constructor(private pumpSystemCurveFormService: PumpSystemCurveFormService, private systemAndEquipmentCurveService: SystemAndEquipmentCurveService,
    private curveDataService: CurveDataService) { }

  ngOnInit() {
    this.initSystemCurveForm();
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.resetFormsSub.unsubscribe();
    this.modificationEquipmentSub.unsubscribe();
    this.equipmentInputsSub.unsubscribe();
    this.pumpModificationCollapsedSub.unsubscribe();
  }

  initSubscriptions() {
    this.resetFormsSub = this.curveDataService.resetForms.subscribe(val => {
      if (val == true) {
        this.initSystemCurveForm();
      }
    });
    this.equipmentInputsSub = this.systemAndEquipmentCurveService.equipmentInputs.subscribe(inputs => {
      if (inputs) {
        this.displaySpeed = Boolean(inputs.measurementOption);
      }
    });
    this.modificationEquipmentSub = this.systemAndEquipmentCurveService.modificationEquipment.subscribe(equipment => {
      if (equipment) {
        this.modificationEquipment = equipment;
      }
    });
    this.pumpModificationCollapsedSub = this.systemAndEquipmentCurveService.pumpModificationCollapsed.subscribe(val => {
      if (val) {
        this.pumpModificationCollapsed = val;
      }
    });
  }
  
  initSystemCurveForm() {
    let dataObj: PumpSystemCurveData = this.systemAndEquipmentCurveService.pumpSystemCurveData.value;
    if (dataObj == undefined) {
      dataObj = this.pumpSystemCurveFormService.getResetPumpSystemCurveInputs();
    }
    this.systemAndEquipmentCurveService.pumpSystemCurveData.next(dataObj);
    this.pumpSystemCurveForm = this.pumpSystemCurveFormService.getFormFromObj(dataObj);
    this.calculateFluidPowers(dataObj);
  }

  resetForm() {
    let dataObj: PumpSystemCurveData = this.systemAndEquipmentCurveService.pumpSystemCurveData.value;
    this.pumpSystemCurveForm = this.pumpSystemCurveFormService.getFormFromObj(dataObj);
    this.calculateFluidPowers(dataObj);
  }

  focusField(str: string) {
    this.systemAndEquipmentCurveService.focusedCalculator.next('pump-system-curve');
    this.systemAndEquipmentCurveService.currentField.next(str);
  }

  saveChanges() {
    let dataObj: PumpSystemCurveData = this.pumpSystemCurveFormService.getObjFromForm(this.pumpSystemCurveForm);
    this.calculateFluidPowers(dataObj);
    this.systemAndEquipmentCurveService.pumpSystemCurveData.next(dataObj);
  }

  calculateFluidPowers(pumpSystemCurveData: PumpSystemCurveData) {
    this.pointOneFluidPower = this.pumpSystemCurveFormService.calculatePumpFluidPower(pumpSystemCurveData.pointOneHead, pumpSystemCurveData.pointOneFlowRate, pumpSystemCurveData.specificGravity, this.settings);
    this.pointTwoFluidPower = this.pumpSystemCurveFormService.calculatePumpFluidPower(pumpSystemCurveData.pointTwoHead, pumpSystemCurveData.pointTwoFlowRate, pumpSystemCurveData.specificGravity, this.settings);
  }

  togglePumpModification() {
      if (this.pumpModificationCollapsed == 'closed') {
        this.pumpModificationCollapsed = 'open';
        this.systemAndEquipmentCurveService.pumpModificationCollapsed.next(this.pumpModificationCollapsed);
      } else {
        this.pumpModificationCollapsed = 'closed';
        this.systemAndEquipmentCurveService.pumpModificationCollapsed.next(this.pumpModificationCollapsed);
      }
      this.systemAndEquipmentCurveService.updateGraph.next(true);
  }
}
