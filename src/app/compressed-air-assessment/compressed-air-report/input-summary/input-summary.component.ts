import { Component, Input, OnInit } from '@angular/core';
import { CompressedAirAssessment } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';

@Component({
    selector: 'app-input-summary',
    templateUrl: './input-summary.component.html',
    styleUrls: ['./input-summary.component.css'],
    standalone: false
})
export class InputSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  compressedAirAssessment: CompressedAirAssessment;
  @Input()
  printView: boolean;

  
  constructor() { }

  ngOnInit(): void {
  }

}
