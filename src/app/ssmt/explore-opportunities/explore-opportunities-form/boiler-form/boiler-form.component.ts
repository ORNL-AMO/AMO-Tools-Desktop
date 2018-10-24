import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { SsmtService } from '../../../ssmt.service';
import { SSMT } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { ExploreOpportunitiesService } from '../../explore-opportunities.service';

@Component({
  selector: 'app-boiler-form',
  templateUrl: './boiler-form.component.html',
  styleUrls: ['./boiler-form.component.css']
})
export class BoilerFormComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();

  baselineFuelOptions: any;
  modificationFuelOptions: any;

  showBoilerData: boolean = false;
  showCombustionEfficiency: boolean = false;
  showFuelType: boolean = false;
  showBlowdownRate: boolean = false;
  showBlowdownFlashed: boolean = false;
  showPreheatBlowdownWater: boolean = false;
  showInitialSteamTemperature: boolean = false;
  showDeaeratorConditions: boolean = false;
  constructor(private exploreOpportunitiesService: ExploreOpportunitiesService, private suiteDbService: SuiteDbService) { }

  ngOnInit() {
    this.init();
    this.setFuelTypes();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.showBoilerData = false;
        this.showCombustionEfficiency = false;
        this.showFuelType = false;
        this.showBlowdownRate = false;
        this.showBlowdownFlashed = false;
        this.showPreheatBlowdownWater = false;
        this.showInitialSteamTemperature = false;
        this.showDeaeratorConditions = false;
        this.init();
      }
    }
  }

  setFuelTypes() {
    if (this.ssmt.boilerInput.fuelType == 0) {
      this.baselineFuelOptions = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    } else if (this.ssmt.boilerInput.fuelType == 1) {
      this.baselineFuelOptions = this.suiteDbService.selectGasFlueGasMaterials();
    }
    if (this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.fuelType == 0) {
      this.modificationFuelOptions = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    } else if (this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.fuelType == 1) {
      this.modificationFuelOptions = this.suiteDbService.selectGasFlueGasMaterials();
    }
  }

  init() {
    this.initCombustionEfficiency();
    this.initFuel();
    this.initBlowdownRate();
    this.initBlowdownFlashed();
    this.initPreheatMakeupWater();
    this.initInitialSteamTemperature();
    this.initDeaeratorConditions();
    if (this.showCombustionEfficiency || this.showFuelType || this.showBlowdownRate || this.showBlowdownFlashed || this.showPreheatBlowdownWater || this.showInitialSteamTemperature || this.showDeaeratorConditions) {
      this.showBoilerData = true;
    }
  }

  initCombustionEfficiency() {
    if (this.ssmt.boilerInput.combustionEfficiency != this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.combustionEfficiency) {
      this.showCombustionEfficiency = true;
    }
  }

  initFuel() {
    if (this.ssmt.boilerInput.fuel != this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.fuel ||
      this.ssmt.boilerInput.fuelType != this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.fuelType) {
      this.showFuelType = true;
    }
  }

  initBlowdownRate() {
    if (this.ssmt.boilerInput.blowdownRate != this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.blowdownRate) {
      this.showBlowdownRate = true;
    }
  }

  initBlowdownFlashed() {
    if (this.ssmt.boilerInput.blowdownFlashed != this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.blowdownFlashed) {
      this.showBlowdownFlashed = true;
    }
  }

  initPreheatMakeupWater() {
    if (this.ssmt.boilerInput.preheatMakeupWater != this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.preheatMakeupWater ||
      this.ssmt.boilerInput.approachTemperature != this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.approachTemperature) {
      this.showPreheatBlowdownWater = true;
    }
  }

  initInitialSteamTemperature() {
    if (this.ssmt.boilerInput.steamTemperature != this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.steamTemperature) {
      this.showInitialSteamTemperature = true;
    }
  }

  initDeaeratorConditions() {
    if (this.ssmt.boilerInput.deaeratorPressure != this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.deaeratorPressure ||
      this.ssmt.boilerInput.deaeratorVentRate != this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.deaeratorVentRate) {
      this.showDeaeratorConditions = true;
    }
  }

  toggleBoilerData() {
    if (this.showBoilerData == false) {
      this.showCombustionEfficiency = false;
      this.showFuelType = false;
      this.showBlowdownRate = false;
      this.showBlowdownFlashed = false;
      this.showPreheatBlowdownWater = false;
      this.showInitialSteamTemperature = false;
      this.showDeaeratorConditions = false;
      this.toggleDeaeratorConditions();
      this.toggleInitialSteamTemperature();
      this.togglePreheatBlowdownWater();
      this.toggleBlowdownFlashed();
      this.toggleBlowdownRate();
      this.toggleCombustionEfficiency();
      this.toggleFuelType();
    }
  }

  toggleCombustionEfficiency() {
    if (this.showCombustionEfficiency == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.combustionEfficiency = this.ssmt.boilerInput.combustionEfficiency;
      this.save();
    }
  }

  toggleFuelType() {
    if (this.showFuelType == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.fuelType = this.ssmt.boilerInput.fuelType;
      this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.fuel = this.ssmt.boilerInput.fuel;
      this.save();
    }
  }

  toggleBlowdownRate() {
    if (this.showBlowdownRate == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.blowdownRate = this.ssmt.boilerInput.blowdownRate;
      this.save();
    }
  }

  toggleBlowdownFlashed() {
    if (this.showBlowdownFlashed == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.blowdownFlashed = this.ssmt.boilerInput.blowdownFlashed;
      this.save();
    }
  }

  togglePreheatBlowdownWater() {
    if (this.showFuelType == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.preheatMakeupWater = this.ssmt.boilerInput.preheatMakeupWater;
      this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.approachTemperature = this.ssmt.boilerInput.approachTemperature;
      this.save();
    }
  }

  toggleInitialSteamTemperature() {
    if (this.showInitialSteamTemperature == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.steamTemperature = this.ssmt.boilerInput.steamTemperature;
      this.save();
    }
  }
  toggleDeaeratorConditions() {
    if (this.showDeaeratorConditions == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.deaeratorPressure = this.ssmt.boilerInput.deaeratorPressure;
      this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.deaeratorVentRate = this.ssmt.boilerInput.deaeratorVentRate;
      this.save();
    }
  }

  save() {
    this.emitSave.emit(true);
  }

  focusField(str: string) {
    this.exploreOpportunitiesService.currentTab.next('boiler');
    this.exploreOpportunitiesService.currentField.next(str);
  }

  focusOut() {
    // this.exploreOpportunitiesService.currentTab.next('boiler');
    // this.exploreOpportunitiesService.currentField.next('default');
  }
}
