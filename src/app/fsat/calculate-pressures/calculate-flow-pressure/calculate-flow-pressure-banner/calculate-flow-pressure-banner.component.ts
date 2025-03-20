import { Component, OnInit, Input } from '@angular/core';
import { FanInfoFormService } from '../../../../calculator/fans/fan-analysis/fan-analysis-form/fan-info-form/fan-info-form.service';
import { FanAnalysisService } from '../../../../calculator/fans/fan-analysis/fan-analysis.service';
import { PlaneDataFormService } from '../../../../calculator/fans/fan-analysis/fan-analysis-form/plane-data-form/plane-data-form.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-calculate-flow-pressure-banner',
    templateUrl: './calculate-flow-pressure-banner.component.html',
    styleUrls: ['./calculate-flow-pressure-banner.component.css'],
    standalone: false
})
export class CalculateFlowPressureBannerComponent implements OnInit {
  @Input()
  settings: Settings;

  mainTab: string;
  mainTabSubscription: Subscription;
  stepTab: string;
  stepTabSubscription: Subscription;
  planeDataClassStatus: Array<string> = [];
  basicsClassStatus: Array<string> = [];
  getResultsSubscription: Subscription;
  constructor(private fanAnalysisService: FanAnalysisService, private planeDataFormService: PlaneDataFormService,
    private fanInfoFormService: FanInfoFormService) { }

  ngOnInit() {
    this.mainTabSubscription = this.fanAnalysisService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.updateClassArrays();
    });
    this.stepTabSubscription = this.fanAnalysisService.stepTab.subscribe(val => {
      this.stepTab = val;
      this.updateClassArrays();
    });
    this.getResultsSubscription = this.fanAnalysisService.getResults.subscribe(val => {
      this.updateClassArrays();
    })
  }

  ngOnDestroy() {
    this.mainTabSubscription.unsubscribe();
    this.stepTabSubscription.unsubscribe();
    this.getResultsSubscription.unsubscribe();
  }

  changeTab(str: string) {
    this.fanAnalysisService.mainTab.next(str);
  }

  changeStepTab(str: string) {
    this.fanAnalysisService.stepTab.next(str);
  }

  updateClassArrays() {
    this.checkPlaneData();
    this.checkBasics();
  }

  checkPlaneData() {
    let planeDataDone: boolean = this.planeDataFormService.checkPlaneDataValid(this.fanAnalysisService.inputData.PlaneData, this.fanAnalysisService.inputData.FanRatedInfo, this.settings);
    if (!planeDataDone) {
      this.planeDataClassStatus = ['missing-data'];
    } else {
      this.planeDataClassStatus = [];
    }
    if (this.stepTab === 'plane-data') {
      this.planeDataClassStatus.push('active');
    }
  }

  checkBasics() {
    let basicsDone: boolean = this.fanInfoFormService.getBasicsFormFromObject(this.fanAnalysisService.inputData.FanRatedInfo, this.settings).valid;
    if (!basicsDone) {
      this.basicsClassStatus = ['missing-data'];
    } else {
      this.basicsClassStatus = [];
    }
    if (this.stepTab === 'fan-info') {
      this.basicsClassStatus.push('active');
    }
  }

}
