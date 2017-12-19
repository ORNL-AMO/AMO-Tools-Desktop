import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-phast-input-summary',
  templateUrl: './phast-input-summary.component.html',
  styleUrls: ['./phast-input-summary.component.css']
})
export class PhastInputSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;


  constructor() { }

  ngOnInit() {
  }

}
