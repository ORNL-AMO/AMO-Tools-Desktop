import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
@Component({
    selector: 'app-energy-input-exhaust-gas-summary',
    templateUrl: './energy-input-exhaust-gas-summary.component.html',
    styleUrls: ['./energy-input-exhaust-gas-summary.component.css'],
    standalone: false
})
export class EnergyInputExhaustGasSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  
  numLosses: number = 0;
  collapse: boolean = true;
  lossData: Array<any>;
  numMods: number = 0;
  constructor() { }

  ngOnInit() {
    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.modifications) {
        this.numMods = this.phast.modifications.length;
      }
      if (this.phast.losses.energyInputExhaustGasLoss) {
        this.numLosses = this.phast.losses.energyInputExhaustGasLoss.length;
        let index = 0;
        this.phast.losses.energyInputExhaustGasLoss.forEach(loss => {
          let modificationData = new Array();
          if (this.phast.modifications) {
            this.phast.modifications.forEach(mod => {
              let modData = mod.phast.losses.energyInputExhaustGasLoss[index];
              modificationData.push(modData);
            });
          }
          this.lossData.push({
            baseline: loss,
            modifications: modificationData
          });
          index++;
        });
      }
    }
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }

  //TODO: Calculate Available Heat
}
