import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChillerStagingInput } from '../../../../shared/models/chillers';
import { OperatingHours } from '../../../../shared/models/operations';
import { Settings } from '../../../../shared/models/settings';
import { chillerCharacteristics, ChillerCharacteristics } from '../../process-cooling-defaults';
import { ChillerStagingFormService } from '../chiller-staging-form.service';
import { ChillerStagingService } from '../chiller-staging.service';

@Component({
    selector: 'app-chiller-staging-form',
    templateUrl: './chiller-staging-form.component.html',
    styleUrls: ['./chiller-staging-form.component.css'],
    standalone: false
})
export class ChillerStagingFormComponent implements OnInit {
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
  form: UntypedFormGroup;
  characteristics: ChillerCharacteristics;
  
  resetDataSub: Subscription;
  generateExampleSub: Subscription;

  showOpHoursModal: boolean = false;
  formWidth: number;

  constructor(private chillerStagingService: ChillerStagingService, 
              private chillerStagingFormService: ChillerStagingFormService,
              private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.initSubscriptions();
    this.initForm();
  }

  initSubscriptions() {
    this.resetDataSub = this.chillerStagingService.resetData.subscribe(isPressed => {
      if (isPressed) this.initForm();
    });
    this.generateExampleSub = this.chillerStagingService.generateExample.subscribe(isPressed => {
      if (isPressed) this.initForm();
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
  }

  initForm() {
    let chillerStagingInput: ChillerStagingInput = this.chillerStagingService.chillerStagingInput.getValue();
    this.form = this.chillerStagingFormService.getChillerStagingForm(chillerStagingInput);
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

  addChiller() {
    this.form = this.chillerStagingFormService.addChillerInputs(this.form);
    this.calculate();
  }

  removeChiller(index: number) {
    if (index > 0) {
      this.form = this.chillerStagingFormService.removeChillerInputs(this.form, index);
      this.calculate();
    }
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
    this.chillerStagingService.currentField.next(str);
  }

  calculate() {
    let updatedInput: ChillerStagingInput = this.chillerStagingFormService.getChillerStagingInput(this.form);
    this.form = this.chillerStagingFormService.setWaterTempValidators(this.form);
    this.form.setValidators(this.chillerStagingFormService.setTotalLoadEqualityValidator);
    this.chillerStagingService.chillerStagingInput.next(updatedInput)
  }

  // Can replace with ts getter when we target ecma 5 and higher
  getBaselineLoadList(): Array<AbstractControl> { 
    let baselineLoadList: UntypedFormArray = this.form.get('baselineLoadList') as UntypedFormArray;
    return baselineLoadList.controls; 
  }
  // Can replace with ts getter when we target ecma 5 and higher
  getModLoadList(): Array<AbstractControl> { 
    let modLoadList: UntypedFormArray = this.form.get('modLoadList') as UntypedFormArray;
    return modLoadList.controls; 
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

