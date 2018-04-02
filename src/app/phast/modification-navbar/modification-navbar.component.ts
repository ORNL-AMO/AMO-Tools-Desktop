import { Component, OnInit, Input, ChangeDetectorRef, ViewChild } from '@angular/core';
import { PHAST } from '../../shared/models/phast/phast';
import { PhastCompareService } from '../phast-compare.service';
import { Subscription } from 'rxjs';
import { LossesService } from '../losses/losses.service';
import { PhastService } from '../phast.service';

@Component({
  selector: 'app-modification-navbar',
  templateUrl: './modification-navbar.component.html',
  styleUrls: ['./modification-navbar.component.css']
})
export class ModificationNavbarComponent implements OnInit {
  @Input()
  phast: PHAST;

  selectedModification: PHAST;
  modSubscription: Subscription;
  updateTabsSubscription: Subscription;
  badges: Array<string>;
  assessmentTab: string;
  constructor(private phastCompareService: PhastCompareService, private cd: ChangeDetectorRef, private lossesService: LossesService, private phastService: PhastService) { }

  ngOnInit() {
    this.modSubscription = this.phastCompareService.selectedModification.subscribe(val => {
      this.selectedModification = val;
      this.cd.detectChanges();
    })

    this.updateTabsSubscription = this.lossesService.updateTabs.subscribe(val => {
      if (val) {
        this.getBadges();
      }
    })

    this.phastService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    })
  }

  ngOnDestroy(){
    this.updateTabsSubscription.unsubscribe();
    this.modSubscription.unsubscribe();
  }

  selectModification() {
    this.lossesService.openModificationModal.next(true);
  }

  renameModification() {
    this.lossesService.openRenameModal.next(true);
  }
  deleteModificaiton() {
    this.lossesService.openDeleteModal.next(true);
  }
  newModification() {
    this.lossesService.openNewModal.next(true);
  }

  getBadges() {
    let tmpBadges = [];
    if (this.selectedModification) {
      tmpBadges = this.phastCompareService.getBadges(this.phast, this.selectedModification);
    }
    this.badges = tmpBadges;
    this.cd.detectChanges();
  }

  changeAssessmentTab(str: string){
    this.phastService.assessmentTab.next(str);
  }
}
