import { Component, OnInit } from '@angular/core';
import { DayTypeAnalysisService } from '../day-type-analysis/day-type-analysis.service';
import { VisualizeService } from '../visualize/visualize.service';
import { DayTypeGraphService } from '../day-type-analysis/day-type-graph/day-type-graph.service';
import { LogToolService } from '../log-tool.service';
import { LogToolDataService } from '../log-tool-data.service';

@Component({
  selector: 'app-system-setup',
  templateUrl: './system-setup.component.html',
  styleUrls: ['./system-setup.component.css']
})
export class SystemSetupComponent implements OnInit {

  dataExists: boolean = false;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private visualizeService: VisualizeService, private dayTypeGraphService: DayTypeGraphService,
    private logToolService: LogToolService, private logToolDataService: LogToolDataService) { }

  ngOnInit() {
    if (this.dayTypeAnalysisService.dayTypesCalculated == true || this.visualizeService.visualizeDataInitialized == true) {
      this.dataExists = true;
    }
  }

  resetData(){
    this.dayTypeAnalysisService.resetData();
    this.visualizeService.resetData();
    this.dayTypeGraphService.resetData();
    this.logToolService.resetData();
    this.logToolDataService.resetData();
    this.dataExists = false;
  }
}
