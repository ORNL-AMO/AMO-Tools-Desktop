import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
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
  @Input()
  saveClicked: boolean;
  isFirstChange: boolean = true;
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
  ngOnChanges(changes: SimpleChanges) {
    if (changes.saveClicked && !this.isFirstChange) {
      this.save.emit(true);
    } else {
      this.isFirstChange = false;
    }
  }

  startSavePolling() {
    this.save.emit(true);
  }
}
