import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OperatingHours } from '../../../../shared/models/operations';
import { Settings } from '../../../../shared/models/settings';
import { WaterHeatingInput } from '../../../../shared/models/steam/waterHeating';
import { WaterHeatingFormService, WaterHeatingWarnings } from '../water-heating-form.service';
import { WaterHeatingService } from '../water-heating.service';

@Component({
  selector: 'app-water-heating-form',
  templateUrl: './water-heating-form.component.html',
  styleUrls: ['./water-heating-form.component.css']
})
export class WaterHeatingFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  form: UntypedFormGroup;
  
  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  outputSub: Subscription;

  warnings: WaterHeatingWarnings;
  showBoilingPointResultWarning: boolean;
  formWidth: number;
  showOperatingHoursModal: boolean;

  constructor(private waterHeatingService: WaterHeatingService, 
              private waterHeatingFormService: WaterHeatingFormService) { }

  ngOnInit() {
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.resetDataSub = this.waterHeatingService.resetData.subscribe(value => {
      this.initForm();
    });
    this.generateExampleSub = this.waterHeatingService.generateExample.subscribe(value => {
      this.initForm();
    });
    this.outputSub = this.waterHeatingService.waterHeatingOutput.subscribe(output => {
      this.showBoilingPointResultWarning = output.bpTempWarningFlag;
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
    this.outputSub.unsubscribe();
  }

  initForm() {
    let waterHeatingInput: WaterHeatingInput = this.waterHeatingService.waterHeatingInput.getValue();
    this.form = this.waterHeatingFormService.getWaterHeatingForm(waterHeatingInput, this.settings);
    this.calculate();
  }

  focusField(str: string) {
    this.waterHeatingService.currentField.next(str);
  }

  calculate() {
    this.warnings = this.waterHeatingFormService.checkWarnings(this.form, this.settings);
    let updatedInput: WaterHeatingInput = this.waterHeatingFormService.getWaterHeatingInput(this.form);
    this.waterHeatingService.waterHeatingInput.next(updatedInput)
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  setUtilityType() {
    this.form.controls.hxUtilityType.patchValue(this.form.controls.boilerUtilityType.value);
    if (this.inTreasureHunt) {
      this.setTreasureHuntFuelCost(this.form.controls.boilerUtilityType.value);
    }
    this.calculate();
  }

  
  setTreasureHuntFuelCost(energySourceType: string) {
    let treasureHuntFuelCost = this.waterHeatingService.getTreasureHuntFuelCost(energySourceType, this.settings);
    this.form.patchValue({fuelCost: treasureHuntFuelCost});
    this.form.patchValue({fuelCostBoiler: treasureHuntFuelCost});
    this.calculate();
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.form.controls.operatingHours.patchValue(oppHours.hoursPerYear);
    this.form.controls.operatingHours.updateValueAndValidity();
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
