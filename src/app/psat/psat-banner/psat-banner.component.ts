import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { Subscription } from 'rxjs';
import { PsatTabService } from '../psat-tab.service';

@Component({
  selector: 'app-psat-banner',
  templateUrl: './psat-banner.component.html',
  styleUrls: ['./psat-banner.component.css']
})
export class PsatBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;

  bannerCollapsed: boolean = true;
  mainTab: string;
  mainTabSub: Subscription;
  constructor(private psatTabService: PsatTabService) { }

  ngOnInit() {
    this.mainTabSub = this.psatTabService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  changeTab(str: string) {
    if (str == 'system-setup' || str == 'calculators') {
      this.psatTabService.mainTab.next(str);
    } else if (this.assessment.psat.setupDone) {
      this.psatTabService.mainTab.next(str);
    }
    this.collapseBanner();
  }
}
