import { Component, OnInit } from '@angular/core';
import { DayTypeAnalysisService } from './day-type-analysis.service';
import { LogToolService } from '../log-tool.service';
import { DayTypeGraphService } from './day-type-graph/day-type-graph.service';

@Component({
  selector: 'app-day-type-analysis',
  templateUrl: './day-type-analysis.component.html',
  styleUrls: ['./day-type-analysis.component.css']
})
export class DayTypeAnalysisComponent implements OnInit {

  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private logToolService: LogToolService,
    private dayTypeGraphService: DayTypeGraphService) { }

  ngOnInit() {
    let field: { fieldName: string, alias: string, useField: boolean, isDateField: boolean, unit: string } = this.logToolService.fields.find((field) => {
      return field.isDateField == false && field.useField == true;
    });
    this.dayTypeGraphService.selectedDataField.next(field.fieldName);
    this.dayTypeAnalysisService.getDaySummaries();
  }

}
