import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SSMT, SSMTInputs } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { Directory } from '../../shared/models/directory';
import { SSMTOutput, SSMTLosses } from '../../shared/models/steam/steam-outputs';
import { CalculateModelService } from '../ssmt-calculations/calculate-model.service';
import { CalculateLossesService } from '../ssmt-calculations/calculate-losses.service';

@Component({
  selector: 'app-ssmt-report',
  templateUrl: './ssmt-report.component.html',
  styleUrls: ['./ssmt-report.component.css']
})
export class SsmtReportComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  settings: Settings;
  @Input()
  directory: Directory;
  @Input()
  containerHeight: number;

  @ViewChild('reportBtns') reportBtns: ElementRef;
  @ViewChild('reportHeader') reportHeader: ElementRef;
  reportContainerHeight: number;
  currentTab: string = 'executiveSummary';

  baselineOutput: SSMTOutput;
  baselineInputData: SSMTInputs;
  baselineLosses: SSMTLosses;
  modificationOutputs: Array<{ name: string, outputData: SSMTOutput }>;
  modificationLosses: Array<{ name: string, outputData: SSMTLosses }>;
  constructor(private calculateModelService: CalculateModelService, private calculateLossesService: CalculateLossesService) { }

  ngOnInit() {
    this.calculateModelService.initResults();
    this.calculateModelService.initData(this.assessment.ssmt, this.settings, true);
    let resultData: { inputData: SSMTInputs, outputData: SSMTOutput } = this.calculateModelService.calculateModelRunner();
    this.baselineOutput = resultData.outputData;
    this.baselineInputData = resultData.inputData;
    this.baselineLosses = this.calculateLossesService.calculateLosses(this.baselineOutput, this.baselineInputData, this.settings);
    this.modificationOutputs = new Array<{ name: string, outputData: SSMTOutput }>();
    this.modificationLosses = new Array<{ name: string, outputData: SSMTLosses }>();
    if (this.assessment.ssmt.modifications) {
      this.assessment.ssmt.modifications.forEach(modification => {
        this.calculateModelService.initResults();
        this.calculateModelService.initData(modification.ssmt, this.settings, false, this.baselineOutput.sitePowerDemand);
        let resultData: { inputData: SSMTInputs, outputData: SSMTOutput } = this.calculateModelService.calculateModelRunner();
        this.modificationOutputs.push({ name: modification.ssmt.name, outputData: resultData.outputData });
        let modLosses: SSMTLosses = this.calculateLossesService.calculateLosses(resultData.outputData, resultData.inputData, this.settings);
        this.modificationLosses.push({ outputData: modLosses, name: modification.ssmt.name });
      })
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.containerHeight && !changes.containerHeight.firstChange) {
      this.getContainerHeight();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100)
  }

  getContainerHeight() {
    let btnHeight: number = this.reportBtns.nativeElement.clientHeight;
    let headerHeight: number = this.reportHeader.nativeElement.clientHeight;
    this.reportContainerHeight = this.containerHeight - btnHeight - headerHeight - 25;
  }

  setTab(str: string) {
    this.currentTab = str;
  }
}
