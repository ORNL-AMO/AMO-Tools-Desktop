import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LogToolDataService } from '../log-tool-data.service';
import { LogToolDbService } from '../log-tool-db.service';
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
  dataCleaned: boolean;
  dataCleanedSub: Subscription;
  noDayTypeAnalysis: boolean;
  noDayTypeAnalysisSub: Subscription;
  dataSubmittedSub: Subscription;
  dataSubmitted: boolean;
  dataSetupTab: DataSetupRoute = "import-data";
  canAdvance: boolean = false;
  status: DataExplorerStatus;
  explorerData: ExplorerData;
  
  disableNext: boolean;
  explorerDataSub: Subscription;
  explorerStatusSub: Subscription;

  isStepHeaderRowComplete: boolean = false;
  isStepRefineComplete: boolean;
  isStepMapTimeDataComplete: boolean;
  isStepFileUploadComplete: boolean;
  constructor(private logToolService: LogToolService, 
    private logToolDataService: LogToolDataService, 
    private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.isModalOpenSub = this.logToolService.isModalOpen.subscribe(val => {
      this.isModalOpen = val;
    });

    this.explorerDataSub = this.logToolDataService.explorerData.subscribe(data => {
      this.explorerData = data;
      this.setDisableNext();
    });
    
    this.activatedRoute.url.subscribe(url => {
      let dataSetupChildRoute: DataSetupRoute = this.activatedRoute.firstChild.routeConfig.path as DataSetupRoute;
      this.dataSetupTab = 'import-data';
      if (dataSetupChildRoute) {
        this.dataSetupTab = dataSetupChildRoute;
      }
      this.setDisableNext();
    });

    this.explorerStatusSub = this.logToolDataService.status.subscribe(status => {
      this.status = status;
    });


  }

  ngOnDestroy() {
    this.isModalOpenSub.unsubscribe();
    this.explorerStatusSub.unsubscribe();
  }

  continue() {
    if (this.dataSetupTab == 'import-data') {
      this.router.navigateByUrl('/log-tool/data-setup/select-header-data');
    } else if (this.dataSetupTab == 'select-header-data') {
      this.advanceSteppedTabs('/log-tool/data-setup/refine-data', this.isStepHeaderRowComplete);
    } else if (this.dataSetupTab == 'refine-data') {
      // this.advanceSteppedTabs('/log-tool/data-setup/map-time-data', isStepRefineComplete);
      this.router.navigateByUrl('/log-tool/data-setup/map-time-data');
    }  else if (this.dataSetupTab == 'map-time-data') {
      // this.advanceSteppedTabs('/log-tool/data-setup/finish', isStepMapTimeDataComplete);
      this.router.navigateByUrl('/log-tool/data-setup/finish');
    }
  }

  resetFileData() {
    this.logToolDataService.resetFileData();
  }

  back() {
    if (this.dataSetupTab == 'finish') {
      this.router.navigateByUrl('/log-tool/data-setup/map-time-data');
    } else if (this.dataSetupTab == 'map-time-data') {
      this.router.navigateByUrl('/log-tool/data-setup/refine-data');
    } else if (this.dataSetupTab == 'refine-data') {
      this.router.navigateByUrl('/log-tool/data-setup/select-header-data');
    } else if (this.dataSetupTab == 'select-header-data') {
      this.router.navigateByUrl('/log-tool/data-setup/import-data');
    }
  }

  advanceSteppedTabs(url: string, isStepComplete: boolean) {
      let currentTabIndex = this.logToolDataService.selectedFileDataIndex.getValue();
      if (currentTabIndex < this.explorerData.fileData.length - 1) {
        currentTabIndex += 1; 
        this.logToolDataService.selectedFileDataIndex.next(currentTabIndex);
      } else if (isStepComplete) {
        this.router.navigateByUrl(url);
     }
  }

  setDisableNext() {
    this.isStepFileUploadComplete = this.explorerData.fileData.length !== 0;
    this.isStepHeaderRowComplete = this.logToolDataService.checkStepSelectedHeaderComplete();
    this.isStepRefineComplete = this.logToolDataService.checkStepRefineDataComplete();
    this.isStepMapTimeDataComplete = this.logToolDataService.checkStepMapDatesComplete();

    if (this.dataSetupTab == 'import-data') {
      if (this.isStepFileUploadComplete) {
        this.disableNext = false;
      } else {
        this.disableNext = true;
      }
    } else if (this.dataSetupTab == 'select-header-data') {
      if (this.isStepHeaderRowComplete) {
        this.disableNext = false;
      } else {
        this.disableNext = true;
      }
    } else if (this.dataSetupTab == 'refine-data') {
      if (this.isStepRefineComplete) {
        this.disableNext = false;
      } else {
        this.disableNext = true;
      }
    } else if (this.dataSetupTab == 'map-time-data') {
      if (this.isStepMapTimeDataComplete) {
        this.disableNext = false;
      } else {
        this.disableNext = true;
      }
    }
  }
}

export type DataSetupRoute = "import-data" | "select-header-data" | 'refine-data' | "map-time-data" | "finish";