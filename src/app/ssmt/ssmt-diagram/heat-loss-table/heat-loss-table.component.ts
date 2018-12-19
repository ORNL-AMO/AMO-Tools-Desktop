import { Component, OnInit, Input } from '@angular/core';
import { HeatLossOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-heat-loss-table',
  templateUrl: './heat-loss-table.component.html',
  styleUrls: ['./heat-loss-table.component.css']
})
export class HeatLossTableComponent implements OnInit {
  @Input()
  heatLoss: HeatLossOutput;
  constructor() { }

  ngOnInit() {
  }

}
