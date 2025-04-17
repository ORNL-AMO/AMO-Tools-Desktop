import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-calculate-outlet-pressure-help',
    templateUrl: './calculate-outlet-pressure-help.component.html',
    styleUrls: ['./calculate-outlet-pressure-help.component.css'],
    standalone: false
})
export class CalculateOutletPressureHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
    if (this.currentField === 'inletLoss') {
      this.currentField = 'outletSystemEffectLoss';
    }
  }

}
