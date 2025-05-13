import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { Assessment } from '../../shared/models/assessment';
import { Directory } from '../../shared/models/directory';
import { PrintOptions } from '../../shared/models/printing';
import { PrintOptionsMenuService } from '../../shared/print-options-menu/print-options-menu.service';
import { Settings } from '../../shared/models/settings';
import { WaterAssessmentService } from '../water-assessment.service';

@Component({
  selector: 'app-water-report',
  standalone: false,
  templateUrl: './water-report.component.html',
  styleUrl: './water-report.component.css'
})
export class WaterReportComponent {
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
  currentTab: WaterReportTab = 'executiveSummary';
  reportContainerHeight: number;
  settings: Settings;
  showPrintMenu: boolean;
  showPrintMenuSub: Subscription;
  showPrintViewSub: Subscription;
  showPrintView: boolean;
  showPrintDiv: boolean;
  printOptions: PrintOptions;

  // assessmentResults: WaterResults;
  tabsCollapsed: boolean = true;
  constructor(private settingsDbService: SettingsDbService, 
    private printOptionsMenuService: PrintOptionsMenuService, 
    private directoryDbService: DirectoryDbService,
    private waterAssessmentService: WaterAssessmentService) { }

  ngOnInit(): void {
    this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    this.createdDate = new Date();
    if (this.assessment) {
      this.assessmentDirectories = new Array();
      this.getDirectoryList(this.assessment.directoryId);
      // this.assessmentResults = new Array();
    }

    if (!this.inRollup) {
      this.showPrintMenuSub = this.printOptionsMenuService.showPrintMenu.subscribe(val => {
        this.showPrintMenu = val;
      });
    } else {
      this.waterAssessmentService.waterAssessment.next(this.assessment.water);
      this.waterAssessmentService.settings.next(this.settings);
    }

    if (this.quickReport) {
      this.waterAssessmentService.waterAssessment.next(this.assessment.water);
      this.waterAssessmentService.settings.next(this.settings);
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

  setTab(str: WaterReportTab) {
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

export type WaterReportTab = "executiveSummary" | "systemSummary" | "systemTrueCost"