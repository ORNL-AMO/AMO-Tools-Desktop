import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../../shared/models/phast/phast';
import { DesignedEnergyElectricity, DesignedEnergyFuel, DesignedEnergySteam, DesignedEnergyResults, DesignedZone } from '../../shared/models/phast/designedEnergy';
import { DesignedEnergyService } from './designed-energy.service';
import { PhastService } from '../phast.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-designed-energy',
  templateUrl: './designed-energy.component.html',
  styleUrls: ['./designed-energy.component.css']
})
export class DesignedEnergyComponent implements OnInit {
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

  results: DesignedEnergyResults = {
    designed: {
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
  constructor(private designedEnergyService: DesignedEnergyService, private phastService: PhastService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.isModalOpenSub = this.phastService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    })

    if (!this.phast.designedEnergy) {
      this.initializeNew();
    }
    this.calculate();    
    this.getContainerHeight();
  }

  ngOnDestroy() {
    this.isModalOpenSub.unsubscribe();
  }
  
  ngOnChanges(changes: SimpleChanges) {    
    if (changes.containerHeight && !changes.containerHeight.firstChange) {
      this.getContainerHeight();
    }
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
    this.phast.designedEnergy = {
      zones: new Array<DesignedZone>(),
      fuel: fuel,
      steam: steam,
      electricity: electricity
    };
    this.addZone();
  }

  emitSave() {
    this.save.emit(true);
  }

  setElectricity() {
    this.phast.designedEnergy.electricity = !this.phast.designedEnergy.electricity;
    if (!this.phast.designedEnergy.electricity) {
      this.phast.designedEnergy.zones.forEach(zone => {
        zone.designedEnergyElectricity = this.getEmptyElectricityInput();
      });
    }
    this.calculate();
  }

  setFuel() {
    this.phast.designedEnergy.fuel = !this.phast.designedEnergy.fuel;
    if (!this.phast.designedEnergy.fuel) {
      this.phast.designedEnergy.zones.forEach(zone => {
        zone.designedEnergyFuel = this.getEmptyFuelInput();
      });
    }
    this.calculate();
  }

  setSteam() {
    this.phast.designedEnergy.steam = !this.phast.designedEnergy.steam;
    if (!this.phast.designedEnergy.steam) {
      this.phast.designedEnergy.zones.forEach(zone => {
        zone.designedEnergySteam = this.getEmptySteamInput();
      });
    }
    this.calculate();
  }

  calculate() {
    this.results = this.designedEnergyService.calculateDesignedEnergy(this.phast, this.settings);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setField(currentField: string, energySource: string) {
    this.currentField = currentField;
    this.energySource = energySource;
  }

  addZone() {
    let zoneNum: number = this.phast.designedEnergy.zones.length + 1;
    this.phast.designedEnergy.zones.push({
      name: 'Zone #' + zoneNum,
      designedEnergyElectricity: this.getEmptyElectricityInput(),
      designedEnergyFuel: this.getEmptyFuelInput(),
      designedEnergySteam: this.getEmptySteamInput()
    });
    this.calculate();
  }

  removeZone(index: number) {
    this.phast.designedEnergy.zones.splice(index, 1);
    this.calculate();
  }

  getEmptySteamInput(): DesignedEnergySteam {
    return {
      totalHeat: 0,
      steamFlow: 0,
      percentCapacityUsed: 0,
      operatingHours: 0
    };
  }

  getEmptyFuelInput(): DesignedEnergyFuel {
    return {
      fuelType: 0,
      percentCapacityUsed: 0,
      totalBurnerCapacity: 0,
      operatingHours: 0
    };
  }

  getEmptyElectricityInput(): DesignedEnergyElectricity {
    return {
      kwRating: 0,
      percentCapacityUsed: 0,
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
