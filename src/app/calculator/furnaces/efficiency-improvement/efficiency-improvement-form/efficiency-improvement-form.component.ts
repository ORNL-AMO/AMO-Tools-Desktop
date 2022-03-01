import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { EfficiencyImprovement } from '../../../../shared/models/phast/efficiencyImprovement';
import { Settings } from '../../../../shared/models/settings';
import { EfficiencyImprovementService } from '../efficiency-improvement.service';
import { AbstractControl, FormGroup } from '@angular/forms';
import { OperatingHours } from '../../../../shared/models/operations';
import { FlueGasMaterial } from '../../../../shared/models/materials';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
@Component({
  selector: 'app-efficiency-improvement-form',
  templateUrl: './efficiency-improvement-form.component.html',
  styleUrls: ['./efficiency-improvement-form.component.css']
})
export class EfficiencyImprovementFormComponent implements OnInit {
  @Input()
  efficiencyImprovement: EfficiencyImprovement;
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
  options: Array<FlueGasMaterial>;

  constructor(private efficiencyImprovementService: EfficiencyImprovementService, private suiteDbService: SuiteDbService) { }

  ngOnInit(): void {
    if(this.baselineSelected){
      this.idString = 'baseline';     
    } else {
      this.idString = 'modification';
    }
    this.init();
  }
  init(){
    this.options = this.suiteDbService.selectGasFlueGasMaterials();
    if(this.baselineSelected){
      this.form = this.efficiencyImprovementService.getFormFromObjInputData(this.efficiencyImprovement.baseline);
    } else {
      this.form = this.efficiencyImprovementService.getFormFromObjInputData(this.efficiencyImprovement.modification);
    }
    this.setFormState();
  }
  setFormState() {
    if (this.selected == false) {
      this.form.disable();
    } else {
      this.form.enable();
    }
    this.save();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      this.options = this.suiteDbService.selectGasFlueGasMaterials();
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
    this.save();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  setProperties(){
    this.save();
  }
}
