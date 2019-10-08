import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { SystemAndEquipmentCurveService } from '../../system-and-equipment-curve.service';
import { Subscription } from 'rxjs';
import { RegressionEquationsService } from './regression-equations.service';
import { EquipmentInputs, ByDataInputs } from '../../equipment-curve/equipment-curve.service';

@Component({
  selector: 'app-regression-equations',
  templateUrl: './regression-equations.component.html',
  styleUrls: ['./regression-equations.component.css']
})
export class RegressionEquationsComponent implements OnInit {
  @Input()
  equipmentType: string;

  baselineEquipmentCurveByDataRegressionEquation: string;
  baselineEquipmentCurveByDataRSquared: number;

  modificationEquipmentCurveByDataRegressionEquation: string;
  modificationEquipmentCurveRSquared: number;

  baselineEquipmentCurveByEquationRegressionEquation: string;
  baselineEquipmentCurveByEquationRSquared: string;

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


  constructor(private systemAndEquipmentCurveService: SystemAndEquipmentCurveService, private regressionEquationsService: RegressionEquationsService,
    private cd: ChangeDetectorRef) { }

  ngOnInit() {
    if (this.equipmentType == 'pump') {
      this.curveDataSubscription = this.systemAndEquipmentCurveService.pumpSystemCurveData.subscribe(val => {

      });
    } else {
      this.curveDataSubscription = this.systemAndEquipmentCurveService.fanSystemCurveData.subscribe(val => {

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

    this.byEquationSubscription = this.systemAndEquipmentCurveService.byEquationInputs.subscribe(val => {
      if (val != undefined) {
        let secondValueLabel: string = 'Head';
        if (this.equipmentType == 'fan') {
          secondValueLabel = 'Pressure';
        }
        let results = this.regressionEquationsService.getEquipmentCurveRegressionByEquation(val, secondValueLabel);
        this.baselineEquipmentCurveByEquationRegressionEquation = results;
      }
    });

    this.equipmentInputsSubscription = this.systemAndEquipmentCurveService.equipmentInputs.subscribe(equipmentInputs => {
      if (equipmentInputs != undefined) {
        let byDataInputs: ByDataInputs = this.systemAndEquipmentCurveService.byDataInputs.getValue();
        if (byDataInputs != undefined) {
          this.calculateByDataRegression(byDataInputs, equipmentInputs);
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
    console.log('CALCULATE');
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
}
