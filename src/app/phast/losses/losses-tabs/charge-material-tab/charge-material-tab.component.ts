import { Component, OnInit, Input } from '@angular/core';
import { LossTab } from '../../../tabs';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { LossesService } from '../../losses.service';

@Component({
  selector: 'app-charge-material-tab',
  templateUrl: './charge-material-tab.component.html',
  styleUrls: ['./charge-material-tab.component.css']
})
export class ChargeMaterialTabComponent implements OnInit {
  @Input()
  selectedTab: LossTab;
  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;


  numLosses: number = 0;
  chargeDone: boolean;
  constructor(private lossesService: LossesService) { }

  ngOnInit() {
    this.checkDone();
    this.setNumLosses();
    this.lossesService.updateTabs.subscribe(val => {
      this.checkDone();
      this.setNumLosses();
    })
  }

  checkDone(){
    this.chargeDone = this.lossesService.chargeDone;
  }

  setNumLosses(){
    if(this.phast.losses){
      if(this.phast.losses.chargeMaterials){
        this.numLosses = this.phast.losses.chargeMaterials.length;
      }
    }
  }

}
