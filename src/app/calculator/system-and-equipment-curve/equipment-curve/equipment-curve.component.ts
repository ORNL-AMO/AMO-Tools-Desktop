import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { collapseAnimation } from '../collapse-animations';
import { Settings } from '../../../shared/models/settings';
import { SystemAndEquipmentCurveService } from '../system-and-equipment-curve.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-equipment-curve',
    templateUrl: './equipment-curve.component.html',
    styleUrls: ['./equipment-curve.component.css'],
    animations: collapseAnimation,
    standalone: false
})
export class EquipmentCurveComponent implements OnInit {
  @Input()
  equipmentType: string;
  @Input()
  isPrimaryCalculator: boolean;
  @Input()
  settings: Settings;

  equipmentCurveCollapsed: string = 'closed';
  title: string;
  selectedFormView: string = 'Equation';
  selectedFormViewSub: Subscription;
  equipmentCurveCollapsedSub: Subscription;
  constructor(private systemAndEquipmentCurveService: SystemAndEquipmentCurveService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.selectedFormViewSub = this.systemAndEquipmentCurveService.selectedEquipmentCurveFormView.subscribe(val => {
      this.selectedFormView = val;
      this.cd.detectChanges();
    });

    this.equipmentCurveCollapsedSub = this.systemAndEquipmentCurveService.equipmentCurveCollapsed.subscribe(val => {
      this.equipmentCurveCollapsed = val;
    });
    this.setTitle();
  }

  ngOnDestroy(){
    this.selectedFormViewSub.unsubscribe();
    this.equipmentCurveCollapsedSub.unsubscribe();
  }

  setTitle() {
    if (this.equipmentType == 'pump') {
      this.title = 'Pump';
    } else if (this.equipmentType == 'fan') {
      this.title = 'Fan';
    }
  }

  toggleCollapse() {
    if (this.isPrimaryCalculator == false) {
      if (this.equipmentCurveCollapsed == 'closed') {
        this.systemAndEquipmentCurveService.equipmentCurveCollapsed.next('open');
        this.systemAndEquipmentCurveService.focusedCalculator.next(this.equipmentType + '-curve');
      } else {
        this.systemAndEquipmentCurveService.equipmentCurveCollapsed.next('closed');
      }
    }
  }

  setFormView(str: string) {
    this.systemAndEquipmentCurveService.selectedEquipmentCurveFormView.next(str);
  }
}
