import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { CoolingTowerFanInput } from '../../../../shared/models/chillers';
import { OperatingHours } from '../../../../shared/models/operations';
import { Settings } from '../../../../shared/models/settings';
import { CoolingTowerFanFormService } from '../cooling-tower-fan-form.service';
import { CoolingTowerFanService } from '../cooling-tower-fan.service';

@Component({
  selector: 'app-cooling-tower-fan-form',
  templateUrl: './cooling-tower-fan-form.component.html',
  styleUrls: ['./cooling-tower-fan-form.component.css']
})
export class CoolingTowerFanFormComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  form: FormGroup;
  
  resetDataSub: Subscription;
  generateExampleSub: Subscription;

  showOpHoursModal: boolean = false;
  formWidth: number;

  results: {range: number, approach: number};
  towerTypes = [{display: 'Open Tower', value: 0}];
  fanControlTypes = [
    {display: 'One Speed', value: 0},
    {display: 'Two Speed', value: 1},
    {display: 'Variable Speed', value: 2},
  ];

  constructor(private coolingTowerFanService: CoolingTowerFanService, 
              private coolingTowerFanFormService: CoolingTowerFanFormService) { }

  ngOnInit() {
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.resetDataSub = this.coolingTowerFanService.resetData.subscribe(value => {
      this.initForm();
    })
    this.generateExampleSub = this.coolingTowerFanService.generateExample.subscribe(value => {
      this.initForm();
    })
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  } 

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
  }

  initForm() {
    let coolingTowerFanInput: CoolingTowerFanInput = this.coolingTowerFanService.coolingTowerFanInput.getValue();
    this.form = this.coolingTowerFanFormService.getCoolingTowerFanForm(coolingTowerFanInput);
    this.calculate();
  }

  focusField(str: string) {
    this.coolingTowerFanService.currentField.next(str);
  }

  calculate() {
    this.form = this.coolingTowerFanFormService.setWaterTempValidators(this.form);
    let updatedInput: CoolingTowerFanInput = this.coolingTowerFanFormService.getCoolingTowerFanInput(this.form);
    this.coolingTowerFanService.coolingTowerFanInput.next(updatedInput);
    this.calculateTemperatureResults(updatedInput);
  }

  calculateTemperatureResults(input: CoolingTowerFanInput) {
    this.results = {range: 0, approach: 0};
    this.results.range = input.waterEnteringTemp - input.waterLeavingTemp;
    this.results.approach = input.waterLeavingTemp - input.operatingTempWetBulb;
  }

  closeOperatingHoursModal() {
    this.showOpHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOpHoursModal = true;
  }

  updateOperatingHours(operatingHours: OperatingHours) {
    this.showOpHoursModal
    this.form.controls.operatingHours.patchValue(operatingHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}

