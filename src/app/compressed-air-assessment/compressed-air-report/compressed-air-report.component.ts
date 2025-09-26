import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { Assessment } from '../../shared/models/assessment';
import { CompressedAirDayType, Modification, ProfileSummary, ProfileSummaryTotal } from '../../shared/models/compressed-air-assessment';
import { Directory } from '../../shared/models/directory';
import { PrintOptions } from '../../shared/models/printing';
import { Settings } from '../../shared/models/settings';
import { PrintOptionsMenuService } from '../../shared/print-options-menu/print-options-menu.service';
import { CompressedAirAssessmentResultsService } from '../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { CompressedAirModificationValid, ExploreOpportunitiesValidationService } from '../explore-opportunities/explore-opportunities-validation.service';
import { CompressedAirAssessmentBaselineResults } from '../calculations/CompressedAirAssessmentBaselineResults';
import { CompressedAirCalculationService } from '../compressed-air-calculation.service';
import { AssessmentCo2SavingsService } from '../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { BaselineResults, CompressedAirAssessmentResult, DayTypeModificationResult } from '../calculations/caCalculationModels';
import { CompressedAirAssessmentModificationResults } from '../calculations/modifications/CompressedAirAssessmentModificationResults';

@Component({
  selector: 'app-compressed-air-report',
  templateUrl: './compressed-air-report.component.html',
  styleUrls: ['./compressed-air-report.component.css'],
  standalone: false
})
export class CompressedAirReportComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  inAssessment: boolean;
  @Input()
  containerHeight: number;
  @Input()
  inRollup: boolean;
  @Input()
  quickReport: boolean;

  @ViewChild('reportBtns', { static: false }) reportBtns: ElementRef;
  @ViewChild('reportHeader', { static: false }) reportHeader: ElementRef;

  createdDate: Date;
  assessmentDirectories: Directory[];
  currentTab: "executiveSummary" | "systemProfiles" | "reportGraphs" | "reportSankey" | "inputData" | "facilityInfo" | "paybackPeriod" = 'executiveSummary';
  reportContainerHeight: number;
  settings: Settings;
  showPrintMenu: boolean;
  showPrintMenuSub: Subscription;
  showPrintViewSub: Subscription;
  showPrintView: boolean;
  showPrintDiv: boolean;
  printOptions: PrintOptions;

  baselineResults: BaselineResults;
  assessmentResults: Array<CompressedAirAssessmentModificationResults>;
  combinedDayTypeResults: Array<{ modification: Modification, combinedResults: DayTypeModificationResult, validation: CompressedAirModificationValid }>;
  baselineProfileSummaries: Array<{ profileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, profileSummaryTotals: Array<ProfileSummaryTotal> }>;
  tabsCollapsed: boolean = true;

  compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults;
  constructor(private settingsDbService: SettingsDbService, private printOptionsMenuService: PrintOptionsMenuService, private directoryDbService: DirectoryDbService,
    private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService, private exploreOpportunitiesValidationService: ExploreOpportunitiesValidationService,
    private compressedAirAssessmentService: CompressedAirAssessmentService,
    private compressedAirCalculationService: CompressedAirCalculationService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService) { }

  ngOnInit(): void {
    this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    this.createdDate = new Date();
    if (this.assessment) {
      this.assessmentDirectories = new Array();
      this.getDirectoryList(this.assessment.directoryId);
      this.compressedAirAssessmentBaselineResults = new CompressedAirAssessmentBaselineResults(this.assessment.compressedAirAssessment, this.settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService);
      this.baselineResults = this.compressedAirAssessmentBaselineResults.baselineResults;
      this.assessmentResults = new Array();
      this.combinedDayTypeResults = new Array();
      this.baselineProfileSummaries = this.compressedAirAssessmentBaselineResults.baselineDayTypeProfileSummaries;

      this.assessment.compressedAirAssessment.modifications.forEach(modification => {
        let compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults = new CompressedAirAssessmentModificationResults(this.assessment.compressedAirAssessment, modification, this.settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService, this.compressedAirAssessmentBaselineResults);
        this.assessmentResults.push(compressedAirAssessmentModificationResults);
        let compressedAirAssessmentResult: CompressedAirAssessmentResult = compressedAirAssessmentModificationResults.getModificationResults()
        let validation: CompressedAirModificationValid = this.exploreOpportunitiesValidationService.checkModificationValid(modification, this.baselineResults, this.baselineProfileSummaries, this.assessment.compressedAirAssessment, this.settings, compressedAirAssessmentResult)
        this.combinedDayTypeResults.push({
          modification: modification,
          combinedResults: this.compressedAirAssessmentResultsService.combineDayTypeResults(compressedAirAssessmentResult, this.baselineResults),
          validation: validation
        });
      });
    }

    if (!this.inRollup) {
      this.showPrintMenuSub = this.printOptionsMenuService.showPrintMenu.subscribe(val => {
        this.showPrintMenu = val;
      });
    } else {
      this.compressedAirAssessmentService.compressedAirAssessment.next(this.assessment.compressedAirAssessment);
      this.compressedAirAssessmentService.settings.next(this.settings);
    }

    if (this.quickReport) {
      this.compressedAirAssessmentService.compressedAirAssessment.next(this.assessment.compressedAirAssessment);
      this.compressedAirAssessmentService.settings.next(this.settings);
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
    });
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
    if (this.showPrintMenuSub) this.showPrintMenuSub.unsubscribe();
    this.showPrintViewSub.unsubscribe();
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

  setTab(str: "executiveSummary" | "systemProfiles" | "reportGraphs" | "reportSankey" | "inputData" | "facilityInfo" | "paybackPeriod") {
    this.currentTab = str;
    this.collapseTabs();
  }

  getContainerHeight() {
    if (this.reportBtns) {
      let btnHeight: number = this.reportBtns.nativeElement.clientHeight;
      let headerHeight: number = this.reportHeader.nativeElement.clientHeight;
      this.reportContainerHeight = this.containerHeight - btnHeight - headerHeight - 2;
    }
  }

  print() {
    this.printOptionsMenuService.printContext.next('compressedAir');
    this.printOptionsMenuService.showPrintMenu.next(true);
    this.collapseTabs();
  }

  collapseTabs() {
    this.tabsCollapsed = !this.tabsCollapsed;
  }
}
