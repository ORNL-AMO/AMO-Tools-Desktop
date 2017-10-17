import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { PHAST, OperatingCosts } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
@Component({
  selector: 'app-energy-costs',
  templateUrl: './energy-costs.component.html',
  styleUrls: ['./energy-costs.component.css']
})
export class EnergyCostsComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Output('save')
  save = new EventEmitter<boolean>();
  @Input()
  settings: Settings;

  counter: any;
  constructor() { }

  ngOnInit() {
    if (!this.phast.operatingCosts) {
      let defaultCosts: OperatingCosts = {
        fuelCost: 8.00,
        steamCost: 10.00,
        electricityCost: .080
      }
      this.phast.operatingCosts = defaultCosts;
      this.startSavePolling();
    }
  }

  startSavePolling() {
    if (this.counter) {
      clearTimeout(this.counter);
    }
    this.counter = setTimeout(() => {
      this.save.emit(true);
    }, 3000)
  }
}
