import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { EfficiencyImprovementInputs, EfficiencyImprovementOutputs } from '../../../../shared/models/phast/efficiencyImprovement';
import { Settings } from '../../../../shared/models/settings';
import { EfficiencyImprovementService } from '../efficiency-improvement.service';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { OperatingHours } from '../../../../shared/models/operations';
@Component({
  selector: 'app-efficiency-improvement-form',
  templateUrl: './efficiency-improvement-form.component.html',
  styleUrls: ['./efficiency-improvement-form.component.css']
})
export class EfficiencyImprovementFormComponent implements OnInit {
  @Input()
  form: UntypedFormGroup;
  @Input()
  efficiencyImprovementOutputs: EfficiencyImprovementOutputs;
  @Output('calculate')
  calculate = new EventEmitter<EfficiencyImprovementInputs>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  showOperatingHoursModal: boolean = false;
  operatingHoursControl: AbstractControl;
  formWidth: number;

  constructor(private efficiencyImprovementService: EfficiencyImprovementService) { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.setOpHoursModalWidth();
  }

  calc() {
    let efficiencyImprovementInputs: EfficiencyImprovementInputs = this.efficiencyImprovementService.getObjFromForm(this.form);
    this.efficiencyImprovementService.updateFormValidators(this.form, efficiencyImprovementInputs);
    this.form.controls.currentCombustionAirTemp.markAsDirty({ onlySelf: true });
    this.form.controls.currentCombustionAirTemp.updateValueAndValidity({ onlySelf: true, emitEvent: true });
    this.form.controls.newCombustionAirTemp.markAsDirty({ onlySelf: true });
    this.form.controls.newCombustionAirTemp.updateValueAndValidity({ onlySelf: true, emitEvent: true });
    this.calculate.emit(efficiencyImprovementInputs);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  focusOut() {
    this.changeField.emit('default');
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal(opHoursControl: AbstractControl) {
    this.operatingHoursControl = opHoursControl;
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.efficiencyImprovementService.operatingHours = oppHours;
    this.operatingHoursControl.patchValue(oppHours.hoursPerYear);
    this.calc();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
