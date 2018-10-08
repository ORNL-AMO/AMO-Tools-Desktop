import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { SsmtService } from '../../../ssmt.service';
import { SSMT } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';

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


  constructor(private ssmtService: SsmtService, private suiteDbService: SuiteDbService) { }

  ngOnInit() {
    this.init();
    this.setFuelTypes();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
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
    if (this.showCombustionEfficiency || this.showFuelType) {
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

  toggleBoilerData() {
    if (this.showBoilerData == false) {
      this.showCombustionEfficiency = false;
      this.showFuelType = false;
      this.toggleCombustionEfficiency();
      this.toggleFuelType();
    }
  }

  toggleCombustionEfficiency() {
    if (this.showCombustionEfficiency == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.combustionEfficiency = this.ssmt.boilerInput.combustionEfficiency;
    }
  }

  toggleFuelType() {
    if (this.showFuelType == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.fuelType = this.ssmt.boilerInput.fuelType;
      this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.fuel = this.ssmt.boilerInput.fuel;
    }
  }

  save() {
    this.emitSave.emit(true);
  }

  focusField(str: string) {
    this.ssmtService.currentField.next(str);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
  }
}
