import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SSMTInputs, SSMT } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { Directory } from '../../shared/models/directory';
import { SSMTOutput, SSMTLosses } from '../../shared/models/steam/steam-outputs';
import { CalculateLossesService } from '../calculate-losses.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { ModalDirective } from 'ngx-bootstrap';
import { SsmtReportService } from './ssmt-report.service';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { SsmtService } from '../ssmt.service';

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
  @Input()
  inRollup: boolean;
  @Input()
  printView: boolean;
  @Input()
  printExecutiveSummary: boolean;
  @Input()
  printEnergySummary: boolean;
  @Input()
  printLossesSummary: boolean;
  @Input()
  printReportDiagram: boolean;
  @Input()
  printInputData: boolean;
  @Input()
  printResults: boolean;
  @Input()
  printReportGraphs: boolean;
  @Input()
  printReportSankey: boolean;

  @ViewChild('printMenuModal', { static: false }) public printMenuModal: ModalDirective;
  @ViewChild('reportBtns', { static: false }) reportBtns: ElementRef;
  @ViewChild('reportHeader', { static: false }) reportHeader: ElementRef;
  reportContainerHeight: number;
  currentTab: string = 'executiveSummary';

  showPrint: boolean = false;
  showPrintMenu: boolean = false;
  showPrintDiv: boolean = false;
  selectAll: boolean = false;
  printGraphs = false;

  baselineOutput: SSMTOutput;
  baselineInputData: SSMTInputs;
  baselineLosses: SSMTLosses;
  modificationOutputs: Array<{ name: string, outputData: SSMTOutput }>;
  modificationInputData: Array<{ name: string, inputData: SSMTInputs }>;
  dataCalculated: boolean;
  modificationLosses: Array<{ name: string, outputData: SSMTLosses }>;
  tableCellWidth: number;
  assessmentDirectories: Directory[];

  constructor(private windowRefService: WindowRefService, private ssmtService: SsmtService, private calculateLossesService: CalculateLossesService, private directoryDbService: DirectoryDbService, private ssmtReportService: SsmtReportService) { }

  ngOnInit() {
    if (this.assessment.ssmt.setupDone) {
      setTimeout(() => {
        let resultData: { inputData: SSMTInputs, outputData: SSMTOutput } = this.ssmtService.calculateBaselineModel(this.assessment.ssmt, this.settings);
        this.assessment.ssmt.name = 'Baseline';
        resultData.outputData = this.calculateResultsWithMarginalCosts(this.assessment.ssmt, resultData.outputData);
        this.assessment.ssmt.outputData = resultData.outputData;
        this.baselineOutput = resultData.outputData;
        this.baselineInputData = resultData.inputData;
        this.baselineLosses = this.calculateLossesService.calculateLosses(this.baselineOutput, this.baselineInputData, this.settings, this.assessment.ssmt);
        this.modificationOutputs = new Array<{ name: string, outputData: SSMTOutput }>();
        this.modificationInputData = new Array<{ name: string, inputData: SSMTInputs }>();
        this.modificationLosses = new Array<{ name: string, outputData: SSMTLosses }>();
        if (this.assessment.ssmt.modifications) {
          this.assessment.ssmt.modifications.forEach(modification => {
            let resultData: { inputData: SSMTInputs, outputData: SSMTOutput } = this.ssmtService.calculateModificationModel(modification.ssmt, this.settings, this.baselineOutput);
            resultData.outputData = this.calculateResultsWithMarginalCosts(modification.ssmt, resultData.outputData, this.baselineOutput);
            modification.ssmt.outputData = resultData.outputData;
            this.modificationOutputs.push({ name: modification.ssmt.name, outputData: resultData.outputData });
            this.modificationInputData.push({ name: modification.ssmt.name, inputData: resultData.inputData });
            let modLosses: SSMTLosses = this.calculateLossesService.calculateLosses(resultData.outputData, resultData.inputData, this.settings, modification.ssmt);
            this.modificationLosses.push({ outputData: modLosses, name: modification.ssmt.name });
          });
        }
        this.getTableCellWidth();
        this.dataCalculated = true;
        if (this.printView) {
        }
      }, 10);
    } else {
      this.dataCalculated = true;
      if (this.printView) {
      }
    }
    if (this.assessment) {
      this.assessmentDirectories = new Array();
      this.getDirectoryList(this.assessment.directoryId);
    }

    if (this.inRollup) {
      this.showPrint = this.printView;
    }
    else {
      // subscribe to print event
      this.ssmtReportService.showPrint.subscribe(printVal => {
        // shows loading print view
        this.showPrintDiv = printVal;
        if (printVal === true) {
          // use delay to show loading before print payload starts
          setTimeout(() => {
            this.showPrint = printVal;
          }, 20);
        } else {
          this.showPrint = printVal;
        }
      });
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
    }, 100);
  }

  getContainerHeight() {
    if (this.assessment.ssmt.setupDone) {
      let btnHeight: number = this.reportBtns.nativeElement.clientHeight;
      let headerHeight: number = this.reportHeader.nativeElement.clientHeight;
      this.reportContainerHeight = this.containerHeight - btnHeight - headerHeight - 25;
    }
  }

  setTab(str: string) {
    this.currentTab = str;
  }

  getTableCellWidth() {
    this.tableCellWidth = 85 / (this.modificationOutputs.length + 1);
  }
  getDirectoryList(id: number) {
    if (id && id !== 1) {
      let results = this.directoryDbService.getById(id);
      this.assessmentDirectories.push(results);
      if (results.parentDirectoryId !== 1) {
        this.getDirectoryList(results.parentDirectoryId);
      }
    }
  }

  // print functions
  initPrintLogic() {
    if (!this.inRollup) {
      this.selectAll = false;
      this.printReportGraphs = false;
      this.printReportSankey = false;
      this.printResults = false;
      this.printInputData = false;
      this.printLossesSummary = false;
      this.printExecutiveSummary = false;
      this.printEnergySummary = false;
      this.printReportDiagram = false;
    }
  }

  resetPrintSelection() {
    this.selectAll = false;
    this.printReportGraphs = false;
    this.printReportSankey = false;
    this.printResults = false;
    this.printInputData = false;
    this.printExecutiveSummary = false;
    this.printEnergySummary = false;
    this.printLossesSummary = false;
    this.printReportDiagram = false;
  }

  showModal(): void {
    this.showPrintMenu = true;
  }

  closeModal(reset: boolean): void {
    if (reset) {
      this.resetPrintSelection();
    }
    this.showPrintMenu = false;
  }

  togglePrint(section: string): void {
    switch (section) {
      case "selectAll": {
        this.selectAll = !this.selectAll;
        if (this.selectAll) {
          this.printReportGraphs = true;
          this.printReportSankey = true;
          this.printResults = true;
          this.printExecutiveSummary = true;
          this.printEnergySummary = true;
          this.printLossesSummary = true;
          this.printReportDiagram = true;
        }
        else {
          this.printReportGraphs = false;
          this.printReportSankey = false;
          this.printResults = false;
          this.printExecutiveSummary = false;
          this.printEnergySummary = false;
          this.printLossesSummary = false;
          this.printReportDiagram = false;
        }
        break;
      }
      case "executiveSummary": {
        this.printExecutiveSummary = !this.printExecutiveSummary
        break;
      }
      case "energySummary": {
        this.printEnergySummary = !this.printEnergySummary;
        break;
      }
      case "lossesSummary": {
        this.printLossesSummary = !this.printLossesSummary;
        break;
      }
      case "reportDiagram": {
        this.printReportDiagram = !this.printReportDiagram;
        break;
      }
      case "reportGraphs": {
        this.printReportGraphs = !this.printReportGraphs;
        break;
      }
      case "reportSankey": {
        this.printReportSankey = !this.printReportSankey;
        break;
      }
      case "results": {
        this.printResults = !this.printResults;
        break;
      }
      case "inputData": {
        this.printInputData = !this.printInputData;
        break;
      }
      default: {
        break;
      }
    }
  }

  print(): void {
    this.closeModal(false);
    this.ssmtReportService.showPrint.next(true);
    setTimeout(() => {
      let win = this.windowRefService.nativeWindow;
      win.print();
      //after printing hide content again
      this.ssmtReportService.showPrint.next(false);
      this.resetPrintSelection();
    }, 2000);
  }

  calculateResultsWithMarginalCosts(ssmt: SSMT, outputData: SSMTOutput, baselineResults?: SSMTOutput): SSMTOutput {
    let marginalCosts: { marginalHPCost: number, marginalMPCost: number, marginalLPCost: number };
    if (ssmt.name == 'Baseline') {
      marginalCosts = this.ssmtService.calculateBaselineMarginalCosts(ssmt, outputData, this.settings);
    } else {
      marginalCosts = this.ssmtService.calculateModificationMarginalCosts(ssmt, outputData, baselineResults, this.settings);
    }
    outputData.marginalHPCost = marginalCosts.marginalHPCost;
    outputData.marginalMPCost = marginalCosts.marginalMPCost;
    outputData.marginalLPCost = marginalCosts.marginalLPCost;
    return outputData;
  }


}
