import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Assessment } from '../shared/models/assessment';
import { AssessmentService } from '../assessment/assessment.service';
import { FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-psat',
  templateUrl: './psat.component.html',
  styleUrls: ['./psat.component.css']
})
export class PsatComponent implements OnInit {
  assessment: Assessment;

  panelView: string = 'help-panel';
  isPanelOpen: boolean = true;
  currentTab: number = 1;

  psatForm: any;

  constructor(private location: Location, private assessmentService: AssessmentService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.assessment = this.assessmentService.getWorkingAssessment();
    this.psatForm = this.initForm();
  }

  changeTab($event){
    this.currentTab = $event;
  }

  toggleOpenPanel($event){
    if(!this.isPanelOpen) {
      this.panelView = $event;
      this.isPanelOpen = true;
    }else if(this.isPanelOpen && $event != this.panelView){
      this.panelView = $event;
    }else{
      this.isPanelOpen = false;
    }
  }

  continue(){
    this.save();
    this.currentTab++;
  }

  close(){
    this.location.back();
  }

  goBack(){
    this.currentTab--;
  }

  save(){
    let tmpPSAT = this.assessmentService.buildPSAT(
      this.psatForm.value.pumpType,
      '',
      this.psatForm.value.pumpRPM,
      this.psatForm.value.drive,
      this.psatForm.value.viscosity,
      this.psatForm.value.gravity,
      this.psatForm.value.stages,
      this.psatForm.value.fixedSpeed,
      this.psatForm.value.frequency,
      this.psatForm.value.horsePower,
      this.psatForm.value.motorRPM,
      this.psatForm.value.efficiencyClass,
      '',
      this.psatForm.value.voltage,
      this.psatForm.value.loadEstimatedMethod,
      '',
      this.psatForm.value.fullLoadAmps,
      this.psatForm.value.sizeMargin,
      this.psatForm.value.operatingFraction,
      this.psatForm.value.flowRate,
      this.psatForm.value.head,
      this.psatForm.value.motorRPM,
      this.psatForm.value.motorKW,
      this.psatForm.value.voltage,
      this.psatForm.value.costKwHr
    );
    this.assessment.psat = tmpPSAT;
    this.assessmentService.setWorkingAssessment(this.assessment);
  }

  exportData(){
    //TODO: Logic for saving assessment
  }

  initForm(){
    return this.formBuilder.group({
      'pumpType': [this.assessment.psat.pump_style],
      'pumpRPM': [this.assessment.psat.pump_rated_speed],
      'drive': [this.assessment.psat.drive],
      'viscosity': [this.assessment.psat.kinematic_viscosity],
      'gravity': [this.assessment.psat.specific_gravity],
      'stages': [this.assessment.psat.stages],
      'fixedSpeed': ['No'],
      'frequency': [this.assessment.psat.line_frequency],
      'horsePower': [this.assessment.psat.motor_rated_power],
      'motorRPM': [this.assessment.psat.motor_rated_speed],
      'efficiencyClass': [this.assessment.psat.efficiency_class],
      'voltage': [this.assessment.psat.motor_field_voltage],
      'fullLoadAmps': [this.assessment.psat.full_load_amps],
      'sizeMargin': [this.assessment.psat.margin],
      'operatingFraction': [this.assessment.psat.operating_fraction],
      'costKwHr': [this.assessment.psat.cost_kw_hour],
      'flowRate': [this.assessment.psat.flow_rate],
      'head': [this.assessment.psat.head],
      'loadEstimatedMethod': [this.assessment.psat.load_estimation_method],
      'motorKW': [this.assessment.psat.motor_field_voltage]
    })
  }
}
