import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { TreasureHuntService } from '../treasure-hunt.service';
import { Subscription } from 'rxjs';
import { CalculatorsService } from '../calculators/calculators.service';

@Component({
  selector: 'app-treasure-hunt-banner',
  templateUrl: './treasure-hunt-banner.component.html',
  styleUrls: ['./treasure-hunt-banner.component.css']
})
export class TreasureHuntBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;

  mainTabSub: Subscription;
  mainTab: string;

  subTab: string;
  subTabSub: Subscription;
  calculatorTabSub: Subscription;
  disableTabs: boolean = false;
  bannerCollapsed: boolean = true;
  constructor(private treasureHuntService: TreasureHuntService, private calculatorsService: CalculatorsService) { }

  ngOnInit() {
    this.mainTabSub = this.treasureHuntService.mainTab.subscribe(val => {
      this.mainTab = val;
    });

    this.subTabSub = this.treasureHuntService.subTab.subscribe(val => {
      this.subTab = val;
    });

    this.calculatorTabSub = this.calculatorsService.selectedCalc.subscribe(val => {
      if (val == 'none') {
        this.disableTabs = false;
      } else {
        this.disableTabs = true;
      }
    });
  }

  ngOnDestroy() {
    this.subTabSub.unsubscribe();
    this.mainTabSub.unsubscribe();
    this.calculatorTabSub.unsubscribe();
  }


  changeTab(str: string) {
    if (this.disableTabs == false) {
      if (str == 'system-basics') {
        this.treasureHuntService.mainTab.next(str);
      } else if (this.assessment.treasureHunt.setupDone == true) {
        this.treasureHuntService.mainTab.next(str);
      }
    }
    this.collapseBanner();
  }

  changeSubTab(str: string) {
    this.treasureHuntService.subTab.next(str)
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }
}
