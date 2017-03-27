import { Component, OnInit, Input } from '@angular/core';
import { PHAST, Losses } from '../../shared/models/phast';
@Component({
  selector: 'app-losses',
  templateUrl: 'losses.component.html',
  styleUrls: ['losses.component.css']
})
export class LossesComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  saveClicked: boolean;

  lossesTab: string = 'charge-material';
  lossesStates: any = {
    wallLosses: {
      numLosses: 0,
      saved: true
    },
    chargeMaterial: {
      numLosses: 0,
      saved: true
    },
    atmosphereLosses: {
      numLosses: 0,
      saved: true
    }
  }
  constructor() { }

  ngOnInit() {
    if (!this.phast.losses) {
      this.phast.losses = new Array<Losses>();
    }
  }

  changeTab($event) {
    this.lossesTab = $event;
    this.lossesStates.chargeMaterial.saved = true;
  }

}
