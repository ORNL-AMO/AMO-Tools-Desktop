import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { EnergyEquivalencyFuel, EnergyEquivalencyElectric, EnergyEquivalencyElectricOutput, EnergyEquivalencyFuelOutput } from '../../../shared/models/phast/energyEquivalency';
import { PhastService } from '../../../phast/phast.service';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { EnergyEquivalencyService } from './energy-equivalency.service';

@Component({
  selector: 'app-energy-equivalency',
  templateUrl: './energy-equivalency.component.html',
  styleUrls: ['./energy-equivalency.component.css']
})
export class EnergyEquivalencyComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  energyEquivalencyElectric: EnergyEquivalencyElectric;
  energyEquivalencyFuel: EnergyEquivalencyFuel;

  energyEquivalencyFuelOutput: EnergyEquivalencyFuelOutput = { fuelFiredHeatInput: 0 };
  energyEquivalencyElectricOutput: EnergyEquivalencyElectricOutput = { electricalHeatInput: 0 };

  currentField: string = 'default';
  tabSelect: string = 'results';
  constructor(private phastService: PhastService, private energyEquivalencyService: EnergyEquivalencyService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }

    if(this.energyEquivalencyService.energyEquivalencyElectric){
      this.energyEquivalencyElectric = this.energyEquivalencyService.energyEquivalencyElectric;
    }else{
      this.energyEquivalencyElectric = this.energyEquivalencyService.initEquivalencyElectric(this.settings);
    }

    if(this.energyEquivalencyService.energyEquivalencyFuel){
      this.energyEquivalencyFuel = this.energyEquivalencyService.energyEquivalencyFuel;
    }else{
      this.energyEquivalencyFuel = this.energyEquivalencyService.initEquivalencyFuel();
    }
    this.calculateElectric();
    this.calculateFuel();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy(){
    this.energyEquivalencyService.energyEquivalencyFuel = this.energyEquivalencyFuel;
    this.energyEquivalencyService.energyEquivalencyElectric = this.energyEquivalencyElectric;
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  calculateFuel() {
    this.energyEquivalencyFuelOutput = this.phastService.energyEquivalencyFuel(this.energyEquivalencyFuel, this.settings);
  }

  calculateElectric() {
    this.energyEquivalencyElectricOutput = this.phastService.energyEquivalencyElectric(this.energyEquivalencyElectric, this.settings);
  }

  setCurrentField(str: string) {
    this.currentField = str;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }


}
