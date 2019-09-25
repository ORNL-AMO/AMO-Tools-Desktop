import { Component, OnInit, Input } from '@angular/core';
import { collapseAnimation } from '../collapse-animations';
import { Settings } from '../../../shared/models/settings';
import { SystemAndEquipmentCurveService } from '../system-and-equipment-curve.service';

@Component({
  selector: 'app-equipment-curve',
  templateUrl: './equipment-curve.component.html',
  styleUrls: ['./equipment-curve.component.css'],
  animations: collapseAnimation
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
  constructor(private systemAndEquipmentCurveService: SystemAndEquipmentCurveService) { }

  ngOnInit() {
    if (this.isPrimaryCalculator == true) {
      this.equipmentCurveCollapsed = 'open';
    }
    this.setTitle();
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
        this.equipmentCurveCollapsed = 'open';
        this.systemAndEquipmentCurveService.focusedCalculator.next(this.equipmentType + '-curve');
      } else {
        this.equipmentCurveCollapsed = 'closed';
      }
    }
  }

  setFormView(str: string) {
    this.selectedFormView = str;;
  }
}
