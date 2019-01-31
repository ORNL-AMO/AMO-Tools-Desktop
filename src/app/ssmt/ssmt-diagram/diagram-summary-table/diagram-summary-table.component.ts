import { Component, OnInit, Input } from '@angular/core';
import { BoilerOutput } from '../../../shared/models/steam/steam-outputs';
import { SSMTInputs } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-diagram-summary-table',
  templateUrl: './diagram-summary-table.component.html',
  styleUrls: ['./diagram-summary-table.component.css']
})
export class DiagramSummaryTableComponent implements OnInit {
  @Input()
  inputData: SSMTInputs;
  @Input()
  powerGenerated: number;
  @Input()
  boiler: BoilerOutput;
  @Input()
  annualMakeupWaterFlow: number;
  @Input()
  makeupWaterCost: number;
  @Input()
  boilerFuelCost: number;
  @Input()
  powerGenerationCost: number;
  @Input()
  totalOperatingCost: number;
  @Input()
  boilerFuelUsage: number;
  @Input()
  settings: Settings;
  constructor() { }

  ngOnInit() {
    
  }

}
