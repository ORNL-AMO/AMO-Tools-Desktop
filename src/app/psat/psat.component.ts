import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Assessment } from '../shared/models/assessment';
import { AssessmentService } from '../assessment/assessment.service';
import { FormBuilder } from '@angular/forms';
import { PSAT, PsatInputs } from '../shared/models/psat';
import { PsatService } from './psat.service';
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

  showDetailedReport: boolean = false;

  psatForm: any;
  saveClicked: boolean = false;
  adjustment: PSAT;
  currentField: string = 'default';

  constructor(private location: Location, private assessmentService: AssessmentService, private formBuilder: FormBuilder, private psatService: PsatService) { }

  ngOnInit() {
    this.assessment = this.assessmentService.getWorkingAssessment();
    this.psatForm = this.initForm();
    let flowRate = 454.24941359535023;
    console.log('headToolSuctionTank()');
    let t1 = this.psatService.headToolSuctionTank(1, flowRate, 455.6, 792.9, 0, 1, 254, 854.9, 0, 1);
    console.log('t1: 6.9867498670003165 = ' + t1);

    let t2 = this.psatService.headToolSuctionTank(1, flowRate, 255.6, 792.9, 0, 1, 254, 854.9, 0, 1);
    console.log('t2: 7.264536476019559 = ' + t2);

    let t3 = this.psatService.headToolSuctionTank(1, flowRate, 255.6, 692.9, 0, 1, 254, 854.9, 0, 1);
    console.log('t3: 17.464309816021647 = ' + t3);

    let t4 = this.psatService.headToolSuctionTank(1, flowRate, 255.6, 692.9, 2, 1, 254, 854.9, 0, 1);
    console.log('t4: 15.464309816021645 = ' + t4);

    let t5 = this.psatService.headToolSuctionTank(1, flowRate, 255.6, 692.9, 2, 1, 254, 854.9, 3, 1);
    console.log('t5: 18.464309816021647 = ' + t5);

    let t6 = this.psatService.headToolSuctionTank(1, flowRate, 255.6, 692.9, 2, 1, 254, 954.9, 3, 1);
    console.log('t6: 28.664083156023732 = ' + t6);

    console.log('headTool()');
    let t7 = this.psatService.headTool(1, flowRate, 355.6, 34.5, 0, 1, 254, 854.9, 0, 1);
    console.log('t7: 84.3112869348736 = ' + t7);

    let t8 = this.psatService.headTool(1, flowRate, 355.6, 34.5, 5, 1, 254, 854.9, 0, 1);
    console.log('t8: 79.3112869348736 = ' + t8);

    let t9 = this.psatService.headTool(1, flowRate, 355.6, 34.5, 5, 1, 254, 554.9, 0, 1 );
    console.log('t9: 48.711966914867354 = ' + t9);

    let t10 = this.psatService.headTool(1, flowRate, 355.6, 34.5, 5, 1, 254, 554.9, 3, 1);
    console.log('t10: 51.711966914867354 = ' + t10);


  }

  changeTab($event) {
    this.currentTab = $event;
    if (this.currentTab == 5) {
      this.panelView = 'data-panel';
    } else {
      this.panelView = 'help-panel';
    }
  }

  changeField($event) {
    this.currentField = $event;
  }

  toggleOpenPanel($event) {
    if (!this.isPanelOpen) {
      this.panelView = $event;
      this.isPanelOpen = true;
    } else if (this.isPanelOpen && $event != this.panelView) {
      this.panelView = $event;
    } else {
      this.isPanelOpen = false;
    }
  }

  selectAdjustment($event) {
    this.adjustment = $event;
  }

  continue() {
    this.save();
    this.currentTab++;
    if (this.currentTab == 5) {
      this.panelView = 'data-panel';
    } else {
      this.panelView = 'help-panel';
    }
  }

  close() {
    this.location.back();
  }

  goBack() {
    this.currentTab--;
  }

  showReport() {
    this.showDetailedReport = true;
  }

  closeReport() {
    this.showDetailedReport = false;
  }

  saveAdjustment() {
    this.saveClicked = !this.saveClicked;
  }

  save() {
    let tmpPsatInputs: PsatInputs = this.assessmentService.buildPsatInputs(
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
    let tmpPSAT: PSAT = {
      inputs: tmpPsatInputs,
      adjustments: this.assessment.psat.adjustments,
      savings: this.assessment.psat.savings,
      optimizationRating: this.assessment.psat.optimizationRating
    }
    this.assessment.psat = tmpPSAT;
    this.assessmentService.setWorkingAssessment(this.assessment);
  }

  exportData() {
    //TODO: Logic for saving assessment
  }

  initForm() {
    return this.formBuilder.group({
      'pumpType': [this.assessment.psat.inputs.pump_style],
      'pumpRPM': [this.assessment.psat.inputs.pump_rated_speed],
      'drive': [this.assessment.psat.inputs.drive],
      'viscosity': [this.assessment.psat.inputs.kinematic_viscosity],
      'gravity': [this.assessment.psat.inputs.specific_gravity],
      'stages': [this.assessment.psat.inputs.stages],
      'fixedSpeed': [this.assessment.psat.inputs.fixed_speed],
      'frequency': [this.assessment.psat.inputs.line_frequency],
      'horsePower': [this.assessment.psat.inputs.motor_rated_power],
      'motorRPM': [this.assessment.psat.inputs.motor_rated_speed],
      'efficiencyClass': [this.assessment.psat.inputs.efficiency_class],
      'voltage': [this.assessment.psat.inputs.motor_field_voltage],
      'fullLoadAmps': [this.assessment.psat.inputs.full_load_amps],
      'sizeMargin': [this.assessment.psat.inputs.margin],
      'operatingFraction': [this.assessment.psat.inputs.operating_fraction],
      'costKwHr': [this.assessment.psat.inputs.cost_kw_hour],
      'flowRate': [this.assessment.psat.inputs.flow_rate],
      'head': [this.assessment.psat.inputs.head],
      'loadEstimatedMethod': [this.assessment.psat.inputs.load_estimation_method],
      'motorKW': [this.assessment.psat.inputs.motor_field_voltage]
    })
  }
}
