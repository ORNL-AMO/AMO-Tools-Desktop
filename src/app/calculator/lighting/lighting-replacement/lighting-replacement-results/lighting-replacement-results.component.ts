import { Component, OnInit, Input } from '@angular/core';
import { LightingReplacementData, LightingReplacementResults } from '../lighting-replacement.service';

@Component({
  selector: 'app-lighting-replacement-results',
  templateUrl: './lighting-replacement-results.component.html',
  styleUrls: ['./lighting-replacement-results.component.css']
})
export class LightingReplacementResultsComponent implements OnInit {
  @Input()
  baselineData: Array<LightingReplacementData>;
  @Input()
  modificationData: Array<LightingReplacementData>;
  @Input()
  baselineResults: LightingReplacementResults;
  @Input()
  modificationResults: LightingReplacementResults;
  
  constructor() { }

  ngOnInit() {
  }

}
