import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-compressed-air-pressure-reduction-help',
    templateUrl: './compressed-air-pressure-reduction-help.component.html',
    styleUrls: ['./compressed-air-pressure-reduction-help.component.css'],
    standalone: false
})
export class CompressedAirPressureReductionHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
