import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';

@Component({
  selector: 'app-slag-summary',
  templateUrl: './slag-summary.component.html',
  styleUrls: ['./slag-summary.component.css']
})
export class SlagSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;

  numLosses: number = 0;
  collapse: boolean = true;
  lossData: Array<any>;
  constructor() { }

  ngOnInit() {
    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.losses.slagLosses) {
        this.numLosses = this.phast.losses.slagLosses.length;
        let index = 0;
        this.phast.losses.slagLosses.forEach(loss => {
          let modificationData = new Array();
          if (this.phast.modifications) {
            this.phast.modifications.forEach(mod => {
              let modData = mod.phast.losses.slagLosses[index];
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
