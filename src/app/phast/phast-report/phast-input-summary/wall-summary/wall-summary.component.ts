import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { WallLoss } from '../../../../shared/models/phast/losses/wallLoss';

@Component({
  selector: 'app-wall-summary',
  templateUrl: './wall-summary.component.html',
  styleUrls: ['./wall-summary.component.css']
})
export class WallSummaryComponent implements OnInit {
  @Input()
  phast: PHAST


  data: Array<any>;
  constructor() { }

  ngOnInit() {
    this.data = new Array();
    if(this.phast.losses){
      if(this.phast.losses.wallLosses){
        let index: number = 0;
        this.phast.losses.wallLosses.forEach(loss => {
          let modificationData = new Array();
          if(this.phast.modifications){
            this.phast.modifications.forEach(mod => {
              let modData = mod.phast.losses.wallLosses[index];
              modificationData.push(modData);
            })
          }
          this.data.push({
            baseline:loss,
            modifications: modificationData
          });
          console.log(this.data);
          index++;
        })
      }
    }
  }
}
