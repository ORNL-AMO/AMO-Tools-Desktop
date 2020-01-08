import { Component, OnInit } from '@angular/core';
import { DayTypeAnalysisService } from './day-type-analysis.service';

@Component({
  selector: 'app-day-type-analysis',
  templateUrl: './day-type-analysis.component.html',
  styleUrls: ['./day-type-analysis.component.css']
})
export class DayTypeAnalysisComponent implements OnInit {

  showContent: boolean = false;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    console.log('after init');
    setTimeout(() => {
      console.time('initData')
      this.dayTypeAnalysisService.getDaySummaries();
      this.dayTypeAnalysisService.initSecondaryDayTypes();
      this.dayTypeAnalysisService.setDayTypeSummaries();
      this.showContent = true;
      console.timeEnd('initData')
    }, 100);
  }
}
