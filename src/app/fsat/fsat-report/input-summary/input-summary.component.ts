import { Component, OnInit, Input } from '@angular/core';
import { FSAT } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';

@Component({
    selector: 'app-input-summary',
    templateUrl: './input-summary.component.html',
    styleUrls: ['./input-summary.component.css'],
    standalone: false
})
export class InputSummaryComponent implements OnInit {
  @Input()
  fsat: FSAT;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;


  constructor() { }

  ngOnInit() {
  }

}
