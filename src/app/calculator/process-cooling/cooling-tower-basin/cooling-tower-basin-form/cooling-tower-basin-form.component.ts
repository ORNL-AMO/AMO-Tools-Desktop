import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CoolingTowerBasinInput } from '../../../../shared/models/chillers';
import { OperatingHours } from '../../../../shared/models/operations';
import { Settings } from '../../../../shared/models/settings';
import { CoolingTowerBasinFormService, CoolingTowerBasinWarnings } from '../cooling-tower-basin-form.service';
import { CoolingTowerBasinService } from '../cooling-tower-basin.service';

@Component({
  selector: 'app-cooling-tower-basin-form',
  templateUrl: './cooling-tower-basin-form.component.html',
  styleUrls: ['./cooling-tower-basin-form.component.css']
})
export class CoolingTowerBasinFormComponent implements OnInit {

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
  hasWeatherBinsDataSub: Subscription;
  generateExampleSub: Subscription;
  isShowingWeatherResultsSub: Subscription;
  warnings: CoolingTowerBasinWarnings;

  showOpHoursModal: boolean = false;
  formWidth: number;
  hasWeatherBinsData: boolean;
  isShowingWeatherResults: boolean;

  constructor(private coolingTowerBasinService: CoolingTowerBasinService, 
              private coolingTowerBasinFormService: CoolingTowerBasinFormService) { }

  ngOnInit() {
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.resetDataSub = this.coolingTowerBasinService.resetData.subscribe(value => {
      this.initForm();
    })
    this.generateExampleSub = this.coolingTowerBasinService.generateExample.subscribe(value => {
      this.initForm();
    });
    this.hasWeatherBinsDataSub = this.coolingTowerBasinService.hasWeatherBinsData.subscribe(value => {
      this.hasWeatherBinsData = value;
    });
    this.isShowingWeatherResultsSub = this.coolingTowerBasinService.isShowingWeatherResults.subscribe(value => {
      this.isShowingWeatherResults = value;
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
    this.hasWeatherBinsDataSub.unsubscribe();
    this.isShowingWeatherResultsSub.unsubscribe();
  }

  initForm() {
    let coolingTowerBasinInput: CoolingTowerBasinInput = this.coolingTowerBasinService.coolingTowerBasinInput.getValue();
    this.form = this.coolingTowerBasinFormService.getCoolingTowerBasinForm(coolingTowerBasinInput, this.settings);
    this.calculate();
  }

  focusField(str: string) {
    this.coolingTowerBasinService.currentField.next(str);
  }

  calculate() {
    this.warnings = this.coolingTowerBasinFormService.checkCoolingTowerBasinWarnings(this.form, this.settings);
    let updatedInput: CoolingTowerBasinInput = this.coolingTowerBasinFormService.getCoolingTowerBasinInput(this.form);
    this.coolingTowerBasinService.coolingTowerBasinInput.next(updatedInput)
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

