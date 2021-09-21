import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { Assessment } from '../../shared/models/assessment';
import { Modification } from '../../shared/models/compressed-air-assessment';
import { Directory } from '../../shared/models/directory';
import { PrintOptions } from '../../shared/models/printing';
import { Settings } from '../../shared/models/settings';
import { PrintOptionsMenuService } from '../../shared/print-options-menu/print-options-menu.service';
import { CompressedAirAssessmentResult, CompressedAirAssessmentResultsService, BaselineResults, DayTypeModificationResult } from '../compressed-air-assessment-results.service';

@Component({
  selector: 'app-compressed-air-report',
  templateUrl: './compressed-air-report.component.html',
  styleUrls: ['./compressed-air-report.component.css']
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
  currentTab: "executiveSummary" | "systemProfiles" | "reportGraphs" | "inputData" | "facilityInfo" = 'executiveSummary';
  reportContainerHeight: number;
  settings: Settings;
  showPrintMenu: boolean;
  showPrintMenuSub: Subscription;
  showPrintViewSub: Subscription;
  showPrintView: boolean;
  showPrintDiv: boolean;
  printOptions: PrintOptions;

  baselineResults: BaselineResults;
  assessmentResults: Array<CompressedAirAssessmentResult>;
  combinedDayTypeResults: Array<{modification: Modification, combinedResults: DayTypeModificationResult}>;
  constructor(private settingsDbService: SettingsDbService, private printOptionsMenuService: PrintOptionsMenuService, private directoryDbService: DirectoryDbService,
    private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) { }

  ngOnInit(): void {
    this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    this.createdDate = new Date();
    if (this.assessment) {
      this.assessmentDirectories = new Array();
      this.getDirectoryList(this.assessment.directoryId);
      this.baselineResults = this.compressedAirAssessmentResultsService.calculateBaselineResults(this.assessment.compressedAirAssessment);
      this.assessmentResults = new Array();
      this.combinedDayTypeResults = new Array();
      this.assessment.compressedAirAssessment.modifications.forEach(modification => {
          let modificationResults: CompressedAirAssessmentResult = this.compressedAirAssessmentResultsService.calculateModificationResults(this.assessment.compressedAirAssessment, modification);
          this.assessmentResults.push(modificationResults);
          this.combinedDayTypeResults.push({
            modification: modification,
            combinedResults: this.compressedAirAssessmentResultsService.combineDayTypeResults(modificationResults)
          })
      })
      
    }

    // if (this.assessment.wasteWater.setupDone) {
    //   // this.assessment.wasteWater.baselineData.outputs = this.wasteWaterService.calculateResults(this.assessment.wasteWater.baselineData.activatedSludgeData, this.assessment.wasteWater.baselineData.aeratorPerformanceData, this.assessment.wasteWater.systemBasics, this.settings, true);
    //   // this.assessment.wasteWater.modifications.forEach(mod => {
    //   //   mod.outputs = this.wasteWaterService.calculateResults(mod.activatedSludgeData, mod.aeratorPerformanceData, this.assessment.wasteWater.systemBasics, this.settings, true, this.assessment.wasteWater.baselineData.outputs);
    //   // });
    //   // this.wasteWaterAnalysisService.setResults(this.assessment.wasteWater, this.settings);
    // }
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

  setTab(str: "executiveSummary" | "systemProfiles" | "reportGraphs" | "inputData" | "facilityInfo") {
    this.currentTab = str;
  }

  getContainerHeight() {
    if (this.reportBtns) {
      let btnHeight: number = this.reportBtns.nativeElement.clientHeight;
      let headerHeight: number = this.reportHeader.nativeElement.clientHeight;
      this.reportContainerHeight = this.containerHeight - btnHeight - headerHeight - 25;
    }
  }

  print() {
    this.printOptionsMenuService.printContext.next('wasteWater');
    this.printOptionsMenuService.showPrintMenu.next(true);
  }
}
