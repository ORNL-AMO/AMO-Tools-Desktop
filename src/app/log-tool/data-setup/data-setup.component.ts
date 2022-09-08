import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LogToolDataService } from '../log-tool-data.service';
import { DataExplorerStatus, ExplorerData, LoadingSpinner } from '../log-tool-models';
import { LogToolService } from '../log-tool.service';

@Component({
  selector: 'app-data-setup',
  templateUrl: './data-setup.component.html',
  styleUrls: ['./data-setup.component.css']
})
export class DataSetupComponent implements OnInit {
  isModalOpen: boolean;
  isModalOpenSub: Subscription;
  dataSetupTab: DataSetupRoute = "import-data";
  status: DataExplorerStatus;
  explorerData: ExplorerData;
  
  disableNext: boolean;
  explorerDataSub: Subscription;
  loadingSpinnerSub: Subscription;
  loadingSpinner: LoadingSpinner;
  showTest: boolean = false;

  isStepHeaderRowComplete: boolean;
  isStepRefineComplete: boolean;
  isStepMapTimeDataComplete: boolean;
  isStepFileUploadComplete: boolean;
  changeExplorerStepSub: Subscription;
  constructor(private logToolService: LogToolService, 
    private logToolDataService: LogToolDataService, 
    private cd: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.loadingSpinner = this.logToolDataService.loadingSpinner.getValue();
    this.isModalOpenSub = this.logToolService.isModalOpen.subscribe(val => {
      this.isModalOpen = val;
    });

    this.explorerDataSub = this.logToolDataService.explorerData.subscribe(data => {
      this.explorerData = data;
      this.setDisableNext();
    });
    
    this.activatedRoute.url.subscribe(url => {
      this.dataSetupTab = this.activatedRoute.firstChild.routeConfig.path as DataSetupRoute;
    });

    this.loadingSpinnerSub = this.logToolDataService.loadingSpinner.subscribe(loadingSpinner => {
      this.loadingSpinner = loadingSpinner
      this.cd.detectChanges();
    });

    // this.router.events.subscribe(event => {
    //   if (event instanceof NavigationStart) {
    //     this.loadingSpinner = { show: true, msg: 'Finalizing Data Setup...' };
    //   } else if (event instanceof NavigationEnd) {
    //     this.loadingSpinner = { show: false, msg: 'Finalizing Data Setup...' };
    //   }
    // });
  }

  ngOnDestroy() {
    this.isModalOpenSub.unsubscribe();
    this.explorerDataSub.unsubscribe();
    this.loadingSpinnerSub.unsubscribe();
  }

  back() {
     if (this.dataSetupTab == 'map-time-data') {
      this.logToolDataService.changeStep.next({ direction: 'back', url: '/log-tool/data-setup/refine-data' });
    } else if (this.dataSetupTab == 'refine-data') {
      this.logToolDataService.changeStep.next({ direction: 'back', url: '/log-tool/data-setup/select-header-data' });
    } else if (this.dataSetupTab == 'select-header-data') {
      this.logToolDataService.changeStep.next({ direction: 'back', url: '/log-tool/data-setup/import-data' });
    }
  }

  continue() {
    if (this.dataSetupTab == 'import-data' && this.explorerData.setupCompletion.isStepFileUploadComplete) {
      this.router.navigateByUrl('/log-tool/data-setup/select-header-data');
    } else if (this.dataSetupTab == 'select-header-data') {
      this.logToolDataService.changeStep.next({direction: 'forward', url:'/log-tool/data-setup/refine-data'});
    } else if (this.dataSetupTab == 'refine-data') {
      this.logToolDataService.changeStep.next({direction: 'forward', url:'/log-tool/data-setup/map-time-data'});
    }  else if (this.dataSetupTab == 'map-time-data') {
      this.logToolDataService.changeStep.next({direction: 'forward', url:'/log-tool/day-type-analysis'});
    }
  }
  
  resetSetupData() {
    this.logToolDataService.resetSetupData();
  }

  setDisableNext() {
   if (this.dataSetupTab == 'import-data') {
      if (this.explorerData.setupCompletion.isStepFileUploadComplete) {
        this.disableNext = false;
      } else {
        this.disableNext = true;
      }
    } else if (this.dataSetupTab == 'select-header-data') {
      this.disableNext = false;
    } else if (this.dataSetupTab == 'refine-data') {
      this.disableNext = false;
    } else if (this.dataSetupTab == 'map-time-data') {
      this.disableNext = false;
    }
  }
}

export type DataSetupRoute = "import-data" | "select-header-data" | 'refine-data' | "map-time-data" | "finish";