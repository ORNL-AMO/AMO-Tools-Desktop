import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { FlueGas, FlueGasOutput } from '../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../shared/models/settings';
import { FlueGasService } from './flue-gas.service';

@Component({
  selector: 'app-flue-gas',
  templateUrl: './flue-gas.component.html',
  styleUrls: ['./flue-gas.component.css']
})
export class FlueGasComponent implements OnInit {

  @Input()
  settings: Settings;
  @Output('emitEfficiency')
  emitEfficiency = new EventEmitter<number>();
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

  results: {baseline: number, modification: number};
  baselineData: FlueGas;
  modificationData: FlueGas;
  baselineDataSub: Subscription;
  modificationDataSub: Subscription;
  outputSubscription: Subscription;
  output: FlueGasOutput;

  method: string = 'By Mass';
  currentField: string;
  tabSelect: string = 'help';
  baselineSelected = true;
  modificationExists = false;

  constructor(private settingsDbService: SettingsDbService, 
              private flueGasService: FlueGasService) { }

  ngOnInit() {
    // TODO haven't built results - default to help
    // if (this.settingsDbService.globalSettings.defaultPanelTab) {
    //   this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    // }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    let existingInputs = this.flueGasService.baselineData.getValue();
    if(!existingInputs) {
      this.flueGasService.initDefaultEmptyInputs(this.settings);
      this.flueGasService.initDefaultEmptyOutput();
      // this.createModification();
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
    this.modalSubscription = this.flueGasService.modalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    })
    this.baselineDataSub = this.flueGasService.baselineData.subscribe(value => {
      this.setBaselineSelected();
      this.flueGasService.calculate(this.settings);
    })
    this.modificationDataSub = this.flueGasService.modificationData.subscribe(value => {
      this.flueGasService.calculate(this.settings);
    })
    this.outputSubscription = this.flueGasService.output.subscribe(val => {
      this.output = val;
    });
  }
  
  setTab(str: string) {
    this.tabSelect = str;
  }

  createModification() {
    this.flueGasService.initModification();
    this.modificationExists = true;
    this.setModificationSelected();
   }

   btnResetData() {
    this.flueGasService.resetData.next(true);
    this.flueGasService.initDefaultEmptyInputs(this.settings);
    this.flueGasService.modificationData.next(undefined);
    this.method = 'By Mass';
    this.modificationExists = false;
  }

  btnGenerateExample() {
      this.method = 'By Volume';
      this.flueGasService.generateExampleData(this.settings);
      this.modificationExists = true;
      this.baselineSelected = true;
  }

  setBaselineSelected() {
    if (this.baselineSelected == false) {
      this.baselineSelected = true;
    }
  }

  setModificationSelected() {
    if (this.baselineSelected == true) {
      this.baselineSelected = false;
    }
  }

  focusField(str: string) {
    this.flueGasService.currentField.next(str);
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
