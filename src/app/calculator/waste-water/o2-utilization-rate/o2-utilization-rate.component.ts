import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { O2UtilizationDataPoints, O2UtilizationRateService } from './o2-utilization-rate.service';

@Component({
  selector: 'app-o2-utilization-rate',
  templateUrl: './o2-utilization-rate.component.html',
  styleUrls: ['./o2-utilization-rate.component.css']
})
export class O2UtilizationRateComponent implements OnInit {

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;


  tabSelect: string = 'help';

  constructor(private settingsDbService: SettingsDbService, private o2UtilizationRateService: O2UtilizationRateService) { }

  ngOnInit(): void {
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

}
