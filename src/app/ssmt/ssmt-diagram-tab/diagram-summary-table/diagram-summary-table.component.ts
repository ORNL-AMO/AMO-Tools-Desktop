import { Component, OnInit, Input } from '@angular/core';
import { BoilerOutput, SSMTOperationsOutput, SteamCo2EmissionsOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

@Component({
    selector: 'app-diagram-summary-table',
    templateUrl: './diagram-summary-table.component.html',
    styleUrls: ['./diagram-summary-table.component.css'],
    standalone: false
})
export class DiagramSummaryTableComponent implements OnInit {
  @Input()
  operationsOutput: SSMTOperationsOutput;
  @Input()
  boiler: BoilerOutput;
  @Input()
  co2EmissionsOutput: SteamCo2EmissionsOutput;
  @Input()
  settings: Settings;
  constructor() { }

  ngOnInit() {
  }

}
