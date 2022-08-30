import { Component, OnInit } from '@angular/core';
import { LogToolService } from '../log-tool.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LogToolDataService } from '../log-tool-data.service';

@Component({
  selector: 'app-system-setup',
  templateUrl: './system-setup.component.html',
  styleUrls: ['./system-setup.component.css']
})
export class SystemSetupComponent implements OnInit {

  isModalOpen: boolean;
  isModalOpenSub: Subscription;
  dataCleaned: boolean;
  dataCleanedSub: Subscription;
  noDayTypeAnalysis: boolean;
  noDayTypeAnalysisSub: Subscription;
  dataSubmittedSub: Subscription;
  dataSubmitted: boolean;
  currentTab: string;

  disableNext: boolean;
  constructor(private logToolService: LogToolService, 
    private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.isModalOpenSub = this.logToolService.isModalOpen.subscribe(val => {
      this.isModalOpen = val;
    });

    this.activatedRoute.url.subscribe(url => {
      this.currentTab = this.activatedRoute.firstChild.routeConfig.path;
      this.setDisableNext();
    });

    this.dataCleanedSub = this.logToolService.dataCleaned.subscribe(val => {
      this.dataCleaned = val;
      this.setDisableNext();
    });
    
    this.noDayTypeAnalysisSub = this.logToolService.noDayTypeAnalysis.subscribe(val => {
      this.noDayTypeAnalysis = val;
    });
    
    this.dataSubmittedSub = this.logToolService.dataSubmitted.subscribe(val => {
      this.dataSubmitted = val;
      this.setDisableNext();
    });
  }

  ngOnDestroy() {
    this.isModalOpenSub.unsubscribe();
    this.dataCleanedSub.unsubscribe();
    this.noDayTypeAnalysisSub.unsubscribe();
    this.dataSubmittedSub.unsubscribe();
  }

  continue() {
    if (this.currentTab == 'import-data') {
      this.router.navigateByUrl('/log-tool/system-setup/clean-data');
    } else if (this.currentTab == 'clean-data') {
      if (this.noDayTypeAnalysis) {
        this.router.navigateByUrl('/log-tool/visualize');
      } else {
        this.router.navigateByUrl('/log-tool/day-type-analysis');
      }
    }
  }

  back() {
    this.router.navigateByUrl('/log-tool/system-setup/setup-data');
  }

  setDisableNext() {
    if (this.currentTab == 'import-data') {
      if (this.dataSubmitted) {
        this.disableNext = false;
      } else {
        this.disableNext = true;
      }
    } else if (this.currentTab == 'clean-data') {
      if (this.dataCleaned) {
        this.disableNext = false;
      } else {
        this.disableNext = true;
      }
    }
  }
}
