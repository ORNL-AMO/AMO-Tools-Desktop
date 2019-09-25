import { Component, OnInit, Input } from '@angular/core';
import { collapseAnimation } from '../collapse-animations';
import { Settings } from '../../../shared/models/settings';

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
  constructor() { }

  ngOnInit() {
    if(this.isPrimaryCalculator == true){
      this.systemCurveCollapsed = 'open';
    }
  }

  toggleCollapse() {
    if (this.systemCurveCollapsed == 'closed') {
      this.systemCurveCollapsed = 'open';
    } else {
      this.systemCurveCollapsed = 'closed';
    }
  }
}
