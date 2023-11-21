import { Component, OnInit } from '@angular/core';
import { LogToolService } from '../log-tool.service';
import { Subscription } from 'rxjs';
import { LogToolDataService } from '../log-tool-data.service';
import { ExplorerData } from '../log-tool-models';
import { SecurityAndPrivacyService } from '../../shared/security-and-privacy/security-and-privacy.service';

@Component({
  selector: 'app-log-tool-banner',
  templateUrl: './log-tool-banner.component.html',
  styleUrls: ['./log-tool-banner.component.css']
})
export class LogToolBannerComponent implements OnInit {

  explorerDataSub: Subscription;
  explorerData: ExplorerData;
  bannerCollapsed: boolean = true;
  constructor(private logToolService: LogToolService, private logToolDataService: LogToolDataService, private securityAndPrivacyService: SecurityAndPrivacyService) { }

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

}
