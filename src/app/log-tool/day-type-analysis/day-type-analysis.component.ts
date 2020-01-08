import { Component, OnInit } from '@angular/core';
import { DayTypeAnalysisService } from './day-type-analysis.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-day-type-analysis',
  templateUrl: './day-type-analysis.component.html',
  styleUrls: ['./day-type-analysis.component.css']
})
export class DayTypeAnalysisComponent implements OnInit {

  showContent: boolean = false;
  displayDayTypeCalanderSub: Subscription;
  displayDayTypeCalander: boolean;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService) { }

  ngOnInit() {
    this.dayTypeAnalysisService.setStartDateAndNumberOfMonths();
    this.displayDayTypeCalanderSub = this.dayTypeAnalysisService.displayDayTypeCalander.subscribe(val => {
      this.displayDayTypeCalander = val;
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.dayTypeAnalysisService.getDaySummaries();
      this.dayTypeAnalysisService.initSecondaryDayTypes();
      this.dayTypeAnalysisService.setDayTypeSummaries();
      this.showContent = true;
    }, 100);
  }

  ngOnDestroy() {
    this.displayDayTypeCalanderSub.unsubscribe();
  }
}
