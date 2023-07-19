import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../../shared/models/phast/phast';
import { MeteredEnergyResults, MeteredEnergySteam, MeteredEnergyFuel, MeteredEnergyElectricity } from '../../shared/models/phast/meteredEnergy';
import { MeteredEnergyService } from './metered-energy.service';
import { Subscription } from 'rxjs';
import { PhastService } from '../phast.service';

@Component({
  selector: 'app-metered-energy',
  templateUrl: './metered-energy.component.html',
  styleUrls: ['./metered-energy.component.css']
})
export class MeteredEnergyComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;
  @Output('save')
  save = new EventEmitter<boolean>();
  @Input()
  containerHeight: number;
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }
  
  results: MeteredEnergyResults = {
    metered: {
      hourlyEnergy: 0,
      annualEnergy: 0,
      hourlyElectricity: 0,
      annualElectricity: 0,
      energyIntensity: 0,
    },
      byPhast: {
      hourlyEnergy: 0,
      annualEnergy: 0,
      annualElectricity: 0,
      energyIntensity: 0,
    }
  };

  tabSelect: string = 'results';
  currentField: string;
  energySource: string;
  isModalOpenSub: Subscription;
  isModalOpen: boolean;  
  smallScreenTab: string = 'baseline';
  constructor(private meteredEnergyService: MeteredEnergyService, private phastService: PhastService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.isModalOpenSub = this.phastService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    })
    if (!this.phast.meteredEnergy) {
      this.initializeNew();
    }
    this.getContainerHeight();
  }

  ngOnChanges(changes: SimpleChanges) {    
    if (changes.containerHeight && !changes.containerHeight.firstChange) {
      this.getContainerHeight();
    }
  }
  ngOnDestroy(){
    this.isModalOpenSub.unsubscribe();
  }

  initializeNew() {
    let steam: boolean = false;
    let electricity: boolean = false;
    let fuel: boolean = false;
    if (this.settings.energySourceType === 'Steam') {
      steam = true;
    }
    if (this.settings.energySourceType === 'Fuel') {
      fuel = true;
    }
    if (this.settings.energySourceType === 'Electricity') {
      electricity = true;
    }
    this.phast.meteredEnergy = {
      meteredEnergyElectricity: this.getEmptyElectricityInput(),
      meteredEnergyFuel: this.getEmptyFuelInput(),
      meteredEnergySteam: this.getEmptySteamInput(),
      fuel: fuel,
      steam: steam,
      electricity: electricity,
    };
  }

  emitSave() {
    this.save.emit(true);
  }

  setElectricity() {
    this.phast.meteredEnergy.electricity = !this.phast.meteredEnergy.electricity;
    if (!this.phast.meteredEnergy.electricity) {
      this.phast.meteredEnergy.meteredEnergyElectricity = this.getEmptyElectricityInput();
    }
    this.calculate();
  }

  setFuel() {
    this.phast.meteredEnergy.fuel = !this.phast.meteredEnergy.fuel;
    if (!this.phast.meteredEnergy.fuel) {
      this.phast.meteredEnergy.meteredEnergyFuel = this.getEmptyFuelInput();
    }
    this.calculate();
  }

  setSteam() {
    this.phast.meteredEnergy.steam = !this.phast.meteredEnergy.steam;
    if (!this.phast.meteredEnergy.steam) {
      this.phast.meteredEnergy.meteredEnergySteam = this.getEmptySteamInput();
    }
    this.calculate();
  }

  calculate() {
    this.results = this.meteredEnergyService.calculateMeteredEnergy(this.phast, this.settings);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setField(energySource: string) {
    this.energySource = energySource;
  }
  
  changeField(str: string) {
    this.currentField = str;
  }

  getEmptySteamInput(): MeteredEnergySteam {
    return {
      totalHeatSteam: 0,
      flowRate: 0,
      collectionTime: 0,
      electricityUsed: 0,
      electricityCollectionTime: 0,
      operatingHours: 0
    };
  }

  getEmptyFuelInput(): MeteredEnergyFuel {
    return {
      fuelDescription: 'gas',
      fuelType: 0,
      heatingValue: 0,
      collectionTime: 0,
      electricityUsed: 0,
      electricityCollectionTime: 0,
      fuelEnergy: 0,
      operatingHours: 0
    };
  }

  getEmptyElectricityInput(): MeteredEnergyElectricity {
    return {
      electricityCollectionTime: 0,
      electricityUsed: 0,
      auxElectricityUsed: 0,
      auxElectricityCollectionTime: 0,
      operatingHours: 0
    };
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

  getContainerHeight() {
    if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
      this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      this.cd.detectChanges();
    }
  }
}
