import { Component, OnInit, Input } from '@angular/core';
import { PSAT, Adjustment } from '../../shared/models/psat';
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

  adjustmentForm: any;

  constructor(private assessmentService: AssessmentService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    if (!this.baseline.adjustments) {
      this.baseline.adjustments = new Array();
    }
    this.baseline.selected = false;
    this.adjustmentForm = this.initForm(this.baseline);
  }

  addAdjustment() {
    if (this.baseline.adjustments.length > 0) {
      let adjustedPsat = this.createPsatFromForm();
      this.saveAdjustment(adjustedPsat);
    }
    let newAdjustmentPsat = this.assessmentService.getBaselinePSAT();
    newAdjustmentPsat.selected = true;
    this.baseline.adjustments.push({ psat: newAdjustmentPsat, name: 'Adjustment ' + (this.baseline.adjustments.length + 1) });
    this.adjustmentForm = this.initForm(this.baseline.adjustments[this.baseline.adjustments.length - 1].psat);
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

  changeSelect($event) {
    let adjustedPsat = this.createPsatFromForm();
    if ($event == 'baseline') {
      this.baseline.selected = true;
      this.saveAdjustment(adjustedPsat);
    }
    else {
      this.baseline.selected = false;
      this.saveAdjustment(adjustedPsat);

      this.baseline.adjustments.forEach(adjustment => {
        if (adjustment.name == $event) {
          adjustment.psat.selected = true;
          this.adjustmentForm = this.initForm(adjustment.psat);
        }
        else {
          adjustment.psat.selected = false;
        }
      })
    }
  }

  saveAdjustment(adjustedPsat: PSAT) {
    this.baseline.adjustments.forEach(adjustment => {
      if (adjustment.psat.selected == true) {
        adjustment.psat = adjustedPsat;
        adjustment.psat.selected = false;
      }
    })
  }


  initForm(psat: PSAT) {
    return this.formBuilder.group({
      'pumpType': [psat.pump_style],
      'pumpRPM': [psat.pump_rated_speed],
      'drive': [psat.drive],
      'viscosity': [psat.kinematic_viscosity],
      'gravity': [psat.specific_gravity],
      'stages': [psat.stages],
      'fixedSpeed': [''],
      'frequency': [psat.line_frequency],
      'horsePower': [psat.motor_rated_power],
      'motorRPM': [psat.motor_rated_speed],
      'efficiencyClass': [psat.efficiency_class],
      'voltage': [psat.motor_field_voltage],
      'fullLoadAmps': [psat.full_load_amps],
      'sizeMargin': [psat.margin],
      'operatingFraction': [psat.operating_fraction],
      'costKwHr': [psat.cost_kw_hour],
      'flowRate': [psat.flow_rate],
      'head': [psat.head],
      'loadEstimatedMethod': [psat.load_estimation_method],
      'motorKW': [psat.motor_field_voltage]
    })
  }

  createPsatFromForm() {
    let tmpPSAT = this.assessmentService.buildPSAT(
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
    return tmpPSAT;
  }

}
