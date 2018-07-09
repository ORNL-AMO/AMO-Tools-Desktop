import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import * as d3 from 'd3';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FsatService } from '../../fsat.service';
import { FSAT } from '../../../shared/models/fans';

var svg;

const labelFontSize = 8,
  labelPadding = 10,
  topLabelPositionY = 40,
  bottomLabelPositionY = 1250,
  topReportPositionY = 125,
  bottomReportPositionY = 1250;

@Component({
  selector: 'app-explore-opportunities-sankey',
  templateUrl: './explore-opportunities-sankey.component.html',
  styleUrls: ['./explore-opportunities-sankey.component.css']
})
export class ExploreOpportunitiesSankeyComponent implements OnInit {
  @Input()
  baselineSankey: FSAT;
  @Input()
  modificationSankey: FSAT;
  @Input()
  settings: Settings
  @Input()
  assessmentName: string;
  


  // width: number;
  // height: number;
  // firstChange: boolean = true;
  // //Max width of Sankey

  selectedView: string = 'Baseline';

  // energyInput: number;
  // motorLosses: number;
  // driveLosses: number;
  // fanLosses: number;
  // usefulOutput: number;

  
  constructor(private convertUnitsService: ConvertUnitsService, private fsatService: FsatService) { }

  ngOnInit() {
  }

  switchSankey(toggle: string) {
    this.selectedView = toggle;
  }

}
