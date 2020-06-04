import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DayTypeAnalysisService } from '../day-type-analysis.service';
import { DayTypeSummary, LogToolField, DayType, LogToolDay } from '../../log-tool-models';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { LogToolDataService } from '../../log-tool-data.service';
import { DayTypeGraphService } from '../day-type-graph/day-type-graph.service';
@Component({
  selector: 'app-day-type-table',
  templateUrl: './day-type-table.component.html',
  styleUrls: ['./day-type-table.component.css']
})
export class DayTypeTableComponent implements OnInit {
  selectedGraphType: string;
  selectedGraphTypeSub: Subscription;
  dataDisplayTypeSub: Subscription;
  dataDisplayType: string;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private dayTypeGraphService: DayTypeGraphService) { }

  ngOnInit() {
    this.selectedGraphTypeSub = this.dayTypeGraphService.selectedGraphType.subscribe(val => {
      this.selectedGraphType = val;
    });
    this.dataDisplayTypeSub = this.dayTypeAnalysisService.dataDisplayType.subscribe(displayType => {
      this.dataDisplayType = displayType;
    });
  }

  ngOnDestroy() {
    this.selectedGraphTypeSub.unsubscribe();
    this.dataDisplayTypeSub.unsubscribe();
  }
}
