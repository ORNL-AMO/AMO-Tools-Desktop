import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { SystemAndEquipmentCurveService } from '../system-and-equipment-curve.service';
import { Subscription } from 'rxjs';
import { RegressionEquationsService } from '../regression-equations.service';

@Component({
    selector: 'app-regression-equations',
    templateUrl: './regression-equations.component.html',
    styleUrls: ['./regression-equations.component.css'],
    standalone: false
})
export class RegressionEquationsComponent implements OnInit {
  @Input()
  equipmentType: string;
  @Input()
  isEquipmentCurvePrimary: boolean;

  baselineEquipmentCurveByDataRSquaredSub: Subscription;
  modificationEquipmentRegressionEquationSub: Subscription;
  selectedEquipmentCurveFormViewSub: Subscription;
  baselineEquipmentRegressionEquationSub: Subscription;
  systemCurveRegressionEquationSub: Subscription;
  equipmentCurveCollapsedSub: Subscription;
  systemCurveCollapsedSub: Subscription;
  baselineEquipmentPowerRegressionEquationSub: Subscription;
  modificationEquipmentPowerRegressionEquationSub: Subscription;
  baselineEquipmentPowerCurveByDataRSquaredSub: Subscription;
  modificationEquipmentPowerCurveByDataRSquaredSub: Subscription;
  isModificationPowerFromDataSub: Subscription;

  baselineEquipmentCurveByDataRSquared: number;
  modificationEquipmentRegressionEquation: string;
  baselineEquipmentRegressionEquation: string;
  systemCurveRegressionEquation: string;
  selectedEquipmentCurveFormView: string;
  equipmentCurveCollapsed: string;
  systemCurveCollapsed: string;

  baselineEquipmentPowerRegressionEquation: string;
  modificationEquipmentPowerRegressionEquation: string;
  baselineEquipmentPowerCurveByDataRSquared: number;
  modificationEquipmentPowerCurveByDataRSquared: number;
  isModificationPowerFromData: boolean;

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
    this.baselineEquipmentRegressionEquationSub = this.regressionEquationsService.baselineEquipmentRegressionEquation.subscribe(val => {
      this.baselineEquipmentRegressionEquation = val;
      this.cd.detectChanges();
    });
    this.baselineEquipmentCurveByDataRSquaredSub = this.regressionEquationsService.baselineEquipmentCurveByDataRSquared.subscribe(val => {
      this.baselineEquipmentCurveByDataRSquared = val;
      this.cd.detectChanges();
    });

    this.modificationEquipmentRegressionEquationSub = this.regressionEquationsService.modificationEquipmentRegressionEquation.subscribe(val => {
      this.modificationEquipmentRegressionEquation = val;
      this.cd.detectChanges();
    });


    this.systemCurveRegressionEquationSub = this.regressionEquationsService.systemCurveRegressionEquation.subscribe(val => {
      this.systemCurveRegressionEquation = val;
      this.cd.detectChanges();
    });

    this.baselineEquipmentPowerRegressionEquationSub = this.regressionEquationsService.baselineEquipmentPowerRegressionEquation.subscribe(val => {
      this.baselineEquipmentPowerRegressionEquation = val;
      this.cd.detectChanges();
    });

    this.modificationEquipmentPowerRegressionEquationSub = this.regressionEquationsService.modificationEquipmentPowerRegressionEquation.subscribe(val => {
      this.modificationEquipmentPowerRegressionEquation = val;
      this.cd.detectChanges();
    });

    this.baselineEquipmentPowerCurveByDataRSquaredSub = this.regressionEquationsService.baselineEquipmentPowerCurveByDataRSquared.subscribe(val => {
      this.baselineEquipmentPowerCurveByDataRSquared = val;
      this.cd.detectChanges();
    });

    this.modificationEquipmentPowerCurveByDataRSquaredSub = this.regressionEquationsService.modificationEquipmentPowerCurveByDataRSquared.subscribe(val => {
      this.modificationEquipmentPowerCurveByDataRSquared = val;
      this.cd.detectChanges();
    });

    this.isModificationPowerFromDataSub = this.regressionEquationsService.isModificationPowerFromData.subscribe(val => {
      this.isModificationPowerFromData = val;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() {
    this.baselineEquipmentCurveByDataRSquaredSub.unsubscribe();
    this.modificationEquipmentRegressionEquationSub.unsubscribe();
    this.baselineEquipmentRegressionEquationSub.unsubscribe();
    this.systemCurveRegressionEquationSub.unsubscribe();
    this.selectedEquipmentCurveFormViewSub.unsubscribe();
    this.equipmentCurveCollapsedSub.unsubscribe();
    this.systemCurveCollapsedSub.unsubscribe();
    this.baselineEquipmentPowerRegressionEquationSub.unsubscribe();
    this.modificationEquipmentPowerRegressionEquationSub.unsubscribe();
    this.baselineEquipmentPowerCurveByDataRSquaredSub.unsubscribe();
    this.modificationEquipmentPowerCurveByDataRSquaredSub.unsubscribe();
    this.isModificationPowerFromDataSub.unsubscribe();
  }
}
