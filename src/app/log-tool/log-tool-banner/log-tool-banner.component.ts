import { Component, OnInit } from '@angular/core';
import { LogToolService } from '../log-tool.service';
import { Subscription } from 'rxjs';
import { LogToolDataService } from '../log-tool-data.service';
import { ExplorerData } from '../log-tool-models';

@Component({
  selector: 'app-log-tool-banner',
  templateUrl: './log-tool-banner.component.html',
  styleUrls: ['./log-tool-banner.component.css']
})
export class LogToolBannerComponent implements OnInit {

  explorerDataSub: any;
  explorerData: ExplorerData;
  constructor(private logToolService: LogToolService, private logToolDataService: LogToolDataService) { }

  ngOnInit() {
    this.explorerDataSub = this.logToolDataService.explorerData.subscribe(data => {
      this.explorerData = data;
    });
  }

  ngOnDestroy() {
    this.explorerDataSub.unsubscribe();
  }

  openExportData() {
    this.logToolService.openExportData.next(true);
  }

}
