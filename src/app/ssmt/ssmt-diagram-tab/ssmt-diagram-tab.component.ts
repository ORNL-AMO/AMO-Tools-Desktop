import { Component, OnInit, Input, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { SSMT, SSMTInputs } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { SSMTOutput } from '../../shared/models/steam/steam-outputs';
import { CalculateModelService } from '../ssmt-calculations/calculate-model.service';
import { SsmtService } from '../ssmt.service';

@Component({
  selector: 'app-ssmt-diagram-tab',
  templateUrl: './ssmt-diagram-tab.component.html',
  styleUrls: ['./ssmt-diagram-tab.component.css']
})
export class SsmtDiagramTabComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;
  @Input()
  containerHeight: number;


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setScaleValue();
  }

  @ViewChild('diagramContainer') diagramContainer: ElementRef;

  outputData: SSMTOutput;
  inputData: SSMTInputs;
  tabSelect: string = 'results';
  hoveredEquipment: string = 'default';
  selectedTable: string = 'default';

  selectedSSMT: SSMT;
  dataCalculated: boolean = false;
  displayCalculators: boolean = false;
  scaleValue: number = 100;

  setDiagramPixelWidth: number = 900;
  constructor(private calculateModelService: CalculateModelService, private ssmtService: SsmtService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.ssmt.name = 'Baseline';

    if (this.ssmt.setupDone && !this.ssmt.resultsCalculated) {
      setTimeout(() => {
        this.ssmt.outputData = this.calculateModelService.initDataAndRun(this.ssmt, this.settings, true, false, 0).outputData;
        this.ssmt.resultsCalculated = true;
        this.ssmtService.saveSSMT.next(this.ssmt);
        this.selectedSSMT = this.ssmt;
        this.calculateResults();
      }, 100);
    } else {
      this.selectedSSMT = this.ssmt;
      this.calculateResults();
    }
  }

  ngAfterViewInit() {
    this.setScaleValue();
  }

  setScaleValue() {
    if (this.diagramContainer) {
      let containerWidth: number = this.diagramContainer.nativeElement.clientWidth;
      let scaleDecimal: number = containerWidth / this.setDiagramPixelWidth - .025;
      this.scaleValue = scaleDecimal * 100;
      this.cd.detectChanges();
    } else {
      this.scaleValue = 100;
      this.cd.detectChanges();
    }
  }

  calculateResults() {
    let resultsData: { inputData: SSMTInputs, outputData: SSMTOutput };
    // if (this.selectedSSMT.resultsCalculated) {
    //   let inputData: SSMTInputs = this.calculateModelService.getInputDataFromSSMT(this.selectedSSMT);
    //   resultsData = {
    //     inputData: inputData,
    //     outputData: this.selectedSSMT.outputData
    //   };
    // } else {
    if (this.selectedSSMT.name == 'Baseline') {
      resultsData = this.calculateModelService.initDataAndRun(this.selectedSSMT, this.settings, true, false, 0);
    } else {
      resultsData = this.calculateModelService.initDataAndRun(this.selectedSSMT, this.settings, false, false, this.ssmt.outputData.operationsOutput.powerGenerationCost);
    }
    //  }
    this.inputData = resultsData.inputData;
    this.outputData = resultsData.outputData;
    this.dataCalculated = true;
    this.selectedTable = 'default';
  }

  calculateResultsWithMarginalCosts() {
    let resultsData: { inputData: SSMTInputs, outputData: SSMTOutput };
    if (this.selectedSSMT.name == 'Baseline') {
      resultsData = this.calculateModelService.initDataAndRun(this.selectedSSMT, this.settings, true, true, 0);
    } else {
      resultsData = this.calculateModelService.initDataAndRun(this.selectedSSMT, this.settings, false, true, this.ssmt.outputData.operationsOutput.powerGenerationCost);
    }
    this.inputData = resultsData.inputData;
    this.outputData = resultsData.outputData;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setHover(str: string) {
    this.hoveredEquipment = str;
  }

  selectTable(str: string) {
    this.selectedTable = str;
  }

  scaleUp() {
    this.scaleValue = this.scaleValue + 5;
  }

  scaleDown() {
    this.scaleValue = this.scaleValue - 5;
  }
}
