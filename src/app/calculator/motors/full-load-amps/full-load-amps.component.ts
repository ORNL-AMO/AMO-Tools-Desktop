import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { FullLoadAmpsService } from './full-load-amps.service';

@Component({
  selector: 'app-full-load-amps',
  templateUrl: './full-load-amps.component.html',
  styleUrls: ['./full-load-amps.component.css']
})
export class FullLoadAmpsComponent implements OnInit {
  @Input()
  settings: Settings;
  flaInputSub: Subscription;

  // @Input()
  // inTreasureHunt: boolean;
  // @Input()
  // operatingHours: OperatingHours;
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild("contentContainer", { static: false }) contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  
  
  containerHeight: number;
  tabSelect: string = 'help';

  constructor(private settingsDbService: SettingsDbService, private fullLoadAmpsService: FullLoadAmpsService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.fullLoadAmpsService.initDefualtEmptyInputs(this.settings);

    let existingInputs = this.fullLoadAmpsService.fullLoadAmpsInputs.getValue();
    if(!existingInputs) {
      this.fullLoadAmpsService.initDefualtEmptyInputs(this.settings);
      this.fullLoadAmpsService.initDefualtEmptyOutputs();
    }
    this.initSubscriptions();
  }

  ngOnDestroy(){
    this.flaInputSub.unsubscribe();
  }

  initSubscriptions() {
    this.flaInputSub = this.fullLoadAmpsService.fullLoadAmpsInputs.subscribe(updatedInputs => {
      if (updatedInputs) {
        this.calculate();
      }
    })
  }

  calculate() {
    this.fullLoadAmpsService.estimateFullLoadAmps(this.settings);
  }

  
  btnResetData() {
    this.fullLoadAmpsService.initDefualtEmptyInputs(this.settings);
    this.fullLoadAmpsService.resetData.next(true);
  }

  btnGenerateExample() {
    this.fullLoadAmpsService.generateExampleData(this.settings);
    this.fullLoadAmpsService.generateExample.next(true);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
    }
  }

}
