import { Component, Input, OnInit } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { WasteWater, WasteWaterData } from '../../../shared/models/waste-water';

@Component({
  selector: 'app-result-data',
  templateUrl: './result-data.component.html',
  styleUrls: ['./result-data.component.css']
})
export class ResultDataComponent implements OnInit {
  @Input()
  wasteWater: WasteWater;
  @Input()
  settings: Settings;
  @Input()
  inRollup: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
