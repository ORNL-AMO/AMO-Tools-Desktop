import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { WallLoss, WallLossOutput } from '../../../shared/models/phast/losses/wallLoss';
import { Settings } from '../../../shared/models/settings';
import { WallService } from './wall.service';

@Component({
  selector: 'app-wall',
  templateUrl: './wall.component.html',
  styleUrls: ['./wall.component.css']
})
export class WallComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  containerHeight: number;
  isModalOpen: boolean;
  modalSubscription: Subscription;

  baselineData: WallLoss;
  modificationData: WallLoss;
  baselineDataSub: Subscription;
  modificationDataSub: Subscription;
  outputSubscription: Subscription;
  output: WallLossOutput;

  tabSelect: string = 'help';
  baselineSelected = true;
  modificationExists = false;

  constructor(private settingsDbService: SettingsDbService, 
              private wallService: WallService) { }

  ngOnInit() {
    // TODO results not yet built - default to help
    // if (this.settingsDbService.globalSettings.defaultPanelTab) {
    //   this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    // }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    let existingInputs = this.wallService.baselineData.getValue();
    if(!existingInputs) {
      this.wallService.initDefaultEmptyInputs();
      this.wallService.initDefaultEmptyOutput();
    }
    this.initSubscriptions();
    if(this.modificationData) {
      this.modificationExists = true;
    }
  }

  ngOnDestroy() {
    this.modalSubscription.unsubscribe();
    this.baselineDataSub.unsubscribe();
    this.modificationDataSub.unsubscribe();
    this.outputSubscription.unsubscribe();
  }

  initSubscriptions() {
    this.modalSubscription = this.wallService.modalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    })
    this.baselineDataSub = this.wallService.baselineData.subscribe(value => {
      this.wallService.calculate(this.settings);
    })
    this.modificationDataSub = this.wallService.modificationData.subscribe(value => {
      this.wallService.calculate(this.settings);
    })
    this.outputSubscription = this.wallService.output.subscribe(val => {
      this.output = val;
    });
  }
  
  setTab(str: string) {
    this.tabSelect = str;
  }

  createModification() {
    this.wallService.initModification();
    this.modificationExists = true;
    this.setModificationSelected();
   }

   btnResetData() {
    this.modificationExists = false;
    this.wallService.initDefaultEmptyInputs();
    this.wallService.resetData.next(true);
  }

  btnGenerateExample() {
    this.wallService.generateExampleData(this.settings);
    this.modificationExists = true;
  }

  setBaselineSelected() {
    this.baselineSelected = true;
  }

  setModificationSelected() {
    this.baselineSelected = false;
  }

  focusField(str: string) {
    this.wallService.currentField.next(str);
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
    }
  }
}
