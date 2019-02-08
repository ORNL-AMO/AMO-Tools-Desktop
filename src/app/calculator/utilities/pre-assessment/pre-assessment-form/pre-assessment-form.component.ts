import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { PreAssessment } from '../pre-assessment';
import { Settings } from '../../../../shared/models/settings';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { PreAssessmentService } from '../pre-assessment.service';
@Component({
  selector: 'app-pre-assessment-form',
  templateUrl: './pre-assessment-form.component.html',
  styleUrls: ['./pre-assessment-form.component.css'],
  animations: [
    trigger('collapsed', [
      state('open', style({
        height: 500,
        opacity: 100
      })),
      state('closed', style({
        height: 0,
        opacity: 0
      })),
      transition('closed => open', animate('.5s ease-in')),
      transition('open => closed', animate('.5s ease-out'))
    ])
  ]
})
export class PreAssessmentFormComponent implements OnInit {
  @Input()
  assessment: PreAssessment;
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalcualte = new EventEmitter<boolean>();
  @Output('emitCollapse')
  emitCollapse = new EventEmitter<boolean>();
  @Output('emitDelete')
  emitDelete = new EventEmitter<boolean>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  @Output('emitAssessmentType')
  emitAssessmentType = new EventEmitter<string>();
  @Output('emitEnergyType')
  emitEnergyType = new EventEmitter<string>();

  isEditingName: boolean = false;

  @ViewChild('copyTable') copyTable: ElementRef;
  tableString: any;

  constructor(private preAssessmentService: PreAssessmentService) { }

  ngOnInit() {
  }


  editName() {
    this.isEditingName = true;
  }

  doneEditingName() {
    this.isEditingName = false;
  }

  calculate() {
    this.emitCalcualte.emit(true);
  }

  collapsePreAssessment() {
    this.emitCollapse.emit(true);
  }

  deletePreAssessment() {
    this.emitDelete.emit(true);
  }

  changeField(data: { inputField: string, energyType: string }) {
    this.emitChangeField.emit(data.inputField);
    this.emitEnergyType.emit(data.energyType);
    this.changeAssessmentType();
  }

  changeAssessmentType() {
    this.emitAssessmentType.emit(this.assessment.type);
  }

  setFurnaceType(str: string) {
    if (str == 'Electricity') {
      this.assessment.electric = !this.assessment.electric;
      if (this.assessment.designedEnergy) {
        this.assessment.designedEnergy.electricity = this.assessment.electric;
      }
    }

    if (str == 'Steam') {
      this.assessment.steam = !this.assessment.steam;
      if (this.assessment.designedEnergy) {
        this.assessment.designedEnergy.steam = this.assessment.steam;
      }
    }

    if (str == 'Fuel') {
      this.assessment.fuel = !this.assessment.fuel;
      if (this.assessment.designedEnergy) {
        this.assessment.designedEnergy.fuel = this.assessment.fuel;
      }
    }
    //  this.assessment.settings.energySourceType = str;
    //  this.changeEnergyType();
  }

  setAssessmentType(str: string) {
    this.assessment.type = str;
  }

  getEnergyUsed(assessment: PreAssessment) {
    if (assessment.type == 'Metered') {
      let result: { name: string, percent: number, value: number, color: string, energyCost: number } = this.preAssessmentService.calculateMetered(assessment, assessment.settings);
      if (result) {
        return result.value;
      } else {
        return 0;
      }
    } else if (assessment.type == 'Designed') {
      let result: { name: string, percent: number, value: number, color: string, energyCost: number } = this.preAssessmentService.calculateDesigned(assessment, assessment.settings);
      if (result) {
        return result.value;
      } else {
        return 0;
      }
    }
  }

  getEnergyCost(assessment: PreAssessment) {
    if (assessment.type == 'Metered') {
      let result: { name: string, percent: number, value: number, color: string, energyCost: number } = this.preAssessmentService.calculateMetered(assessment, assessment.settings);
      if (result) {
        return result.energyCost;
      } else {
        return 0;
      }
    } else if (assessment.type == 'Designed') {
      let result: { name: string, percent: number, value: number, color: string, energyCost: number } = this.preAssessmentService.calculateDesigned(assessment, assessment.settings);
      if (result) {
        return result.energyCost;
      } else {
        return 0;
      }
    }
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
