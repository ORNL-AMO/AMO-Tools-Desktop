import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { PhastService } from '../phast.service';
import { Settings } from '../../shared/models/settings';
import { Router } from '@angular/router';
import { AssessmentService } from '../../assessment/assessment.service';
@Component({
  selector: 'app-phast-banner',
  templateUrl: './phast-banner.component.html',
  styleUrls: ['./phast-banner.component.css']
})
export class PhastBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  settings: Settings;

  mainTab: string;
  constructor(private phastService: PhastService, private router: Router, private assessmentService: AssessmentService) { }

  ngOnInit() {
    this.phastService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
  }

  changeTab(str: string) {
    if (str == 'system-setup' || str == 'calculators') {
      this.phastService.mainTab.next(str);
    } else if (this.assessment.phast.setupDone) {
      this.phastService.mainTab.next(str);
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
