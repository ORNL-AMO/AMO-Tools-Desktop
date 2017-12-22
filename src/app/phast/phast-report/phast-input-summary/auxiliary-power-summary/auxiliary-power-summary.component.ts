import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-auxiliary-power-summary',
  templateUrl: './auxiliary-power-summary.component.html',
  styleUrls: ['./auxiliary-power-summary.component.css']
})
export class AuxiliaryPowerSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings
  numLosses: number = 0;
  collapse: boolean = true;
  lossData: Array<any>;
  constructor() { }

  ngOnInit() {
    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.losses.auxiliaryPowerLosses) {
        this.numLosses = this.phast.losses.auxiliaryPowerLosses.length;
        let index = 0;
        this.phast.losses.auxiliaryPowerLosses.forEach(loss => {
          let modificationData = new Array();
          if (this.phast.modifications) {
            this.phast.modifications.forEach(mod => {
              let modData = mod.phast.losses.auxiliaryPowerLosses[index];
              modificationData.push(modData);
            })
          }
          this.lossData.push({
            baseline: loss,
            modifications: modificationData
          })
          index++;
        })
      }
    }
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }
}
