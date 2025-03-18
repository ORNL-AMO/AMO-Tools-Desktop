import { Component, OnInit, Input } from '@angular/core';
import { collapseAnimation } from '../collapse-animations';
import { Settings } from '../../../shared/models/settings';
import { SystemAndEquipmentCurveService } from '../system-and-equipment-curve.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-system-curve',
    templateUrl: './system-curve.component.html',
    styleUrls: ['./system-curve.component.css'],
    animations: collapseAnimation,
    standalone: false
})
export class SystemCurveComponent implements OnInit {
  @Input()
  equipmentType: string;
  @Input()
  isPrimaryCalculator: boolean;
  @Input()
  settings: Settings;

  systemCurveCollapsed: string = 'closed';
  systemCurveCollapsedSub: Subscription;
  constructor(private systemAndEquipmentCurveService: SystemAndEquipmentCurveService) { }

  ngOnInit() {
    this.systemCurveCollapsedSub = this.systemAndEquipmentCurveService.systemCurveCollapsed.subscribe(val => {
      this.systemCurveCollapsed = val;
    });
  }

  ngOnDestroy() {
    this.systemCurveCollapsedSub.unsubscribe();
  }

  toggleCollapse() {
    if (this.isPrimaryCalculator == false) {
      if (this.systemCurveCollapsed == 'closed') {
        this.systemAndEquipmentCurveService.systemCurveCollapsed.next('open');
        this.systemAndEquipmentCurveService.focusedCalculator.next(this.equipmentType + '-system-curve');
      } else {
        this.systemAndEquipmentCurveService.systemCurveCollapsed.next('closed');
      }
    }
  }
}
