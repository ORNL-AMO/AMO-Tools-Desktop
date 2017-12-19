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

  constructor() { }

  ngOnInit() {
  }

}
