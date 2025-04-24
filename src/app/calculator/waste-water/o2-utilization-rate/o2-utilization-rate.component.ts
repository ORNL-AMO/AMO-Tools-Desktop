import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { O2UtilizationDataPoints, O2UtilizationRateService } from './o2-utilization-rate.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
    selector: 'app-o2-utilization-rate',
    templateUrl: './o2-utilization-rate.component.html',
    styleUrls: ['./o2-utilization-rate.component.css'],
    standalone: false
})
export class O2UtilizationRateComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  settings: Settings;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  headerHeight: number;
  smallScreenTab: string = 'form';
  containerHeight: number;

  tabSelect: string = 'help';

  constructor(private settingsDbService: SettingsDbService, 
    private o2UtilizationRateService: O2UtilizationRateService,
    private analyticsService: AnalyticsService) { }

  ngOnInit(): void {
    this.analyticsService.sendEvent('calculator-WW-o2-utilization-rate');
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100)
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  btnGenerateExample() {
    let exampleData: Array<O2UtilizationDataPoints> = this.o2UtilizationRateService.getExampleData();
    this.o2UtilizationRateService.inputDataPoints.next(exampleData);
  }

  btnResetData() {
    let initialData: Array<O2UtilizationDataPoints> = this.o2UtilizationRateService.getInitialDataPoints();
    this.o2UtilizationRateService.inputDataPoints.next(initialData);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

}
