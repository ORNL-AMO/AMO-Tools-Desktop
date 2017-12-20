import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';

@Component({
  selector: 'app-gas-leakage-summary',
  templateUrl: './gas-leakage-summary.component.html',
  styleUrls: ['./gas-leakage-summary.component.css']
})
export class GasLeakageSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;


  numLosses: number = 0;
  collapse: boolean = true;
  lossData: Array<any>;
  constructor() { }

  ngOnInit() {    
    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.losses.leakageLosses) {
        this.numLosses = this.phast.losses.leakageLosses.length;
        let index = 0;
        this.phast.losses.leakageLosses.forEach(loss => {
          let modificationData = new Array();
          if(this.phast.modifications){
            this.phast.modifications.forEach(mod => {
              let modData = mod.phast.losses.leakageLosses[index];
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
