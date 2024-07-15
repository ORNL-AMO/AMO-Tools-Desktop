import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { MotorEnergy } from '../../../shared/models/water-assessment';
import { WaterAssessmentService } from '../../water-assessment.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { MotorEnergyService } from './motor-energy.service';
import { OperatingHours } from '../../../shared/models/operations';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { PercentLoadEstimationService } from '../../../calculator/motors/percent-load-estimation/percent-load-estimation.service';
import { copyObject } from '../../../shared/helperFunctions';

@Component({
  selector: 'app-motor-energy',
  templateUrl: './motor-energy.component.html',
  styleUrl: './motor-energy.component.css'
})
export class MotorEnergyComponent {
  @Input()
  motorEnergy: MotorEnergy;
  @Output()
  updateMotorEnergy: EventEmitter<MotorEnergy> = new EventEmitter<MotorEnergy>();
  settings: Settings;
  form: FormGroup;
  formWidth: number;
  showOperatingHoursModal: boolean = false;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  @ViewChild('loadFactorModal', { static: false }) public loadFactorModal: ModalDirective;


  constructor(private waterAssessmentService: WaterAssessmentService, 
    private percentLoadEstimationService: PercentLoadEstimationService,
    private motorEnergyService: MotorEnergyService) {}

  ngOnInit() {
    this.settings = this.waterAssessmentService.settings.getValue();
    this.initForm();
  }

  ngOnDestroy() {}

  initForm() {
   this.form = this.motorEnergyService.getMotorEnergyForm(this.motorEnergy);
  }

  save() {
    let updatedMotorEnergy: MotorEnergy = this.motorEnergyService.getMotorEnergyFromForm(this.form);
    this.updateMotorEnergy.emit(updatedMotorEnergy);
  }

  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }
  
  setOpHoursModalWidth() {
    if (this.formElement && this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
    this.waterAssessmentService.modalOpen.next(false);
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
    this.waterAssessmentService.modalOpen.next(true);
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.motorEnergyService.operatingHours = oppHours;
    this.form.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.save();
    this.closeOperatingHoursModal();
  }

  calculateSystemEfficiency() {

  }

  showLoadFactorModal() {
    this.percentLoadEstimationService.fieldMeasurementInputs = {
      phase1Voltage: 0,
      phase1Amps: 0,
      phase2Voltage: 0,
      phase2Amps: 0,
      phase3Voltage: 0,
      phase3Amps: 0,
      ratedVoltage: 0,
      ratedCurrent: 0,
      powerFactor: this.form.controls.loadFactor.value
    }
    this.waterAssessmentService.modalOpen.next(true);
    this.loadFactorModal.show();
  }

  hideLoadFactorModal() {
    this.loadFactorModal.hide();
    this.waterAssessmentService.modalOpen.next(false);
  }

  applyModalData() {
    let percentLoad: number;
    percentLoad = this.percentLoadEstimationService.getResults(this.percentLoadEstimationService.fieldMeasurementInputs).percentLoad;
    this.form.controls.loadFactor.patchValue(Number(percentLoad.toFixed(1)));
    this.save();
    this.hideLoadFactorModal();
  }


}

