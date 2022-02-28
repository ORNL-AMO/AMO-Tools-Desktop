import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { EfficiencyImprovement, EfficiencyImprovementInputData, EfficiencyImprovementInputs, EfficiencyImprovementOutputs } from '../../../../shared/models/phast/efficiencyImprovement';
import { Settings } from '../../../../shared/models/settings';
import { EfficiencyImprovementService } from '../efficiency-improvement.service';
import { AbstractControl, FormGroup } from '@angular/forms';
import { OperatingHours } from '../../../../shared/models/operations';
@Component({
  selector: 'app-efficiency-improvement-form',
  templateUrl: './efficiency-improvement-form.component.html',
  styleUrls: ['./efficiency-improvement-form.component.css']
})
export class EfficiencyImprovementFormComponent implements OnInit {
  @Input()
  efficiencyImprovement: EfficiencyImprovement;
  // @Input()
  // efficiencyImprovementOutputs: EfficiencyImprovementOutputs;
  @Output('calculate')
  calculate = new EventEmitter<EfficiencyImprovement>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  baselineSelected: boolean;
  @Input()
  selected: boolean;


  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  showOperatingHoursModal: boolean = false;
  operatingHoursControl: AbstractControl;
  formWidth: number;
  form: FormGroup;
  idString: string;

  constructor(private efficiencyImprovementService: EfficiencyImprovementService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    if(this.baselineSelected){
      this.idString = 'baseline';     
    } else {
      this.idString = 'modification';
    }
    this.init();
  }
  init(){
    if(this.baselineSelected){
      this.form = this.efficiencyImprovementService.getFormFromObjInputData(this.efficiencyImprovement.baseline);
    } else {
      this.form = this.efficiencyImprovementService.getFormFromObjInputData(this.efficiencyImprovement.modification);
    }
  }
  setFormState() {
    if (this.selected == false) {
      this.form.disable();
    } else {
      this.form.enable();
    }
    this.cd.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      this.setFormState();
    }
  }

  ngAfterViewInit() {
    this.setOpHoursModalWidth();
  }

  save(){
    if(this.baselineSelected){
      this.efficiencyImprovement.baseline = this.efficiencyImprovementService.getObjInputDataFromForm(this.form);
    } else {
      this.efficiencyImprovement.modification = this.efficiencyImprovementService.getObjInputDataFromForm(this.form);
    }
    this.calculate.emit(this.efficiencyImprovement);
  }

  calc() {
    let efficiencyImprovementInputs: EfficiencyImprovementInputs = this.efficiencyImprovementService.getObjFromForm(this.form);
    this.efficiencyImprovementService.updateFormValidators(this.form, efficiencyImprovementInputs);
    this.form.controls.currentCombustionAirTemp.markAsDirty({ onlySelf: true });
    this.form.controls.currentCombustionAirTemp.updateValueAndValidity({ onlySelf: true, emitEvent: true });
    this.form.controls.newCombustionAirTemp.markAsDirty({ onlySelf: true });
    this.form.controls.newCombustionAirTemp.updateValueAndValidity({ onlySelf: true, emitEvent: true });
   // this.calculate.emit(efficiencyImprovementInputs);
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
