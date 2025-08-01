import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { PrintOptions } from '../../shared/models/printing';
import { Directory } from '../../shared/models/directory';
import { REPORT_VIEW_LINKS } from '../services/process-cooling-ui.service';

@Component({
  selector: 'app-report',
  standalone: false,
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent {
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
  reportContainerHeight: number;
  settings: Settings;
  showPrintMenu: boolean;
  // showPrintMenuSub: Subscription;
  // showPrintViewSub: Subscription;
  showPrintView: boolean;
  showPrintDiv: boolean;
  printOptions: PrintOptions;

  tabsCollapsed: boolean = true;

  REPORT_VIEW_LINKS = REPORT_VIEW_LINKS;
  constructor(
    // private settingsDbService: SettingsDbService, 
    // private printOptionsMenuService: PrintOptionsMenuService, 
    // private directoryDbService: DirectoryDbService,
    // private processCoolingReportService: ProcessCoolingReportService,
    // private processCoolingAssessmentService: ProcessCoolingAssessmentService
  ) { }

  ngOnInit(): void {
    // this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    this.createdDate = new Date();
    if (this.assessment) {
      this.assessmentDirectories = new Array();
      // this.getDirectoryList(this.assessment.directoryId);

      // todo 6706 set up subs for graph/bar components
      // let systemTrueCostReport = this.waterAssessmentResultsService.getTrueCostOfSystemsReport(this.assessment, this.settings);
      // this.processCoolingReporService.systemTrueCostReport.next(systemTrueCostReport);
    }

    // if (!this.inRollup) {
    //   this.showPrintMenuSub = this.printOptionsMenuService.showPrintMenu.subscribe(val => {
    //     this.showPrintMenu = val;
    //   });
    // } else {
    //   this.processCoolingAssessmentService.processCooling.next(this.assessment.processCooling);
    //   this.processCoolingAssessmentService.settings.next(this.settings);
    // }

    // if (this.quickReport) {
    //   this.processCoolingAssessmentService.processCooling.next(this.assessment.processCooling);
    //   this.processCoolingAssessmentService.settings.next(this.settings);
    // }

    // this.showPrintViewSub = this.printOptionsMenuService.showPrintView.subscribe(val => {
    //   this.printOptions = this.printOptionsMenuService.printOptions.getValue();
    //   this.showPrintDiv = val;
    //   if (val == true) {
    //     //use delay to show loading before print payload starts
    //     setTimeout(() => {
    //       this.showPrintView = val;
    //     }, 20)
    //   } else {
    //     this.showPrintView = val;
    //   }
    // });
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes.containerHeight && !changes.containerHeight.firstChange) {
  //     this.getContainerHeight();
  //   }
  // }

  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     this.getContainerHeight();
  //   }, 100);
  // }

  // ngOnDestroy() {
  //   if (this.showPrintMenuSub) {
  //     this.showPrintMenuSub.unsubscribe();
  //   }
  //   this.showPrintViewSub.unsubscribe();
  // }

  // getDirectoryList(id: number) {
  //   if (id && id !== 1) {
  //     let results = this.directoryDbService.getById(id);
  //     this.assessmentDirectories.push(results);
  //     if (results.parentDirectoryId !== 1) {
  //       this.getDirectoryList(results.parentDirectoryId);
  //     }
  //   }
  // }

  // setTab(str: ProcessCoolingReportTab) {
  //   this.currentTab = str;
  //   this.collapseTabs();
  // }

  // getContainerHeight() {
  //   if (this.reportBtns) {
  //     let btnHeight: number = this.reportBtns.nativeElement.clientHeight;
  //     let headerHeight: number = this.reportHeader.nativeElement.clientHeight;
  //     this.reportContainerHeight = this.containerHeight - btnHeight - headerHeight - 2;
  //   }
  // }

  print() {
    // this.printOptionsMenuService.printContext.next('water');
    // this.printOptionsMenuService.showPrintMenu.next(true);
    // this.collapseTabs();
  }

  collapseTabs() {
    this.tabsCollapsed = !this.tabsCollapsed;
  }
}

