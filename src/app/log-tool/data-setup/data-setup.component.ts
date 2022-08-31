import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LogToolDataService } from '../log-tool-data.service';
import { DataExplorerStatus, ExplorerData } from '../log-tool-models';
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
  explorerStatusSub: Subscription;

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
    this.status = this.logToolDataService.status.getValue();
    this.isModalOpenSub = this.logToolService.isModalOpen.subscribe(val => {
      this.isModalOpen = val;
    });

    this.explorerDataSub = this.logToolDataService.explorerData.subscribe(data => {
      this.explorerData = data;
      this.setDisableNext();
      this.cd.detectChanges();
    });
    
    this.activatedRoute.url.subscribe(url => {
      let dataSetupChildRoute: DataSetupRoute = this.activatedRoute.firstChild.routeConfig.path as DataSetupRoute;
      this.dataSetupTab = 'import-data';
      if (dataSetupChildRoute) {
        this.dataSetupTab = dataSetupChildRoute;
      }
    });

    this.explorerStatusSub = this.logToolDataService.status.subscribe(status => {
      this.status = status;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() {
    this.isModalOpenSub.unsubscribe();
    this.explorerDataSub.unsubscribe();
    this.explorerStatusSub.unsubscribe();
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
      // check go to daytypeanalys or visualize
      this.logToolDataService.explorerData.next(this.explorerData);
      this.router.navigateByUrl('/log-tool/visualize');
    }
  }
  
  resetFileData() {
    this.logToolDataService.resetFileData();
  }

  setDisableNext() {
   if (this.dataSetupTab == 'import-data') {
      if (this.explorerData.setupCompletion.isStepFileUploadComplete) {
        this.disableNext = false;
      } else {
        this.disableNext = true;
      }
    } else if (this.dataSetupTab == 'select-header-data') {
      if (this.explorerData.setupCompletion.isStepHeaderRowComplete) {
        this.disableNext = false;
      } else {
        this.disableNext = true;
      }
    } else if (this.dataSetupTab == 'refine-data') {
      if (this.explorerData.setupCompletion.isStepRefineComplete) {
        this.disableNext = false;
      } else {
        this.disableNext = true;
      }
    } else if (this.dataSetupTab == 'map-time-data') {
      if (this.explorerData.setupCompletion.isStepMapTimeDataComplete) {
        this.disableNext = false;
      } else {
        this.disableNext = true;
      }
    }
  }
}

export type DataSetupRoute = "import-data" | "select-header-data" | 'refine-data' | "map-time-data" | "finish";