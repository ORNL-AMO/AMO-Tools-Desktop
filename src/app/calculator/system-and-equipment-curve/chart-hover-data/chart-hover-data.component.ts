import { Component, OnInit, Input } from '@angular/core';
import { HoverGroupData } from '../system-and-equipment-curve-graph/system-and-equipment-curve-graph.service';
import { Settings } from '../../../shared/models/settings';
import { ChartConfig } from '../../../shared/models/plotting';

@Component({
  selector: 'app-chart-hover-data',
  templateUrl: './chart-hover-data.component.html',
  styleUrls: ['./chart-hover-data.component.css']
})
export class ChartHoverDataComponent implements OnInit {

  @Input()
  currentHoverData: HoverGroupData;
  @Input()
  showHoverGroupData: boolean;
  @Input()
  settings: Settings;
  @Input()
  chartConfig: ChartConfig;
  constructor() { }

  ngOnInit(): void {
  }

}
