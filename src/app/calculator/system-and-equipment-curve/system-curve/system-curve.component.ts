import { Component, OnInit, Input } from '@angular/core';
import { collapseAnimation } from '../collapse-animations';

@Component({
  selector: 'app-system-curve',
  templateUrl: './system-curve.component.html',
  styleUrls: ['./system-curve.component.css'],
  animations: collapseAnimation
})
export class SystemCurveComponent implements OnInit {
  @Input()
  equipmentType: string;

  systemCurveCollapsed: string = 'closed';
  constructor() { }

  ngOnInit() {
  }

  toggleCollapse() {
    if (this.systemCurveCollapsed == 'closed') {
      this.systemCurveCollapsed = 'open';
    } else {
      this.systemCurveCollapsed = 'closed';
    }
  }
}
