import { Component, OnInit, Input } from '@angular/core';
import { SSMTInputs } from '../../../shared/models/steam/ssmt';
import { BoilerOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-cost-table',
  templateUrl: './cost-table.component.html',
  styleUrls: ['./cost-table.component.css']
})
export class CostTableComponent implements OnInit {
  @Input()
  inputData: SSMTInputs;
  @Input()
  powerGenerated: number;
  @Input()
  boiler: BoilerOutput;
  @Input()
  makeupWaterVolumeFlow: number;

  constructor() { }

  ngOnInit() {
  }

}
