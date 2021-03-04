import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { WasteHeatService } from './waste-heat.service';

@Component({
  selector: 'app-waste-heat',
  templateUrl: './waste-heat.component.html',
  styleUrls: ['./waste-heat.component.css']
})
export class WasteHeatComponent implements OnInit {
  @Input()
  settings: Settings;
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  
  wasteHeatInputsub: Subscription;
  modalSubscription: Subscription;
  
  headerHeight: number;
  isModalOpen: boolean;
  tabSelect: string = 'help';
  
  constructor(private wasteHeatService: WasteHeatService,
              private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    let existingInputs = this.wasteHeatService.wasteHeatInput.getValue();
    if(!existingInputs) {
      this.wasteHeatService.initDefaultEmptyInputs();
      this.wasteHeatService.initDefaultEmptyOutputs();
    }
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.wasteHeatInputsub.unsubscribe();
    this.modalSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  initSubscriptions() {
    this.wasteHeatInputsub = this.wasteHeatService.wasteHeatInput.subscribe(value => {
      this.calculate();
    });
    this.modalSubscription = this.wasteHeatService.modalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    });
  }

  calculate() {
    this.wasteHeatService.calculate(this.settings);
  }

  btnResetData() {
    this.wasteHeatService.initDefaultEmptyInputs();
    this.wasteHeatService.resetData.next(true);
  }

  btnGenerateExample() {
    this.wasteHeatService.generateExampleData(this.settings);
    this.wasteHeatService.generateExample.next(true);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

}
