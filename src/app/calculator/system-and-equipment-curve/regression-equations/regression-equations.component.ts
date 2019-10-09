import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { SystemAndEquipmentCurveService } from '../system-and-equipment-curve.service';
import { Subscription } from 'rxjs';
import { RegressionEquationsService } from './regression-equations.service';
import { EquipmentInputs, ByDataInputs, ByEquationInputs } from '../equipment-curve/equipment-curve.service';

@Component({
  selector: 'app-regression-equations',
  templateUrl: './regression-equations.component.html',
  styleUrls: ['./regression-equations.component.css']
})
export class RegressionEquationsComponent implements OnInit {
  @Input()
  equipmentType: string;
  @Input()
  isEquipmentCurvePrimary: boolean;

  baselineEquipmentCurveByDataRegressionEquation: string;
  baselineEquipmentCurveByDataRSquared: number;

  modificationEquipmentCurveByDataRegressionEquation: string;
  modificationEquipmentCurveRSquared: number;

  baselineEquipmentCurveByEquationRegressionEquation: string;
  modificationEquipmentCurveByEquationRegressionEquation: string;

  systemCurveRegressionEquation: string;

  curveDataSubscription: Subscription;
  byDataSubscription: Subscription;
  byEquationSubscription: Subscription;
  equipmentInputsSubscription: Subscription;
  selectedEquipmentCurveFormViewSub: Subscription;
  equipmentCurveCollapsedSub: Subscription;
  systemCurveCollapsedSub: Subscription;
  selectedEquipmentCurveFormView: string;
  equipmentCurveCollapsed: string;
  systemCurveCollapsed: string;

  equipmentLabel: string;
  constructor(private systemAndEquipmentCurveService: SystemAndEquipmentCurveService, private regressionEquationsService: RegressionEquationsService,
    private cd: ChangeDetectorRef) { }

  ngOnInit() {
    if (this.equipmentType == 'pump') {
      this.equipmentLabel = 'Pump';
      this.curveDataSubscription = this.systemAndEquipmentCurveService.pumpSystemCurveData.subscribe(val => {
        if (val != undefined) {
          this.systemCurveRegressionEquation = this.regressionEquationsService.getPumpSystemCurveRegressionEquation(val);
        }
      });
    } else {
      this.equipmentLabel = 'Fan';
      this.curveDataSubscription = this.systemAndEquipmentCurveService.fanSystemCurveData.subscribe(val => {
        if (val != undefined) {
          this.systemCurveRegressionEquation = this.regressionEquationsService.getFanSystemCurveRegressionEquation(val);
        }
      });
    }

    this.byDataSubscription = this.systemAndEquipmentCurveService.byDataInputs.subscribe(byDataInputs => {
      if (byDataInputs != undefined) {
        let equipmentInputs: EquipmentInputs = this.systemAndEquipmentCurveService.equipmentInputs.getValue();
        if (equipmentInputs != undefined) {
          this.calculateByDataRegression(byDataInputs, equipmentInputs);
        }
        this.cd.detectChanges();
      }
    });

    this.byEquationSubscription = this.systemAndEquipmentCurveService.byEquationInputs.subscribe(byEquationInputs => {
      if (byEquationInputs != undefined) {
        let equipmentInputs: EquipmentInputs = this.systemAndEquipmentCurveService.equipmentInputs.getValue();
        if (equipmentInputs != undefined) {
          this.calculateByEquationRegressions(byEquationInputs, equipmentInputs);
        }
        this.cd.detectChanges();
      }
    });

    this.equipmentInputsSubscription = this.systemAndEquipmentCurveService.equipmentInputs.subscribe(equipmentInputs => {
      if (equipmentInputs != undefined) {
        let byDataInputs: ByDataInputs = this.systemAndEquipmentCurveService.byDataInputs.getValue();
        if (byDataInputs != undefined) {
          this.calculateByDataRegression(byDataInputs, equipmentInputs);
        }
        let byEquationInputs: ByEquationInputs = this.systemAndEquipmentCurveService.byEquationInputs.getValue();
        if (byEquationInputs != undefined) {
          this.calculateByEquationRegressions(byEquationInputs, equipmentInputs);
        }
        this.cd.detectChanges();
      }
    });


    this.selectedEquipmentCurveFormViewSub = this.systemAndEquipmentCurveService.selectedEquipmentCurveFormView.subscribe(val => {
      this.selectedEquipmentCurveFormView = val;
    });

    this.equipmentCurveCollapsedSub = this.systemAndEquipmentCurveService.equipmentCurveCollapsed.subscribe(val => {
      this.equipmentCurveCollapsed = val;
    });

    this.systemCurveCollapsedSub = this.systemAndEquipmentCurveService.systemCurveCollapsed.subscribe(val => {
      this.systemCurveCollapsed = val;
    });
  }

  ngOnDestroy() {
    this.curveDataSubscription.unsubscribe();
    this.byDataSubscription.unsubscribe();
    this.byEquationSubscription.unsubscribe();
    this.equipmentInputsSubscription.unsubscribe();
    this.selectedEquipmentCurveFormViewSub.unsubscribe();
    this.equipmentCurveCollapsedSub.unsubscribe();
    this.systemCurveCollapsedSub.unsubscribe();
  }


  calculateByDataRegression(byDataInputs: ByDataInputs, equipmentInputs: EquipmentInputs) {
    let secondValueLabel: string = 'Head';
    if (this.equipmentType == 'fan') {
      secondValueLabel = 'Pressure';
    }
    let results = this.regressionEquationsService.getEquipmentCurveRegressionByData(byDataInputs, equipmentInputs, secondValueLabel);
    this.baselineEquipmentCurveByDataRegressionEquation = results.baselineRegressionEquation;
    this.baselineEquipmentCurveByDataRSquared = results.baselineRSquared;
    this.modificationEquipmentCurveByDataRegressionEquation = results.modificationRegressionEquation;
    this.modificationEquipmentCurveRSquared = results.modificationRSquared;
  }

  calculateByEquationRegressions(byEquationInputs: ByEquationInputs, equipmentInputs: EquipmentInputs) {
    let secondValueLabel: string = 'Head';
    if (this.equipmentType == 'fan') {
      secondValueLabel = 'Pressure';
    }
    let results = this.regressionEquationsService.getEquipmentCurveRegressionByEquation(byEquationInputs, equipmentInputs, secondValueLabel);
    this.baselineEquipmentCurveByEquationRegressionEquation = results.baselineRegressionEquation;
    this.modificationEquipmentCurveByEquationRegressionEquation = results.modificationRegressionEquation;
  }
}
