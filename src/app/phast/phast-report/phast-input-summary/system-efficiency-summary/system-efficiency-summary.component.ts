import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';

@Component({
  selector: 'app-system-efficiency-summary',
  templateUrl: './system-efficiency-summary.component.html',
  styleUrls: ['./system-efficiency-summary.component.css']
})
export class SystemEfficiencySummaryComponent implements OnInit {
  @Input()
  phast: PHAST;

  collapse: boolean = true;
  constructor() { }

  ngOnInit() {
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }
}
