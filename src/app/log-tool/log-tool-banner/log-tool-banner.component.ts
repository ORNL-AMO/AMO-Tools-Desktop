import { Component, OnInit } from '@angular/core';
import { LogToolService } from '../log-tool.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-log-tool-banner',
  templateUrl: './log-tool-banner.component.html',
  styleUrls: ['./log-tool-banner.component.css']
})
export class LogToolBannerComponent implements OnInit {

  dataSubmitted: boolean;
  dataSubmittedSub: Subscription;
  dataCleaned: boolean;
  dataCleanedSub: Subscription;
  noDayTypeAnalysis: boolean;
  noDayTypeAnalysisSub: Subscription;
  constructor(private logToolService: LogToolService) { }

  ngOnInit() {
    this.dataSubmittedSub = this.logToolService.dataSubmitted.subscribe(val => {
      this.dataSubmitted = val;
    });
    this.dataCleanedSub = this.logToolService.dataCleaned.subscribe(val => {
      this.dataCleaned = val;
    });
    this.noDayTypeAnalysisSub = this.logToolService.noDayTypeAnalysis.subscribe(val => {
      this.noDayTypeAnalysis = val;
    });
  }

  ngOnDestroy() {
    this.dataSubmittedSub.unsubscribe();
    this.dataCleanedSub.unsubscribe();
    this.noDayTypeAnalysisSub.unsubscribe();
  }

  openExportData() {
    if (this.dataCleaned) {
      this.logToolService.openExportData.next(true);
    }
  }

}
