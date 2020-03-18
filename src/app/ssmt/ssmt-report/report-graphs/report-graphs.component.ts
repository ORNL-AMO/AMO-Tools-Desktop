import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { SSMT } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { WaterfallInput } from '../../../shared/waterfall-graph/waterfall-graph.service';
import { SSMTLosses } from '../../../shared/models/steam/steam-outputs';
import { ReportGraphsService } from './report-graphs.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-report-graphs',
  templateUrl: './report-graphs.component.html',
  styleUrls: ['./report-graphs.component.css']
})
export class ReportGraphsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  ssmt: SSMT;
  @Input()
  baselineLosses: SSMTLosses;
  @Input()
  modificationLosses: Array<{ outputData: SSMTLosses, name: string }>;
  @Input()
  printView: boolean;
  @Input()
  printSankey: boolean;
  @Input()
  printGraphs: boolean;

  selectedSsmt1: SSMT;
  selectedSsmt2: SSMT;
  waterfallXAxisRange: number;
  constructor() { }

  ngOnInit() {
    this.selectedSsmt1 = this.ssmt;
    if (this.ssmt.modifications && this.ssmt.modifications.length != 0) {
      this.selectedSsmt2 = this.ssmt.modifications[0].ssmt;
    }
    this.setWaterfallXAxis();
  }

  setWaterfallXAxis(){
    let energyInputArr: Array<number> = [this.baselineLosses.fuelEnergy + this.baselineLosses.makeupWaterEnergy];
    this.modificationLosses.forEach(modificationLoss => {
      energyInputArr.push(modificationLoss.outputData.fuelEnergy + modificationLoss.outputData.makeupWaterEnergy)
    });
    this.waterfallXAxisRange = _.max(energyInputArr);
  }
}
