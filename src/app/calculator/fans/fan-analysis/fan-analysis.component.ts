import { Component, OnInit, Input, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Fan203Inputs } from '../../../shared/models/fans';
import { FanAnalysisService } from './fan-analysis.service';
import { ConvertFsatService } from '../../../fsat/convert-fsat.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { PlaneDataFormService } from './fan-analysis-form/plane-data-form/plane-data-form.service';
@Component({
  selector: 'app-fan-analysis',
  templateUrl: './fan-analysis.component.html',
  styleUrls: ['./fan-analysis.component.css']
})
export class FanAnalysisComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('header') header: ElementRef;
  @ViewChild('footer') footer: ElementRef;
  @ViewChild('content') content: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }

  // inputs: Fan203Inputs;
  containerHeight: number;
  footerWidth: number;
  stepTabs: Array<string> = ['fan-info', 'gas-density', 'plane-data', 'fan-shaft-power'];
  planeStepTabs: Array<string>;
  planeStepIndex: number = 0;
  stepIndex: number = 0;
  stepTabSubscription: Subscription;
  planeTabSubscription: Subscription;
  getResultsSubscription: Subscription;

  constructor(private settingsDbService: SettingsDbService, private fanAnalysisService: FanAnalysisService, private convertFsatService: ConvertFsatService,
    private planeDataFormService: PlaneDataFormService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    // this.inputs = this.fanAnalysisService.inputData;
    if (this.fanAnalysisService.inputData === undefined) {
      this.fanAnalysisService.inputData = this.fanAnalysisService.getMockData();
      this.fanAnalysisService.inputData = this.convertFsatService.convertFan203Inputs(this.fanAnalysisService.inputData, this.settings);
    }
    this.setPlaneStepTabs();
    this.stepTabSubscription = this.fanAnalysisService.stepTab.subscribe(val => {
      this.setStepTabIndex(val);
    });
    this.planeTabSubscription = this.planeDataFormService.planeStep.subscribe(val => {
      this.setPlaneTabIndex(val);
    });

    this.getResultsSubscription = this.fanAnalysisService.getResults.subscribe(val => {
      this.setPlaneStepTabs();
      if (this.planeStepTabs[this.planeStepIndex] == '3b' && this.fanAnalysisService.inputData.FanRatedInfo.traversePlanes == 1) {
        this.setPlaneTabIndex('3a');
      }
      if (this.planeStepTabs[this.planeStepIndex] == '3c' && this.fanAnalysisService.inputData.FanRatedInfo.traversePlanes != 3) {
        this.setPlaneTabIndex('3a');
      }
    });

  }

  ngOnDestroy() {
    this.stepTabSubscription.unsubscribe();
    this.planeTabSubscription.unsubscribe();
    this.getResultsSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 500)
  }

  getContainerHeight() {
    if (this.content) {
      this.footerWidth = this.content.nativeElement.clientWidth;
      let contentHeight = this.content.nativeElement.clientHeight;
      let headerHeight = this.header.nativeElement.clientHeight;
      let footerHeight = 0;
      if (this.footer) {
        footerHeight = this.footer.nativeElement.clientHeight;
      }
      this.containerHeight = contentHeight - headerHeight - footerHeight;
    }
  }

  setPlaneStepTabs() {
    if (this.fanAnalysisService.inputData.FanRatedInfo.traversePlanes == 1) {
      this.planeStepTabs = ['plane-info', '1', '2', '3a', '4', '5'];
    } else if (this.fanAnalysisService.inputData.FanRatedInfo.traversePlanes == 2) {
      this.planeStepTabs = ['plane-info', '1', '2', '3a', '3b', '4', '5'];
    } else if (this.fanAnalysisService.inputData.FanRatedInfo.traversePlanes == 3) {
      this.planeStepTabs = ['plane-info', '1', '2', '3a', '3b', '3c', '4', '5'];
    }
  }

  setStepTabIndex(stepTab: string) {
    this.stepIndex = _.findIndex(this.stepTabs, (tab) => { return tab == stepTab });
  }

  setPlaneTabIndex(stepTab: string) {
    this.planeStepIndex = _.findIndex(this.planeStepTabs, (tab) => { return tab == stepTab });
  }

  next() {
    if (this.stepTabs[this.stepIndex] == 'plane-data') {
      let nextPlaneStep: string = this.planeStepTabs[this.planeStepIndex + 1];
      if (nextPlaneStep != undefined) {
        this.planeDataFormService.planeStep.next(nextPlaneStep);
      } else {
        let nextStep: string = this.stepTabs[this.stepIndex + 1];
        this.fanAnalysisService.stepTab.next(nextStep);
      }
    } else {
      let nextStep: string = this.stepTabs[this.stepIndex + 1];
      this.fanAnalysisService.stepTab.next(nextStep);
    }
  }

  back() {
    if (this.stepTabs[this.stepIndex] == 'plane-data') {
      if (this.planeStepIndex != 0) {
        let nextPlaneStep: string = this.planeStepTabs[this.planeStepIndex - 1];
        this.planeDataFormService.planeStep.next(nextPlaneStep);
      } else {
        let nextStep: string = this.stepTabs[this.stepIndex - 1];
        this.fanAnalysisService.stepTab.next(nextStep);
      }
    } else {
      let nextStep: string = this.stepTabs[this.stepIndex - 1];
      this.fanAnalysisService.stepTab.next(nextStep);
    }
  }

}
