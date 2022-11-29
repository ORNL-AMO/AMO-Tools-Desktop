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

  back(){
    if (this.mainTab == 'calculators') {
      this.psatTabService.mainTab.next('sankey');
    } else if (this.mainTab == 'sankey') {
      this.psatTabService.mainTab.next('report');
    } else if (this.mainTab == 'report') {
      this.psatTabService.mainTab.next('diagram');
    } else if (this.mainTab == 'diagram') {
      this.psatTabService.mainTab.next('assessment');
    } else if (this.mainTab == 'assessment') {
      this.psatTabService.mainTab.next('system-setup');
    }
  }

  continue() {
    if (this.mainTab == 'system-setup') {
      this.psatTabService.mainTab.next('assessment');
    } else if (this.mainTab == 'assessment') {
      this.psatTabService.mainTab.next('diagram');
    } else if (this.mainTab == 'diagram') {
      this.psatTabService.mainTab.next('report');
    } else if (this.mainTab == 'report') {
      this.psatTabService.mainTab.next('sankey');
    } else if (this.mainTab == 'sankey') {
      this.psatTabService.mainTab.next('calculators');
    }
  }
}
