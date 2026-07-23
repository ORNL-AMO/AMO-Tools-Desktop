import { Component, OnInit } from '@angular/core';
import { LogToolService } from '../log-tool.service';
import { Subscription } from 'rxjs';
import { LogToolDataService } from '../log-tool-data.service';
import { ExplorerData } from '../log-tool-models';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { SecurityAndPrivacyItemComponent } from '../../shared/security-and-privacy/security-and-privacy-item/security-and-privacy-item.component';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { LogToolDbService } from '../log-tool-db.service';

@Component({
    selector: 'app-log-tool-banner',
    templateUrl: './log-tool-banner.component.html',
    styleUrls: ['./log-tool-banner.component.css'],
    standalone: false
})
export class LogToolBannerComponent implements OnInit {

  explorerDataSub: Subscription;
  explorerData: ExplorerData;
  bannerCollapsed: boolean = true;
  constructor(private logToolService: LogToolService, 
    private emailMeasurDataService: EmailMeasurDataService,
    private logToolDbService: LogToolDbService,
    private logToolDataService: LogToolDataService, private modalDialogService: ModalDialogService) { }

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
    this.modalDialogService.openModal<SecurityAndPrivacyItemComponent, undefined>(
      SecurityAndPrivacyItemComponent,
    );
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
