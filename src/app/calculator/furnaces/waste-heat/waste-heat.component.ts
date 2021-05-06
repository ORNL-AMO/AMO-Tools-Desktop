import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { OperatingHours } from '../../../shared/models/operations';
import { WasteHeatInput } from '../../../shared/models/phast/wasteHeat';
import { Settings } from '../../../shared/models/settings';
import { Treasure } from '../../../shared/models/treasure-hunt';
import { WasteHeatService } from './waste-heat.service';

@Component({
  selector: 'app-waste-heat',
  templateUrl: './waste-heat.component.html',
  styleUrls: ['./waste-heat.component.css']
})
export class WasteHeatComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  @Input()
  operatingHours: OperatingHours;

  // @Output('emitSave')
  // emitSave = new EventEmitter<Wasteheat>();
  // @Output('emitCancel')
  // emitCancel = new EventEmitter<boolean>();

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild("contentContainer", { static: false }) contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  
  baselineDataSub: Subscription;
  modificationDataSub: Subscription;
  modalSubscription: Subscription;
  
  containerHeight: number;
  isModalOpen: boolean;
  tabSelect: string = 'results';
  baselineSelected = true;
  modificationExists: boolean;
  
  constructor(private wasteHeatService: WasteHeatService,
              private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    let existingInputs = this.wasteHeatService.baselineData.getValue();
    if(!existingInputs) {
      this.resetWasteHeatInputs();
    }
    this.initSubscriptions();
    if(this.wasteHeatService.modificationData.getValue()) {
      this.modificationExists = true;
    }
  }

  ngOnDestroy() {
    this.baselineDataSub.unsubscribe();
    this.modificationDataSub.unsubscribe();
    this.modalSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  initSubscriptions() {
    this.baselineDataSub = this.wasteHeatService.baselineData.subscribe(baselineData => {
      if (baselineData) {
        this.setBaselineSelected();
        this.calculate();
      }
    });
    this.modificationDataSub = this.wasteHeatService.modificationData.subscribe(modificationData => {
      if (modificationData) {
        this.calculate();
      }
    });
    this.modalSubscription = this.wasteHeatService.modalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    });
  }

  createModification() {
    this.wasteHeatService.initModification();
    this.modificationExists = true;
    this.setModificationSelected();
    this.wasteHeatService.calculate(this.settings);
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

  calculate() {
    this.wasteHeatService.calculate(this.settings);
  }

  save() {
    let baselineData: WasteHeatInput = this.wasteHeatService.baselineData.getValue();
    let modificationData: WasteHeatInput = this.wasteHeatService.modificationData.getValue();
    // this.emitSave.emit({ 
    //   baseline: baselineData, 
    //   modification: modificationData, 
    //   opportunityType: Treasure.wasteHeat
    // });
  }

  cancel() {
    // this.emitCancel.emit(true);
  }

  btnResetData() {
    this.modificationExists = false;
    this.resetWasteHeatInputs()
    this.wasteHeatService.resetData.next(true);
    this.baselineSelected = true;
  }

  resetWasteHeatInputs() {
    let treasureHuntHours: number = this.inTreasureHunt? this.operatingHours.hoursPerYear : undefined;
    this.wasteHeatService.initDefaultEmptyInputs(treasureHuntHours);
  }

  btnGenerateExample() {
    this.modificationExists = true;
    this.wasteHeatService.generateExampleData(this.settings);
    this.wasteHeatService.generateExample.next(true);
    this.baselineSelected = true;
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
