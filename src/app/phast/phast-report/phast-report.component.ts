import { Component, OnInit, Input, ViewChild, TemplateRef, ElementRef, SimpleChanges } from '@angular/core';
import { PHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { Directory } from '../../shared/models/directory';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { SettingsService } from '../../settings/settings.service';
import { PhastReportService } from './phast-report.service';
import { ModalDirective } from 'ngx-bootstrap';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { PrintOptions } from '../../shared/models/printing';
import { PrintOptionsMenuService } from '../../shared/print-options-menu/print-options-menu.service';

@Component({
  selector: 'app-phast-report',
  templateUrl: './phast-report.component.html',
  styleUrls: ['./phast-report.component.css']
})
export class PhastReportComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;
  @Input()
  inPhast: boolean;
  @Input()
  assessment: Assessment;
  @Input()
  inRollup: boolean;
  @Input()
  quickReport: boolean;
  @Input()
  containerHeight: number;

  @ViewChild('reportTemplate', { static: false }) reportTemplate: TemplateRef<any>;
  @ViewChild('reportBtns', { static: false }) reportBtns: ElementRef;
  @ViewChild('reportHeader', { static: false }) reportHeader: ElementRef;

  currentTab: string = 'energy-used';
  assessmentDirectories: Array<Directory>;
  createdDate: Date;
  showPrintView: boolean = false;
  showPrintMenu: boolean = false;
  showPrintDiv: boolean = false;

  selectAll: boolean = false;
  reportContainerHeight: number;
  showPrintMenuSub: Subscription;
  printOptions: PrintOptions;
  showPrintViewSub: Subscription;
  constructor(private settingsDbService: SettingsDbService, private directoryDbService: DirectoryDbService, private printOptionsMenuService: PrintOptionsMenuService, private settingsService: SettingsService) { }

  ngOnInit() {
    // this.initPrintLogic();
    this.createdDate = new Date();
    if (this.settings) {
      if (!this.settings.energyResultUnit) {
        this.settings = this.settingsService.setEnergyResultUnitSetting(this.settings);
      }
    }
    if (this.assessment.phast && this.settings && !this.phast) {
      this.phast = this.assessment.phast;
    } else if (this.assessment.phast && !this.settings) {
      this.getSettings();
    }

    if (this.assessment) {
      this.assessmentDirectories = new Array<Directory>();
      this.getDirectoryList(this.assessment.directoryId);
    }
    if (!this.inPhast) {
      this.currentTab = 'executive-summary';
    }

    if (!this.phast.operatingHours.hoursPerYear) {
      this.phast.operatingHours.hoursPerYear = 8760;
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




    // if (this.inRollup) {
    //   this.showPrint = this.printView;
    // }
    // else {
    //   //subscribe to print event
    //   this.phastReportService.showPrint.subscribe(printVal => {
    //     //shows loading print view
    //     this.showPrintDiv = printVal;
    //     if (printVal === true) {
    //       //use delay to show loading before print payload starts
    //       setTimeout(() => {
    //         this.showPrint = printVal;
    //       }, 20);
    //     } else {
    //       this.showPrint = printVal;
    //     }
    //   });
    // }

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
    let btnHeight: number = this.reportBtns.nativeElement.clientHeight;
    let headerHeight: number = this.reportHeader.nativeElement.clientHeight;
    this.reportContainerHeight = this.containerHeight - btnHeight - headerHeight - 25;
  }

  setTab(str: string): void {
    this.currentTab = str;
    setTimeout(() => {
      d3.selectAll('.tick text').style('display', 'initial');
    }, 50);
  }


  getSettings(): void {
    let tmpSettings: Settings = this.settingsDbService.getByAssessmentId(this.assessment);
    if (tmpSettings) {
      if (!tmpSettings.energyResultUnit) {
        tmpSettings = this.settingsService.setEnergyResultUnitSetting(tmpSettings);
      }
      this.settings = tmpSettings;
    } else {
      this.getParentDirectorySettings(this.assessment.directoryId);
    }
  }


  getParentDirectorySettings(dirId: number): void {
    let tmpSettings: Settings = this.settingsDbService.getByDirectoryId(dirId);
    if (tmpSettings) {
      if (!tmpSettings.energyResultUnit) {
        tmpSettings = this.settingsService.setEnergyResultUnitSetting(tmpSettings);
      }
      this.settings = tmpSettings;
    } else {
      let parentDirectory = this.directoryDbService.getById(dirId);
      //get parent directory settings
      this.getParentDirectorySettings(parentDirectory.parentDirectoryId);
    }
  }

  getDirectoryList(id: number): void {
    if (id && id !== 1) {
      let tmpDir: Directory = this.directoryDbService.getById(id);
      if (tmpDir) {
        this.assessmentDirectories.push(tmpDir);
        if (tmpDir.parentDirectoryId !== 1) {
          this.getDirectoryList(tmpDir.parentDirectoryId);
        }
      }
    }
  }

  print() {
    this.printOptionsMenuService.printContext.next('phast');
    this.printOptionsMenuService.showPrintMenu.next(true);
  }
}
