import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';

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

  constructor(private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
  }


  resizeTabs() {
    if (this.leftPanelHeader) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  btnGenerateExample() {

  }

  btnResetData() {

  }

  setTab(str: string) {
    this.tabSelect = str;
  }

}
