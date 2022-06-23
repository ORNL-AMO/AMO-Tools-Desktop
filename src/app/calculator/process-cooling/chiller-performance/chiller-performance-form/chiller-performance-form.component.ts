import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChillerPerformanceInput } from '../../../../shared/models/chillers';
import { OperatingHours } from '../../../../shared/models/operations';
import { Settings } from '../../../../shared/models/settings';
import { chillerCharacteristics, ChillerCharacteristics } from '../../process-cooling-defaults';
import { ChillerPerformanceFormService } from '../chiller-performance-form.service';
import { ChillerPerformanceService } from '../chiller-performance.service';

@Component({
  selector: 'app-chiller-performance-form',
  templateUrl: './chiller-performance-form.component.html',
  styleUrls: ['./chiller-performance-form.component.css']
})
export class ChillerPerformanceFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inModal: boolean;
  @Input()
  headerHeight: number;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  form: FormGroup;
  characteristics: ChillerCharacteristics;
  
  resetDataSub: Subscription;
  generateExampleSub: Subscription;

  showOpHoursModal: boolean = false;
  formWidth: number;

  constructor(private chillerPerformanceService: ChillerPerformanceService, 
              private chillerPerformanceFormService: ChillerPerformanceFormService,
              private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.initSubscriptions();
    this.initForm();
  }

  initSubscriptions() {
    this.resetDataSub = this.chillerPerformanceService.resetData.subscribe(isPressed => {
      if (isPressed) this.initForm();
    })
    this.generateExampleSub = this.chillerPerformanceService.generateExample.subscribe(isPressed => {
      if (isPressed) this.initForm();
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
    let chillerPerformanceInput: ChillerPerformanceInput = this.chillerPerformanceService.chillerPerformanceInput.getValue();
    this.form = this.chillerPerformanceFormService.getChillerPerformanceForm(chillerPerformanceInput);
    this.setChillerCharacteristics();
  }

  setChillerCharacteristics() {
    this.characteristics = JSON.parse(JSON.stringify(chillerCharacteristics));
    this.cd.detectChanges();
    if (this.form.value.chillerType == 0) {
      this.setCentrifugalChillerOptions();
    } else if (this.form.value.chillerType == 1) {
      this.setScrewChillerOptions();
    } 
    this.calculate();
  }

  setCentrifugalChillerOptions() {
    this.form.controls.compressorConfigType.enable();
    this.form.controls.motorDriveType.enable();
    this.characteristics.motorDriveTypes.pop();

    if (this.form.value.condenserCoolingType == 0 && this.form.value.motorDriveType == 1) {
      this.characteristics.compressorConfigTypes.pop();
    }

    if (this.form.value.condenserCoolingType == 1) {
      this.characteristics.compressorConfigTypes.splice(1, 2);
      this.form.patchValue({compressorConfigType: 0});
      this.form.controls.compressorConfigType.disable();
    } 
    this.form.controls.compressorConfigType.updateValueAndValidity();

    this.form.patchValue({maxCapacityRatio: 0.92});
    this.form.controls.maxCapacityRatio.enable();
    this.form.controls.maxCapacityRatio.updateValueAndValidity();
  }

  setScrewChillerOptions() {
    this.form.patchValue({motorDriveType: 2});
    this.form.controls.motorDriveType.disable();
    this.form.controls.motorDriveType.updateValueAndValidity();

    this.form.patchValue({compressorConfigType: 0});
    this.form.controls.compressorConfigType.disable();
    this.form.controls.compressorConfigType.updateValueAndValidity();

    this.form.patchValue({maxCapacityRatio: 1});
    this.form.controls.maxCapacityRatio.disable();
    this.form.controls.maxCapacityRatio.updateValueAndValidity();
  }


  focusField(str: string) {
    this.chillerPerformanceService.currentField.next(str);
  }

  calculate() {
    this.form = this.chillerPerformanceFormService.setWaterTempValidators(this.form);
    let updatedInput: ChillerPerformanceInput = this.chillerPerformanceFormService.getChillerPerformanceInput(this.form);
    this.chillerPerformanceService.chillerPerformanceInput.next(updatedInput)
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

