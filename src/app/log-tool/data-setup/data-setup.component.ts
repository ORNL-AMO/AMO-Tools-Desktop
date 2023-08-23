import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MeasurMessageData } from '../../shared/models/utilities';
import { DayTypeAnalysisService } from '../day-type-analysis/day-type-analysis.service';
import { DayTypeGraphService } from '../day-type-analysis/day-type-graph/day-type-graph.service';
import { LogToolDataService } from '../log-tool-data.service';
import { ExplorerData, LoadingSpinner } from '../log-tool-models';
import { LogToolService } from '../log-tool.service';
import { VisualizeService } from '../visualize/visualize.service';

@Component({
  selector: 'app-data-setup',
  templateUrl: './data-setup.component.html',
  styleUrls: ['./data-setup.component.css'],
})
export class DataSetupComponent implements OnInit {
  isModalOpen: boolean;
  isModalOpenSub: Subscription;
  dataSetupTab = "import-data";
  explorerData: ExplorerData;
  
  disableNext: boolean;
  explorerDataSub: Subscription;
  loadingSpinnerSub: Subscription;
  loadingSpinner: LoadingSpinner;

  errorOverlaySub: Subscription;
  errorMessageData: MeasurMessageData;
  changeExplorerStepSub: Subscription;

  @ViewChild('nav', { static: false }) nav: ElementRef;
  @ViewChild('container', { static: false }) container: ElementRef;
  containerHeight: number;
  setupContainerHeightSub: Subscription;
  setupContainerHeight: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }

  continueButtonAction: string = 'Next';
  constructor(private logToolService: LogToolService, 
    private logToolDataService: LogToolDataService, 
    private dayTypeAnalysisService: DayTypeAnalysisService,
    private dayTypeGraphService: DayTypeGraphService,
    private visualizeService: VisualizeService,
    private cd: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.loadingSpinner = this.logToolDataService.loadingSpinner.getValue();
    this.explorerDataSub = this.logToolDataService.explorerData.subscribe(data => {
      // only emits updates if multiple files
      this.explorerData = data;
      this.setContinueButton();
      this.cd.detectChanges();
      this.setDisableNext();
    });

    this.isModalOpenSub = this.logToolService.isModalOpen.subscribe(val => {
      this.isModalOpen = val;
    });
    
    this.activatedRoute.url.subscribe(url => {
      this.dataSetupTab = this.activatedRoute.firstChild.routeConfig.path;
      this.setContinueButton();
      this.cd.detectChanges();
    });

    this.loadingSpinnerSub = this.logToolDataService.loadingSpinner.subscribe(loadingSpinner => {
      this.loadingSpinner = loadingSpinner;
      this.cd.detectChanges();
    });

    this.errorOverlaySub = this.logToolDataService.errorMessageData.subscribe(errorMessageData => {
      this.errorMessageData = errorMessageData;
      this.cd.detectChanges();
    });

    this.setupContainerHeightSub = this.logToolService.setupContainerHeight.subscribe(setupContainerHeight => {
      this.setupContainerHeight = setupContainerHeight
      this.getContainerHeight();
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
  }


  ngOnDestroy() {
    this.isModalOpenSub.unsubscribe();
    this.explorerDataSub.unsubscribe();
    this.loadingSpinnerSub.unsubscribe();
    this.errorOverlaySub.unsubscribe();
    this.setupContainerHeightSub.unsubscribe();
  }

  dismissMessageOverlay() {
    this.logToolDataService.errorMessageData.next({show: false, msg: undefined});
  }

  getContainerHeight() {
    if (this.nav && this.container && this.setupContainerHeight) {
      setTimeout(() => {
        let navHeight = this.nav.nativeElement.clientHeight;
        this.containerHeight = this.setupContainerHeight - navHeight;
        let heightBuffer: number = 43;
        this.containerHeight = this.containerHeight - heightBuffer;
      }, 100);
    }
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
    if (this.dataSetupTab == 'import-data' && this.explorerData.isStepFileUploadComplete) {
      this.router.navigateByUrl('/log-tool/data-setup/select-header-data');
    } else if (this.dataSetupTab == 'select-header-data') {
      this.logToolDataService.changeStep.next({direction: 'forward', url:'/log-tool/data-setup/refine-data'});
    } else if (this.dataSetupTab == 'refine-data') {
      this.logToolDataService.changeStep.next({direction: 'forward', url:'/log-tool/data-setup/map-time-data'});
    }  else if (this.dataSetupTab == 'map-time-data') {
      this.logToolDataService.changeStep.next({direction: 'forward', url:'/log-tool/day-type-analysis'});
    }
  }

  setContinueButton() {
    this.continueButtonAction = 'Next';
    if (this.dataSetupTab == 'map-time-data' && this.explorerData.isStepMapTimeDataComplete && this.explorerData.isLastTab) {
      this.continueButtonAction = 'Finish Setup';
    }
  }
  
  resetSetupData() {
    this.logToolDataService.resetSetupData();
    this.visualizeService.resetData();
    this.dayTypeAnalysisService.resetData();
    this.dayTypeGraphService.resetData();
  }

  setDisableNext() {
    if (this.dataSetupTab == 'import-data') {
      if (this.explorerData.isStepFileUploadComplete) {
        this.disableNext = false;
      } else {
        this.disableNext = true;
      }
    } else if (this.dataSetupTab == 'select-header-data') {
      this.disableNext = false;
    } else if (this.dataSetupTab == 'refine-data') {
      if (this.explorerData.refineDataStepStatus.isComplete || this.explorerData.refineDataStepStatus.currentDatasetValid) {
        this.disableNext = false;
      } else {
        this.disableNext = true;
      }
    } else if (this.dataSetupTab == 'map-time-data') {
      this.disableNext = false;
    }
    this.cd.detectChanges();
  }
}

export type DataSetupRoute = "import-data" | "select-header-data" | 'refine-data' | "map-time-data" | "finish";