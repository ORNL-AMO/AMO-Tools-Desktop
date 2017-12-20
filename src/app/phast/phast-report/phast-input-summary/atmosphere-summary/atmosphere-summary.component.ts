import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';

@Component({
  selector: 'app-atmosphere-summary',
  templateUrl: './atmosphere-summary.component.html',
  styleUrls: ['./atmosphere-summary.component.css']
})
export class AtmosphereSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;

  constructor() { }

  ngOnInit() {
  }

}
