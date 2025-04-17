import { Component, OnInit, ViewChild, Input, ElementRef, HostListener, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '../../../../../node_modules/@angular/forms';
import { FlueGasByVolume, FlueGasByMass, FlueGasByVolumeSuiteResults } from '../../../shared/models/phast/losses/flueGas';
import { StackLossService } from './stack-loss.service';
import { Subscription } from 'rxjs';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
    selector: 'app-stack-loss-calculator',
    templateUrl: './stack-loss.component.html',
    styleUrls: ['./stack-loss.component.css'],
    standalone: false
})
export class StackLossComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inModal: boolean;
  @Output('emitEfficiency')
  emitEfficiency = new EventEmitter<number>();

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;
  containerHeight: number;

  currentField: string = 'default';
  method: number = 1;
  tabSelect: string = 'results';
  stackLossForm: FormGroup;
  flueGasByVolume: FlueGasByVolume;
  flueGasByMass: FlueGasByMass;

  stackLossPercent: number = 0;
  boilerEfficiency: number = 0;
  modalOpenSubscription: Subscription;
  isModalOpen: boolean = false;
  smallScreenTab: string = 'form';

  constructor(private settingsDbService: SettingsDbService,
     private stackLossService: StackLossService, private cd: ChangeDetectorRef,
     private analyticsService: AnalyticsService) {
  }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-STEAM-stack-loss');
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.modalOpenSubscription = this.stackLossService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    }); 
    this.setStackLossForm();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 200);
  }
  
  ngOnDestroy() {
    this.modalOpenSubscription.unsubscribe();
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

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeField(str: string) {
    this.currentField = str;
  }

  setStackLossForm() {
    if (this.stackLossService.stackLossInput) {
      if (this.stackLossService.stackLossInput.flueGasType) {
        this.method = this.stackLossService.stackLossInput.flueGasType;
        if (this.method === 1) {
          this.stackLossForm = this.stackLossService.initByVolumeFormFromLoss(this.stackLossService.stackLossInput);
        } else if (this.method === 0) {
          this.stackLossForm = this.stackLossService.initByMassFormFromLoss(this.stackLossService.stackLossInput);
        }
      } else {
        if (this.method === 1) {
          this.stackLossForm = this.stackLossService.initFormVolume(this.settings);
        } else if (this.method === 0) {
          this.stackLossForm = this.stackLossService.initFormMass(this.settings);
        }
      }
    } else {
      if (this.method === 1) {
        this.stackLossForm = this.stackLossService.initFormVolume(this.settings);
      } else if (this.method === 0) {
        this.stackLossForm = this.stackLossService.initFormMass(this.settings);
      }
    }
   this.cd.detectChanges();
  }

  changeFuelType() {
    if (this.method === 1) {
      if (this.stackLossService.stackLossInput.flueGasByVolume) {
        this.stackLossForm = this.stackLossService.initByVolumeFormFromLoss(this.stackLossService.stackLossInput);
      } else {
        this.stackLossForm = this.stackLossService.initFormVolume(this.settings);
      }
    } else if (this.method === 0) {
      if (this.stackLossService.stackLossInput.flueGasByMass) {
        this.stackLossForm = this.stackLossService.initByMassFormFromLoss(this.stackLossService.stackLossInput);
      } else {
        this.stackLossForm = this.stackLossService.initFormMass(this.settings);
      }
    }
    this.cd.detectChanges();
  }

  calculate(form: FormGroup) {
    form.patchValue({
      fuelTemperature: this.stackLossForm.controls.combustionAirTemperature.value
    });
    if (this.method === 1) {
      this.flueGasByVolume = this.stackLossService.buildByVolumeLossFromForm(form);
      this.stackLossService.stackLossInput.flueGasType = this.method;
      this.stackLossService.stackLossInput.flueGasByVolume = this.flueGasByVolume;
      if (form.valid == true) {
        let flueGasByVolumeSuiteResults: FlueGasByVolumeSuiteResults = this.stackLossService.flueGasByVolume(this.flueGasByVolume, this.settings);
        this.boilerEfficiency = flueGasByVolumeSuiteResults.availableHeat * 100;
        this.stackLossPercent = (1 - flueGasByVolumeSuiteResults.availableHeat) * 100;
      } else {
        this.stackLossPercent = 0;
        this.boilerEfficiency = 0;
      }
    } else if (this.method === 0) {
      this.flueGasByMass = this.stackLossService.buildByMassLossFromForm(form);
      this.stackLossService.stackLossInput.flueGasType = this.method;
      this.stackLossService.stackLossInput.flueGasByMass = this.flueGasByMass;
      if (form.valid == true) {
        const availableHeat = this.stackLossService.flueGasByMass(this.flueGasByMass, this.settings);
        this.boilerEfficiency = availableHeat * 100;
        this.stackLossPercent = (1 - availableHeat) * 100;
      } else {
        this.stackLossPercent = 0;
        this.boilerEfficiency = 0;
      }
    }
    if (this.inModal == true) {
      this.emitEfficiency.emit(this.boilerEfficiency);
    }
  }

  btnResetData() {
    this.stackLossService.stackLossInput = {
      flueGasType: undefined,
      flueGasByVolume: undefined,
      flueGasByMass: undefined,
      name: undefined
    };
    this.setStackLossForm();
    this.calculate(this.stackLossForm);
  }

  btnGenerateData() {
    this.stackLossService.stackLossInput = this.stackLossService.getExampleData(this.settings);
    this.setStackLossForm();
    this.calculate(this.stackLossForm);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}
