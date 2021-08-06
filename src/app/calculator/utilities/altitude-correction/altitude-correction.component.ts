import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { AltitudeCorrectionService } from './altitude-correction.service';

@Component({
  selector: 'app-altitude-correction',
  templateUrl: './altitude-correction.component.html',
  styleUrls: ['./altitude-correction.component.css']
})
export class AltitudeCorrectionComponent implements OnInit {
  @Input()
  settings: Settings;
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;  
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }


  containerHeight: number;
  tabSelect: string = 'help';
  headerHeight: number;

  altitudeCorrectionDataSub: Subscription;
  currentField: string;

  constructor(private settingsDbService: SettingsDbService, private altitudeCorrectionService: AltitudeCorrectionService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    this.altitudeCorrectionService.getDefaultData(this.settings);
    let existingInputs = this.altitudeCorrectionService.altitudeCorrectionInputs.getValue();
    if (!existingInputs) {
      this.altitudeCorrectionService.getDefaultData(this.settings);
      this.altitudeCorrectionService.getDefualtResults();
    }
    this.initSubscriptions();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  ngOnDestroy() {
    this.altitudeCorrectionDataSub.unsubscribe();
  }

  initSubscriptions() {
    this.altitudeCorrectionDataSub = this.altitudeCorrectionService.altitudeCorrectionInputs.subscribe(updatedInputs => {
      if (updatedInputs){
        this.calculate();
      }
    });
  }

  calculate() {
    this.altitudeCorrectionService.calculateBarometricPressure(this.settings);
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.headerHeight = this.leftPanelHeader.nativeElement.offsetHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  btnResetData() {
    this.altitudeCorrectionService.getDefaultData(this.settings);
    this.altitudeCorrectionService.resetData.next(true);
  }

  btnGenerateExample() {
    this.altitudeCorrectionService.getExampleData(this.settings);
    this.altitudeCorrectionService.generateExample.next(true);
   
  }

}
