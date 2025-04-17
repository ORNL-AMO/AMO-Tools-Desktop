import { Component, Input, OnInit } from '@angular/core';
import { CompressedAirAssessment } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';

@Component({
    selector: 'app-performance-profiles',
    templateUrl: './performance-profiles.component.html',
    styleUrls: ['./performance-profiles.component.css'],
    standalone: false
})
export class PerformanceProfilesComponent implements OnInit {
  @Input()
  inReport: boolean;

  @Input()
  printView: boolean;

  @Input()
  compressedAirAssessment: CompressedAirAssessment;

  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit(): void{
  }

}
