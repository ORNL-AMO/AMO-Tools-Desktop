import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';

@Component({
  selector: 'app-opening-summary',
  templateUrl: './opening-summary.component.html',
  styleUrls: ['./opening-summary.component.css']
})
export class OpeningSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;

  numLosses: number = 0;
  collapse: boolean = true;
  lossData: Array<any>;
  constructor() { }

  ngOnInit() {    
    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.losses.openingLosses) {
        this.numLosses = this.phast.losses.openingLosses.length;
        let index = 0;
        this.phast.losses.openingLosses.forEach(loss => {
          let modificationData = new Array();
          if(this.phast.modifications){
            this.phast.modifications.forEach(mod => {
              let modData = mod.phast.losses.openingLosses[index];
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

  //TODO: Calculate Area for Total Area
}
