import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-operating-cost-help',
    templateUrl: './operating-cost-help.component.html',
    styleUrls: ['./operating-cost-help.component.css'],
    standalone: false
})
export class OperatingCostHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
