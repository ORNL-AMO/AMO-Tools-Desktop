import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { Router } from '@angular/router';
import { AssessmentService } from '../../assessment/assessment.service';
import { SsmtService } from '../ssmt.service';
import { Subscription } from 'rxjs';

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
  constructor(private router: Router, private assessmentService: AssessmentService, private ssmtService: SsmtService) { }

  ngOnInit() {
    this.mainTabSub = this.ssmtService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
  }

  changeTab(str: string) {
    if (str == 'system-setup' || str == 'calculators') {
      this.ssmtService.mainTab.next(str);
    } else if (this.assessment.ssmt.setupDone) {
      this.ssmtService.mainTab.next(str);
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
}
