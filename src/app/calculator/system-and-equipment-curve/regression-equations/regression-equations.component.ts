import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { SystemAndEquipmentCurveService } from '../system-and-equipment-curve.service';
import { Subscription } from 'rxjs';
import { RegressionEquationsService } from '../regression-equations.service';

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


  //subs
  baselineEquipmentCurveByDataRegressionEquationSub: Subscription;
  baselineEquipmentCurveByDataRSquaredSub: Subscription;
  modificationEquipmentCurveByDataRegressionEquationSub: Subscription;
  modificationEquipmentCurveRSquaredSub: Subscription;
  selectedEquipmentCurveFormViewSub: Subscription;
  baselineEquipmentCurveByEquationRegressionEquationSub: Subscription;
  modificationEquipmentCurveByEquationRegressionEquationSub: Subscription;
  systemCurveRegressionEquationSub: Subscription;

  equipmentCurveCollapsedSub: Subscription;
  systemCurveCollapsedSub: Subscription;

  //data
  baselineEquipmentCurveByDataRegressionEquation: string;
  baselineEquipmentCurveByDataRSquared: number;

  modificationEquipmentCurveByDataRegressionEquation: string;
  modificationEquipmentCurveRSquared: number;

  baselineEquipmentCurveByEquationRegressionEquation: string;
  modificationEquipmentCurveByEquationRegressionEquation: string;

  systemCurveRegressionEquation: string;
  selectedEquipmentCurveFormView: string;
  equipmentCurveCollapsed: string;
  systemCurveCollapsed: string;

  equipmentLabel: string;
  constructor(private systemAndEquipmentCurveService: SystemAndEquipmentCurveService, private regressionEquationsService: RegressionEquationsService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    if (this.equipmentType == 'pump') {
      this.equipmentLabel = 'Pump';
    } else {
      this.equipmentLabel = 'Fan';
    }

    this.selectedEquipmentCurveFormViewSub = this.systemAndEquipmentCurveService.selectedEquipmentCurveFormView.subscribe(val => {
      this.selectedEquipmentCurveFormView = val;
    });

    this.equipmentCurveCollapsedSub = this.systemAndEquipmentCurveService.equipmentCurveCollapsed.subscribe(val => {
      this.equipmentCurveCollapsed = val;
    });

    this.systemCurveCollapsedSub = this.systemAndEquipmentCurveService.systemCurveCollapsed.subscribe(val => {
      this.systemCurveCollapsed = val;
    });

    this.baselineEquipmentCurveByDataRegressionEquationSub = this.regressionEquationsService.baselineEquipmentCurveByDataRegressionEquation.subscribe(val => {
      this.baselineEquipmentCurveByDataRegressionEquation = val;
      this.cd.detectChanges();
    });
    this.baselineEquipmentCurveByDataRSquaredSub = this.regressionEquationsService.baselineEquipmentCurveByDataRSquared.subscribe(val => {
      this.baselineEquipmentCurveByDataRSquared = val;
      this.cd.detectChanges();
    });

    this.modificationEquipmentCurveByDataRegressionEquationSub = this.regressionEquationsService.modificationEquipmentCurveByDataRegressionEquation.subscribe(val => {
      this.modificationEquipmentCurveByDataRegressionEquation = val;
      this.cd.detectChanges();
    });
    this.modificationEquipmentCurveRSquaredSub = this.regressionEquationsService.modificationEquipmentCurveRSquared.subscribe(val => {
      this.modificationEquipmentCurveRSquared = val;
      this.cd.detectChanges();
    });

    this.baselineEquipmentCurveByEquationRegressionEquationSub = this.regressionEquationsService.baselineEquipmentCurveByEquationRegressionEquation.subscribe(val => {
      this.baselineEquipmentCurveByEquationRegressionEquation = val;
      this.cd.detectChanges();
    });
    this.modificationEquipmentCurveByEquationRegressionEquationSub = this.regressionEquationsService.modificationEquipmentCurveByEquationRegressionEquation.subscribe(val => {
      this.modificationEquipmentCurveByEquationRegressionEquation = val;
      this.cd.detectChanges();
    });

    this.systemCurveRegressionEquationSub = this.regressionEquationsService.systemCurveRegressionEquation.subscribe(val => {
      this.systemCurveRegressionEquation = val;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() {
    this.baselineEquipmentCurveByDataRegressionEquationSub.unsubscribe();
    this.baselineEquipmentCurveByDataRSquaredSub.unsubscribe();
    this.modificationEquipmentCurveByDataRegressionEquationSub.unsubscribe();
    this.modificationEquipmentCurveRSquaredSub.unsubscribe();
    this.baselineEquipmentCurveByEquationRegressionEquationSub.unsubscribe();
    this.modificationEquipmentCurveByEquationRegressionEquationSub.unsubscribe();
    this.systemCurveRegressionEquationSub.unsubscribe();
    this.selectedEquipmentCurveFormViewSub.unsubscribe();
    this.equipmentCurveCollapsedSub.unsubscribe();
    this.systemCurveCollapsedSub.unsubscribe();
  }
}
