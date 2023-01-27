import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { SsmtService } from '../ssmt.service';
import { Subscription } from 'rxjs';
import { SecurityAndPrivacyService } from '../../shared/security-and-privacy/security-and-privacy.service';

@Component({
  selector: 'app-ssmt-banner',
  templateUrl: './ssmt-banner.component.html',
  styleUrls: ['./ssmt-banner.component.css']
})
export class SsmtBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;

  mainTab: string;
  mainTabSub: Subscription;
  
  constructor(private ssmtService: SsmtService, private securityAndPrivacyService: SecurityAndPrivacyService) { }

  ngOnInit() {
    this.mainTabSub = this.ssmtService.mainTab.subscribe(val => {
      this.mainTab = val;
    });
  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
  }

  showSecurityAndPrivacyModal() {
    this.securityAndPrivacyService.modalOpen.next(true);
    this.securityAndPrivacyService.showSecurityAndPrivacyModal.next(true);
  }

  changeTab(str: string) {
    if (str === 'system-setup' || str === 'calculators') {
      this.ssmtService.mainTab.next(str);
    } else if (this.assessment.ssmt.setupDone) {
      this.ssmtService.mainTab.next(str);
    }
  }
}
