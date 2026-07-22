import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SSMTInputs, SSMT, SsmtValid } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { Directory } from '../../shared/models/directory';
import { SSMTOutput, SSMTLosses } from '../../shared/models/steam/steam-outputs';
import { CalculateLossesService } from '../calculate-losses.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SsmtService } from '../ssmt.service';
import { Observable } from 'rxjs';
import { ReportDocument, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';
import { SsmtReportAdapter, SSMT_SECTION_GROUPS } from './ssmt-report.adapter';

@Component({
  selector: 'app-ssmt-report',
  templateUrl: './ssmt-report.component.html',
  styleUrls: ['./ssmt-report.component.css'],
  standalone: false
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
  baselineOutput: SSMTOutput;
  baselineInputData: SSMTInputs;
  baselineLosses: SSMTLosses;
  modificationOutputs: Array<{ name: string, outputData: SSMTOutput, valid: SsmtValid }>;
  modificationInputData: Array<{ name: string, inputData: SSMTInputs, valid: SsmtValid }>;
  dataCalculated: boolean;
  modificationLosses: Array<{ name: string, outputData: SSMTLosses, valid: SsmtValid }>;
  tableCellWidth: number;
  assessmentDirectories: Directory[];
  tabsCollapsed: boolean = true;

  reportDocument$: Observable<ReportDocument>;
  readonly sectionGroups: ReportSectionGroup[] = SSMT_SECTION_GROUPS;

  constructor(private ssmtService: SsmtService, private calculateLossesService: CalculateLossesService,
    private directoryDbService: DirectoryDbService, private reportAdapter: SsmtReportAdapter) { }

  ngOnInit() {
    if (this.assessment.ssmt.setupDone) {
      setTimeout(() => {
        this.assessment.ssmt.valid = this.ssmtService.checkValid(this.assessment.ssmt, this.settings);
        let resultData: { inputData: SSMTInputs, outputData: SSMTOutput } = this.ssmtService.calculateBaselineModel(this.assessment.ssmt, this.settings);
        this.assessment.ssmt.name = 'Baseline';
        if (!resultData.outputData.hasSteamModelerError) {
          resultData.outputData = this.calculateResultsWithMarginalCosts(this.assessment.ssmt, resultData.outputData);
          this.assessment.ssmt.outputData = resultData.outputData;
          this.baselineOutput = resultData.outputData;
          this.baselineInputData = resultData.inputData;
          this.baselineLosses = this.calculateLossesService.calculateLosses(this.baselineOutput, this.baselineInputData, this.settings, this.assessment.ssmt);
          this.modificationOutputs = new Array<{ name: string, outputData: SSMTOutput, valid: SsmtValid }>();
          this.modificationInputData = new Array<{ name: string, inputData: SSMTInputs, valid: SsmtValid }>();
          this.modificationLosses = new Array<{ name: string, outputData: SSMTLosses, valid: SsmtValid }>();
          if (this.assessment.ssmt.modifications) {
            this.assessment.ssmt.modifications.forEach(modification => {
              modification.ssmt.valid = this.ssmtService.checkValid(modification.ssmt, this.settings);
              let resultData: { inputData: SSMTInputs, outputData: SSMTOutput } = this.ssmtService.calculateModificationModel(modification.ssmt, this.settings, this.baselineOutput);
              if (modification.ssmt.valid.isValid) {
                resultData.outputData = this.calculateResultsWithMarginalCosts(modification.ssmt, resultData.outputData, this.baselineOutput);
                modification.ssmt.outputData = resultData.outputData;
                this.modificationOutputs.push({ name: modification.ssmt.name, outputData: resultData.outputData, valid: modification.ssmt.valid });
                this.modificationInputData.push({ name: modification.ssmt.name, inputData: resultData.inputData, valid: modification.ssmt.valid });
                let modLosses: SSMTLosses = this.calculateLossesService.calculateLosses(resultData.outputData, resultData.inputData, this.settings, modification.ssmt);
                this.modificationLosses.push({ outputData: modLosses, name: modification.ssmt.name, valid: modification.ssmt.valid });
              } else {
                this.modificationOutputs.push({ name: modification.ssmt.name, outputData: undefined, valid: modification.ssmt.valid });
                this.modificationInputData.push({ name: modification.ssmt.name, inputData: resultData.inputData, valid: modification.ssmt.valid });
                this.modificationLosses.push({ outputData: undefined, name: modification.ssmt.name, valid: modification.ssmt.valid });
              }
            });
          }
          this.getTableCellWidth();
          this.dataCalculated = true;
        }
      }, 10);
    } else {
      this.dataCalculated = true;
    }
    if (this.assessment) {
      this.assessmentDirectories = new Array();
      this.getDirectoryList(this.assessment.directoryId);
    }

    this.reportDocument$ = this.reportAdapter.buildDocument(this.assessment);
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
      this.reportContainerHeight = this.containerHeight - btnHeight - headerHeight - 2;
    }
  }

  setTab(str: string) {
    this.currentTab = str;
    this.collapseTabs();
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

  collapseTabs() {
    this.tabsCollapsed = !this.tabsCollapsed;
  }
}
