import { Component, OnInit, Input } from '@angular/core';
import { PHAST, Losses } from '../../../../shared/models/phast/phast';

@Component({
  selector: 'app-charge-material-summary',
  templateUrl: './charge-material-summary.component.html',
  styleUrls: ['./charge-material-summary.component.css']
})
export class ChargeMaterialSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;


  numLosses: number = 0;
  collapse: boolean = true;
  constructor() { }

  ngOnInit() {
    if (this.phast.losses.chargeMaterials) {
      this.numLosses = this.phast.losses.chargeMaterials.length;
    }
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }

}
