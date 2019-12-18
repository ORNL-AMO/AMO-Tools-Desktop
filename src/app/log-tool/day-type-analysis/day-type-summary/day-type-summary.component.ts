import { Component, OnInit } from '@angular/core';
import { DayTypeAnalysisService } from '../day-type-analysis.service';

@Component({
  selector: 'app-day-type-summary',
  templateUrl: './day-type-summary.component.html',
  styleUrls: ['./day-type-summary.component.css']
})
export class DayTypeSummaryComponent implements OnInit {

  daySummaries: Array<{ day: Date, averages: Array<{ value: number, label: string }> }>;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService) { }

  ngOnInit() {
    this.daySummaries = this.dayTypeAnalysisService.daySummaries;
  }

}
