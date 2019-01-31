import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SSMT, SSMTInputs } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { Directory } from '../../shared/models/directory';
import { SSMTOutput } from '../../shared/models/steam/steam-outputs';
import { CalculateModelService } from '../ssmt-calculations/calculate-model.service';

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

  constructor(private calculateModelService: CalculateModelService) { }

  ngOnInit() {
    this.calculateModelService.initData(this.assessment.ssmt, this.settings);
    let resultData: {inputData: SSMTInputs, outputData: SSMTOutput} = this.calculateModelService.calculateModelRunner();
    this.baselineOutput = resultData.outputData;
    this.baselineInputData = resultData.inputData;
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
