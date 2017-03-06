import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { PSAT, PsatInputs } from '../../shared/models/psat';
import { AssessmentService } from '../../assessment/assessment.service';
import * as _ from 'lodash';
import { FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-modify-conditions',
  templateUrl: './modify-conditions.component.html',
  styleUrls: ['./modify-conditions.component.css']
})
export class ModifyConditionsComponent implements OnInit {
  @Input()
  baseline: PSAT;
  @Output('selectedAdjustment')
  selectedAdjustment = new EventEmitter<PSAT>();

  adjustmentForm: any;

  constructor(private assessmentService: AssessmentService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    if (!this.baseline.adjustments) {
      this.baseline.adjustments = new Array();
      this.addAdjustment();
    }
    this.baseline.selected = false;
    this.baseline.name = 'Baseline';
    this.adjustmentForm = this.initForm(this.baseline);
    this.selectedAdjustment.emit(this.baseline.adjustments[this.baseline.adjustments.length - 1]);
  }

  addAdjustment() {
    if (this.baseline.adjustments.length > 0) {
      let adjustedPsatInputs: PsatInputs = this.createPsatInputsFromForm();
      this.saveAdjustment(adjustedPsatInputs);
    }
    let newAdjustmentPsat = this.assessmentService.getBaselinePSAT();
    newAdjustmentPsat.name = 'Adjustment ' + (this.baseline.adjustments.length + 1);
    newAdjustmentPsat.optimizationRating = Math.random() * 100;
    newAdjustmentPsat.savings =  Math.random() * 10000;
    this.baseline.adjustments.push(newAdjustmentPsat);
    this.adjustmentForm = this.initForm(this.baseline.adjustments[this.baseline.adjustments.length - 1]);
    this.changeSelect(this.baseline.adjustments[this.baseline.adjustments.length-1].name);
    this.selectedAdjustment.emit(this.baseline.adjustments[this.baseline.adjustments.length - 1]);
  }


  removeAdjustment($event) {
    this.baseline.adjustments = _.remove(this.baseline.adjustments, adjustment => {
      return $event != adjustment.name;
    })
    this.renameAdjustments();
  }

  renameAdjustments() {
    let index = 1;
    this.baseline.adjustments.forEach(adjustment => {
      adjustment.name = 'Adjustment ' + index;
      index++;
    })
  }

  changeSelect(str: string) {
    let adjustedPsatInputs = this.createPsatInputsFromForm();
    if (str == 'baseline') {
      this.baseline.selected = true;
      this.saveAdjustment(adjustedPsatInputs);
    }
    else {
      this.baseline.selected = false;
      this.saveAdjustment(adjustedPsatInputs);

      this.baseline.adjustments.forEach(adjustment => {
        if (adjustment.name == str) {
          adjustment.selected = true;
          this.adjustmentForm = this.initForm(adjustment);
          this.selectedAdjustment.emit(adjustment);
        }
        else {
          adjustment.selected = false;
        }
      })
    }
  }

  saveAdjustment(adjustedPsatInputs: PsatInputs) {
    this.baseline.adjustments.forEach(adjustment => {
      if (adjustment.selected == true) {
        adjustment.inputs = adjustedPsatInputs;
        adjustment.selected = false;
      }
    })
  }


  initForm(psat: PSAT) {
    return this.formBuilder.group({
      'pumpType': [psat.inputs.pump_style],
      'pumpRPM': [psat.inputs.pump_rated_speed],
      'drive': [psat.inputs.drive],
      'viscosity': [psat.inputs.kinematic_viscosity],
      'gravity': [psat.inputs.specific_gravity],
      'stages': [psat.inputs.stages],
      'fixedSpeed': [''],
      'frequency': [psat.inputs.line_frequency],
      'horsePower': [psat.inputs.motor_rated_power],
      'motorRPM': [psat.inputs.motor_rated_speed],
      'efficiencyClass': [psat.inputs.efficiency_class],
      'voltage': [psat.inputs.motor_field_voltage],
      'fullLoadAmps': [psat.inputs.full_load_amps],
      'sizeMargin': [psat.inputs.margin],
      'operatingFraction': [psat.inputs.operating_fraction],
      'costKwHr': [psat.inputs.cost_kw_hour],
      'flowRate': [psat.inputs.flow_rate],
      'head': [psat.inputs.head],
      'loadEstimatedMethod': [psat.inputs.load_estimation_method],
      'motorKW': [psat.inputs.motor_field_voltage]
    })
  }

  createPsatInputsFromForm() {
    let tmpPSATinputs = this.assessmentService.buildPsatInputs(
      this.adjustmentForm.value.pumpType,
      '',
      this.adjustmentForm.value.pumpRPM,
      this.adjustmentForm.value.drive,
      this.adjustmentForm.value.viscosity,
      this.adjustmentForm.value.gravity,
      this.adjustmentForm.value.stages,
      this.adjustmentForm.value.fixedSpeed,
      this.adjustmentForm.value.frequency,
      this.adjustmentForm.value.horsePower,
      this.adjustmentForm.value.motorRPM,
      this.adjustmentForm.value.efficiencyClass,
      '',
      this.adjustmentForm.value.voltage,
      this.adjustmentForm.value.loadEstimatedMethod,
      '',
      this.adjustmentForm.value.fullLoadAmps,
      this.adjustmentForm.value.sizeMargin,
      this.adjustmentForm.value.operatingFraction,
      this.adjustmentForm.value.flowRate,
      this.adjustmentForm.value.head,
      this.adjustmentForm.value.motorRPM,
      this.adjustmentForm.value.motorKW,
      this.adjustmentForm.value.voltage,
      this.adjustmentForm.value.costKwHr
    );
    return tmpPSATinputs;
  }

}
