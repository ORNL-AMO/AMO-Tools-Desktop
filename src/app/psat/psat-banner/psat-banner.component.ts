import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { PsatService } from '../../psat/psat.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AssessmentService } from '../../assessment/assessment.service';

@Component({
  selector: 'app-psat-banner',
  templateUrl: './psat-banner.component.html',
  styleUrls: ['./psat-banner.component.css']
})
export class PsatBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;

  mainTab: string;
  mainTabSub: Subscription;
  constructor(private psatService: PsatService, private router: Router, private assessmentService: AssessmentService) { }

  ngOnInit() {
    this.mainTabSub = this.psatService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
  }

  ngOnDestroy(){
    this.mainTabSub.unsubscribe();
  }

  changeTab(str: string) {
    if (str == 'system-setup' || str == 'calculators') {
      this.psatService.mainTab.next(str);
    } else if (this.assessment.psat.setupDone) {
      this.psatService.mainTab.next(str);
    }
  }

  goHome(){
    this.assessmentService.workingDirectoryId.next(undefined);
    this.assessmentService.dashboardView.next('landing-screen');
    this.router.navigateByUrl('/dashboard');
  }

  goToFolder(){
    this.assessmentService.workingDirectoryId.next(this.assessment.directoryId);
    this.assessmentService.dashboardView.next('assessment-dashboard');
    this.router.navigateByUrl('/dashboard');
  }
}
