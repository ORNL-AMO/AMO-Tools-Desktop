import { Component, OnInit, Input } from '@angular/core';
import { CombinedHeatPowerOutput } from '../../../../shared/models/combinedHeatPower';
@Component({
  selector: 'app-combined-heat-power-results',
  templateUrl: './combined-heat-power-results.component.html',
  styleUrls: ['./combined-heat-power-results.component.css']
})
export class CombinedHeatPowerResultsComponent implements OnInit {
  @Input()
  results: CombinedHeatPowerOutput;
  constructor() { }

  ngOnInit() {
  }

}
