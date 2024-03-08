import { Component, OnInit } from '@angular/core';
import { LogToolService } from '../log-tool.service';
import { Subscription } from 'rxjs';
import { LogToolDataService } from '../log-tool-data.service';
import { ExplorerData } from '../log-tool-models';
import { SecurityAndPrivacyService } from '../../shared/security-and-privacy/security-and-privacy.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { LogToolDbService } from '../log-tool-db.service';

@Component({
  selector: 'app-log-tool-banner',
  templateUrl: './log-tool-banner.component.html',
  styleUrls: ['./log-tool-banner.component.css']
})
export class LogToolBannerComponent implements OnInit {

  explorerDataSub: Subscription;
  explorerData: ExplorerData;
  bannerCollapsed: boolean = true;
  constructor(private logToolService: LogToolService, 
    private emailMeasurDataService: EmailMeasurDataService,
    private logToolDbService: LogToolDbService,
    private logToolDataService: LogToolDataService, private securityAndPrivacyService: SecurityAndPrivacyService) { }

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

  showSecurityAndPrivacyModal() {
    this.securityAndPrivacyService.modalOpen.next(true);
    this.securityAndPrivacyService.showSecurityAndPrivacyModal.next(true);
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  emailTreasureHuntData() {
    const date = new Date();
    const dateStr = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
    let itemName = 'ExplorerData_' + dateStr;  
    let exportData = this.logToolDbService.getLogToolDbDataObj()

    this.emailMeasurDataService.measurItemAttachment = {
      itemType: 'data-explorer',
      itemName: itemName,
      itemData: exportData
    }

    this.emailMeasurDataService.showEmailMeasurDataModal.next(true);
  }

}
