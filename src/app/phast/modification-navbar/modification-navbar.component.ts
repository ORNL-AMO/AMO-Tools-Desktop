import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PHAST } from '../../shared/models/phast/phast';
import { PhastCompareService } from '../phast-compare.service';
import { Subscription } from 'rxjs';
import { LossesService } from '../losses/losses.service';
import { PhastService } from '../phast.service';

@Component({
    selector: 'app-modification-navbar',
    templateUrl: './modification-navbar.component.html',
    styleUrls: ['./modification-navbar.component.css'],
    standalone: false
})
export class ModificationNavbarComponent implements OnInit {
  @Input()
  phast: PHAST;

  selectedModification: PHAST;
  modSubscription: Subscription;
 // updateTabsSubscription: Subscription;
  badges: Array<string>;
  assessmentTab: string;
  tabsCollapsed: boolean = true;
  constructor(private phastCompareService: PhastCompareService, private cd: ChangeDetectorRef, private lossesService: LossesService, private phastService: PhastService) { }

  ngOnInit() {
    this.modSubscription = this.phastCompareService.selectedModification.subscribe(val => {
      this.selectedModification = val;
      this.cd.detectChanges();
    });

    // this.updateTabsSubscription = this.lossesService.updateTabs.subscribe(val => {
    //   if (val) {
    //     this.getBadges();
    //   }
    // })

    this.phastService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    });
  }

  ngOnDestroy() {
   // this.updateTabsSubscription.unsubscribe();
    this.modSubscription.unsubscribe();
  }

  selectModification() {
    this.lossesService.openModificationModal.next(true);
    this.collapseTabs();
  }

  // getBadges() {
  //   let tmpBadges = [];
  //   if (this.selectedModification) {
  //     tmpBadges = this.phastCompareService.getBadges(this.phast, this.selectedModification);
  //   }
  //   this.badges = tmpBadges;
  //   this.cd.detectChanges();
  // }

  changeAssessmentTab(str: string) {
    this.phastService.assessmentTab.next(str);
    this.collapseTabs();
  }

  collapseTabs() {
    this.tabsCollapsed = !this.tabsCollapsed;
  }
}
