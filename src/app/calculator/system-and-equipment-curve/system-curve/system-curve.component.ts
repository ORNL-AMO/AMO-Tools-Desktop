import { Component, OnInit, Input } from '@angular/core';
import { collapseAnimation } from '../collapse-animations';
import { Settings } from '../../../shared/models/settings';
import { SystemAndEquipmentCurveService } from '../system-and-equipment-curve.service';

@Component({
  selector: 'app-system-curve',
  templateUrl: './system-curve.component.html',
  styleUrls: ['./system-curve.component.css'],
  animations: collapseAnimation
})
export class SystemCurveComponent implements OnInit {
  @Input()
  equipmentType: string;
  @Input()
  isPrimaryCalculator: boolean;
  @Input()
  settings: Settings;

  systemCurveCollapsed: string = 'closed';
  constructor(private systemAndEquipmentCurveService: SystemAndEquipmentCurveService) { }

  ngOnInit() {
    if (this.isPrimaryCalculator == true) {
      this.systemCurveCollapsed = 'open';
    }
  }

  toggleCollapse() {
    if (this.isPrimaryCalculator == false) {
      if (this.systemCurveCollapsed == 'closed') {
        this.systemCurveCollapsed = 'open';
        this.systemAndEquipmentCurveService.focusedCalculator.next(this.equipmentType + '-system-curve');
      } else {
        this.systemCurveCollapsed = 'closed';
      }
    }
  }
}
