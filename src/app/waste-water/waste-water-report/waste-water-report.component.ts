import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { Assessment } from '../../shared/models/assessment';
import { Directory } from '../../shared/models/directory';
import { Settings } from '../../shared/models/settings';
import { WasteWaterAnalysisService } from '../waste-water-analysis/waste-water-analysis.service';
import { WasteWaterService } from '../waste-water.service';

@Component({
  selector: 'app-waste-water-report',
  templateUrl: './waste-water-report.component.html',
  styleUrls: ['./waste-water-report.component.css']
})
export class WasteWaterReportComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  inAssessment: boolean;
  @Input()
  containerHeight: number;


  @ViewChild('reportBtns', { static: false }) reportBtns: ElementRef;
  @ViewChild('reportHeader', { static: false }) reportHeader: ElementRef;

  createdDate: Date;
  assessmentDirectories: Directory[];
  currentTab: string = 'results';
  reportContainerHeight: number;
  settings: Settings;
  constructor(private directoryDbService: DirectoryDbService, private settingsDbService: SettingsDbService, private wasteWaterService: WasteWaterService,
    private wasteWaterAnalysisService: WasteWaterAnalysisService) { }

  ngOnInit(): void {
    this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    this.createdDate = new Date();
    if (this.assessment) {
      this.assessmentDirectories = new Array();
      this.getDirectoryList(this.assessment.directoryId);
    }
    this.assessment.wasteWater.baselineData.outputs = this.wasteWaterService.calculateResults(this.assessment.wasteWater.baselineData.activatedSludgeData, this.assessment.wasteWater.baselineData.aeratorPerformanceData, this.assessment.wasteWater.systemBasics, this.settings);
    this.assessment.wasteWater.modifications.forEach(mod => {
      mod.outputs = this.wasteWaterService.calculateResults(mod.activatedSludgeData, mod.aeratorPerformanceData, this.assessment.wasteWater.systemBasics, this.settings, this.assessment.wasteWater.baselineData.outputs);
    });
    this.wasteWaterAnalysisService.setResults(this.assessment.wasteWater, this.settings);
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

  getDirectoryList(id: number) {
    if (id && id !== 1) {
      let results = this.directoryDbService.getById(id);
      this.assessmentDirectories.push(results);
      if (results.parentDirectoryId !== 1) {
        this.getDirectoryList(results.parentDirectoryId);
      }
    }
  }

  setTab(str: string) {
    this.currentTab = str;
  }

  getContainerHeight() {
    let btnHeight: number = this.reportBtns.nativeElement.clientHeight;
    let headerHeight: number = this.reportHeader.nativeElement.clientHeight;
    this.reportContainerHeight = this.containerHeight - btnHeight - headerHeight - 25;
  }
}
