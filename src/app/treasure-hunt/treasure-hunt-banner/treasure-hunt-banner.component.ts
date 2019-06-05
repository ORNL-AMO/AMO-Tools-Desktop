import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { AssessmentService } from '../../assessment/assessment.service';
import { Router } from '@angular/router';
import { TreasureHuntService } from '../treasure-hunt.service';
import { Subscription } from 'rxjs';

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

  constructor(private assessmentService: AssessmentService, private router: Router, private treasureHuntService: TreasureHuntService) { }

  ngOnInit() {
    this.mainTabSub = this.treasureHuntService.mainTab.subscribe(val => {
      this.mainTab = val;
    });

    this.subTabSub = this.treasureHuntService.subTab.subscribe(val => {
      this.subTab = val;
    })
  }

  ngOnDestroy() {
    this.subTabSub.unsubscribe();
    this.mainTabSub.unsubscribe();
  }


  changeTab(str: string) {
    if (str == 'system-basics') {
      this.treasureHuntService.mainTab.next(str);
    } else if (this.assessment.treasureHunt.setupDone == true) {
      this.treasureHuntService.mainTab.next(str);
    }
  }

  goHome() {
    this.assessmentService.workingDirectoryId.next(undefined);
    this.assessmentService.dashboardView.next('landing-screen');
    this.router.navigateByUrl('/dashboard');
  }

  goToFolder() {
    this.assessmentService.workingDirectoryId.next(this.assessment.directoryId);
    this.assessmentService.dashboardView.next('assessment-dashboard');
    this.router.navigateByUrl('/dashboard');
  }

  changeSubTab(str: string) {
    this.treasureHuntService.subTab.next(str)
  }
}
