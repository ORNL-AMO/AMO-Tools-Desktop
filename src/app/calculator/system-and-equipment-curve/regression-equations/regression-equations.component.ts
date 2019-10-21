import { Component, OnInit, Input } from '@angular/core';
import { SystemAndEquipmentCurveService } from '../system-and-equipment-curve.service';
import { Subscription } from 'rxjs';
import { RegressionEquationsService } from './regression-equations.service';

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
  selectedEquipmentCurveFormViewSub: Subscription;
  equipmentCurveCollapsedSub: Subscription;
  systemCurveCollapsedSub: Subscription;

 
  selectedEquipmentCurveFormView: string;
  equipmentCurveCollapsed: string;
  systemCurveCollapsed: string;

  equipmentLabel: string;
  constructor(private systemAndEquipmentCurveService: SystemAndEquipmentCurveService, private regressionEquationsService: RegressionEquationsService) { }

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
  }

  ngOnDestroy() {
    this.selectedEquipmentCurveFormViewSub.unsubscribe();
    this.equipmentCurveCollapsedSub.unsubscribe();
    this.systemCurveCollapsedSub.unsubscribe();
  }
}
