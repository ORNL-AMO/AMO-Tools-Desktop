import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { Subscription } from 'rxjs';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { Directory } from '../../shared/models/directory';
import { PrintOptions } from '../../shared/models/printing';
import { PrintOptionsMenuService } from '../../shared/print-options-menu/print-options-menu.service';
import { WaterAssessmentResultsService } from '../../water/water-assessment-results.service';
import { WaterAssessmentService } from '../../water/water-assessment.service';
import { Settings } from '../../shared/models/settings';
import { ProcessCoolingReportService } from './process-cooling-report.service';
import { ProcessCoolingService } from '../process-cooling.service';

@Component({
  selector: 'app-process-cooling-report',
  standalone: false,
  templateUrl: './process-cooling-report.component.html',
  styleUrl: './process-cooling-report.component.css'
})
export class ProcessCoolingReportComponent {
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
  currentTab: ProcessCoolingReportTab = 'executive-summary';
  reportContainerHeight: number;
  settings: Settings;
  showPrintMenu: boolean;
  showPrintMenuSub: Subscription;
  showPrintViewSub: Subscription;
  showPrintView: boolean;
  showPrintDiv: boolean;
  printOptions: PrintOptions;

  tabsCollapsed: boolean = true;
  systemTrueCostReportSubscription: Subscription;
  constructor(private settingsDbService: SettingsDbService, 
    private printOptionsMenuService: PrintOptionsMenuService, 
    private directoryDbService: DirectoryDbService,
    private processCoolingReportService: ProcessCoolingReportService,
    private processCoolingService: ProcessCoolingService) { }

  ngOnInit(): void {
    this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    this.createdDate = new Date();
    if (this.assessment) {
      this.assessmentDirectories = new Array();
      this.getDirectoryList(this.assessment.directoryId);

      // todo 6706 set up subs for graph/bar components
      // let systemTrueCostReport = this.waterAssessmentResultsService.getTrueCostOfSystemsReport(this.assessment, this.settings);
      // this.processCoolingReporService.systemTrueCostReport.next(systemTrueCostReport);
    }

    if (!this.inRollup) {
      this.showPrintMenuSub = this.printOptionsMenuService.showPrintMenu.subscribe(val => {
        this.showPrintMenu = val;
      });
    } else {
      this.processCoolingService.processCooling.next(this.assessment.processCooling);
      this.processCoolingService.settings.next(this.settings);
    }

    if (this.quickReport) {
      this.processCoolingService.processCooling.next(this.assessment.processCooling);
      this.processCoolingService.settings.next(this.settings);
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
    if (this.showPrintMenuSub) {
      this.showPrintMenuSub.unsubscribe();
    }
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

  setTab(str: ProcessCoolingReportTab) {
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
    this.printOptionsMenuService.printContext.next('water');
    this.printOptionsMenuService.showPrintMenu.next(true);
    this.collapseTabs();
  }

  collapseTabs() {
    this.tabsCollapsed = !this.tabsCollapsed;
  }
}

export type ProcessCoolingReportTab = "executive-summary" | "pump-summary" | "tower-summary" | "graphs";
