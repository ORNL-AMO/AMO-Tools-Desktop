import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FsatService } from '../fsat.service';
import { Subscription } from 'rxjs';
import { CompareService } from '../compare.service';
import { FSAT } from '../../shared/models/fans';

@Component({
  selector: 'app-fsat-tabs',
  templateUrl: './fsat-tabs.component.html',
  styleUrls: ['./fsat-tabs.component.css']
})
export class FsatTabsComponent implements OnInit {

  mainTab: string;
  stepTab: string;
  assessmentTab: string;
  mainTabSub: Subscription;
  stepTabSub: Subscription;
  assessmentTabSub: Subscription;
  modSubscription: Subscription;
  selectedModification: FSAT;
  constructor(private fsatService: FsatService, private compareService: CompareService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.mainTabSub = this.fsatService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
    this.stepTabSub = this.fsatService.stepTab.subscribe(val => {
      this.stepTab = val;
    })

    this.assessmentTabSub = this.fsatService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    })

    this.modSubscription = this.compareService.selectedModification.subscribe(val => {
      this.selectedModification = val;
      console.log(this.selectedModification);
      this.cd.detectChanges();
    })
  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
    this.stepTabSub.unsubscribe();
    this.assessmentTabSub.unsubscribe();
    this.modSubscription.unsubscribe();
  }

  changeStepTab(str: string) {
    this.fsatService.stepTab.next(str);
  }

  changeAssessmentTab(str: string){
    this.fsatService.assessmentTab.next(str);
  }

  selectModification() {
    this.compareService.openModificationModal.next(true);
  }
}
