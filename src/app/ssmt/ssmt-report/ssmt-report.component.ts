import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SSMTInputs, SSMT } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { Directory } from '../../shared/models/directory';
import { SSMTOutput, SSMTLosses } from '../../shared/models/steam/steam-outputs';
import { CalculateLossesService } from '../calculate-losses.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SsmtService } from '../ssmt.service';
import { Subscription } from 'rxjs';
import { PrintOptionsMenuService } from '../../shared/print-options-menu/print-options-menu.service';
import { PrintOptions } from '../../shared/models/printing';

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

  @ViewChild('reportBtns', { static: false }) reportBtns: ElementRef;
  @ViewChild('reportHeader', { static: false }) reportHeader: ElementRef;
  reportContainerHeight: number;
  currentTab: string = 'executiveSummary';

  showPrintView: boolean = false;
  showPrintViewSub: Subscription;
  showPrintMenu: boolean = false;
  showPrintMenuSub: Subscription;
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
  printOptions: PrintOptions;
  constructor(private ssmtService: SsmtService, private calculateLossesService: CalculateLossesService, private directoryDbService: DirectoryDbService, private printOptionsMenuService: PrintOptionsMenuService) { }

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
      }, 10);
    } else {
      this.dataCalculated = true;
    }
    if (this.assessment) {
      this.assessmentDirectories = new Array();
      this.getDirectoryList(this.assessment.directoryId);
    }

    if (!this.inRollup) {
      this.showPrintMenuSub = this.printOptionsMenuService.showPrintMenu.subscribe(val => {
        this.showPrintMenu = val;
      });
    }

    this.showPrintViewSub = this.printOptionsMenuService.showPrintView.subscribe(val => {
      this.printOptions = this.printOptionsMenuService.printOptions.getValue();
      this.showPrintDiv = val;
      if (val == true) {
        //use delay to show loading before print payload starts
        setTimeout(() => {
          this.showPrintView = val;
        }, 20)
      } else {
        this.showPrintView = val;
      }
    })
 
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

  ngOnDestroy() {
    if(this.showPrintMenuSub){
            this.showPrintMenuSub.unsubscribe();
    }
    this.showPrintViewSub.unsubscribe();
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

  print() {
    this.printOptionsMenuService.printContext.next('ssmt');
    this.printOptionsMenuService.showPrintMenu.next(true);
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
