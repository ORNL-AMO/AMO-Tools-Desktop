import { Component, OnInit, Input } from '@angular/core';
import { HoverGroupData } from '../system-and-equipment-curve-graph/system-and-equipment-curve-graph.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-chart-hover-data',
  templateUrl: './chart-hover-data.component.html',
  styleUrls: ['./chart-hover-data.component.css']
})
export class ChartHoverDataComponent implements OnInit {

  @Input()
  currentHoverData: HoverGroupData;
  @Input()
  settings: Settings;
  @Input()
  equipmentType: string;
  @Input()
  imperialFanPrecision: string;
  constructor() { }

  ngOnInit(): void {
  }

}
