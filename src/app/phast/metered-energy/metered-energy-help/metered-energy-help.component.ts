import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-metered-energy-help',
    templateUrl: './metered-energy-help.component.html',
    styleUrls: ['./metered-energy-help.component.css'],
    standalone: false
})
export class MeteredEnergyHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }
}
