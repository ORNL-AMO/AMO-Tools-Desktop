import { Component, OnInit } from '@angular/core';
import { DayTypeAnalysisService } from './day-type-analysis.service';

@Component({
  selector: 'app-day-type-analysis',
  templateUrl: './day-type-analysis.component.html',
  styleUrls: ['./day-type-analysis.component.css']
})
export class DayTypeAnalysisComponent implements OnInit {

  constructor(private dayTypeAnalysisService: DayTypeAnalysisService) { }

  ngOnInit() {
    this.dayTypeAnalysisService.getDaySummaries();
    this.dayTypeAnalysisService.initSecondaryDayTypes();
    this.dayTypeAnalysisService.setDayTypeSummaries();
  }
}
