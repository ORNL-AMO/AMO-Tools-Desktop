import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { FsatService } from '../fsat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fsat-banner',
  templateUrl: './fsat-banner.component.html',
  styleUrls: ['./fsat-banner.component.css']
})
export class FsatBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;

  mainTab: string;
  mainTabSubscription: Subscription;
  bannerCollapsed: boolean = true;
  constructor(private fsatService: FsatService) { }

  ngOnInit() {
    this.mainTabSubscription = this.fsatService.mainTab.subscribe(val => {
      this.mainTab = val;
    });
  }

  ngOnDestroy() {
    this.mainTabSubscription.unsubscribe();
  }

  changeTab(str: string) {
    if (str === 'system-setup' || str === 'calculators') {
      this.fsatService.mainTab.next(str);
    } else if (this.assessment.fsat.setupDone) {
      this.fsatService.mainTab.next(str);
    }
    this.collapseBanner();
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }
}
