import { Component, OnInit, Input } from '@angular/core';
import { PhastService } from '../phast.service';
import { PHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';

@Component({
  selector: 'app-phast-report',
  templateUrl: './phast-report.component.html',
  styleUrls: ['./phast-report.component.css']
})
export class PhastReportComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;
  @Input()
  inPhast: boolean;
  @Input()
  assessment: Assessment;

  sumChargeMaterials: number = 0;
  sumExtendedSurface: number = 0;
  sumLeakage: number = 0;
  sumFixtures: number = 0;
  sumWallLosses: number = 0;
  sumCoolingLosses: number = 0;
  sumAtmosphereLosses: number = 0;
  sumOpeningLosses: number = 0;
  sumOther: number = 0;
  sumHeatRequired: number = 0;
  availableHeatPercent: number = 0;
  sumFlueGas: number = 0;
  exothermicHeat: number = 0;
  grossHeatInput: number = 0;
  sumAux: number = 0;
  heatingSystemEfficiency: number = 0;
  energyInputHeatDelivered: number = 0;
  energyInputTotalChemEnergy: number = 0;
  exhaustGas: number = 0;
  flueGas: number = 0;
  flueGasAvailableHeat: number = 0;
  flueGasGrossHeat: number = 0;
  flueGasSystemLosses: number = 0;
  slagSum: number = 0;
  systemLosses: number = 0;
  showSlag: boolean = false;
  showAuxPower: boolean = false;
  showSystemEff: boolean = false;
  showFlueGas: boolean = false;
  showEnInput1: boolean = false;
  showEnInput2: boolean = false;
  showExGas: boolean = false;
  constructor(private phastService: PhastService) { }

  ngOnInit() {
    if (this.settings.energySourceType == 'Fuel') {
      this.showFlueGas = true;
    } else if (this.settings.energySourceType == 'Electricity') {
      if (this.settings.furnaceType == 'Electric Arc Furnace (EAF)') {
        this.showSlag = true;
        this.showExGas = true;
        this.showEnInput1 = true;
      } else if (this.settings.furnaceType != 'Custom Electrotechnology') {
        this.showAuxPower = true;
        this.showEnInput2 = true;
      } else if (this.settings.furnaceType == 'Custom Electrotechnology') {
        this.showSystemEff = true;
      }
    } else if (this.settings.energySourceType == 'Steam') {
      this.showSystemEff = true;
    }
    //all energy source types
    if (this.phast.losses.chargeMaterials) {
      this.sumChargeMaterials = this.phastService.sumChargeMaterials(this.phast.losses.chargeMaterials, this.settings);
    }
    if (this.phast.losses.fixtureLosses) {
      this.sumFixtures = this.phastService.sumFixtureLosses(this.phast.losses.fixtureLosses, this.settings);
    }
    if (this.phast.losses.wallLosses) {
      this.sumWallLosses = this.phastService.sumWallLosses(this.phast.losses.wallLosses, this.settings);
    }
    if (this.phast.losses.coolingLosses) {
      this.sumCoolingLosses = this.phastService.sumCoolingLosses(this.phast.losses.coolingLosses, this.settings);
    }
    if (this.phast.losses.atmosphereLosses) {
      this.sumAtmosphereLosses = this.phastService.sumAtmosphereLosses(this.phast.losses.atmosphereLosses, this.settings);
    }
    if (this.phast.losses.openingLosses) {
      this.sumOpeningLosses = this.phastService.sumOpeningLosses(this.phast.losses.openingLosses, this.settings);
    }
    if (this.phast.losses.otherLosses) {
      this.sumOther = this.phastService.sumOtherLosses(this.phast.losses.otherLosses);
    }
    if (this.phast.losses) {
      this.sumHeatRequired = this.phastService.sumHeatInput(this.phast.losses, this.settings);
    }
    if (this.phast.losses.leakageLosses) {
      this.sumLeakage = this.phastService.sumLeakageLosses(this.phast.losses.leakageLosses, this.settings);
    }

    if (this.phast.losses.extendedSurfaces) {
      this.sumExtendedSurface = this.phastService.sumExtendedSurface(this.phast.losses.extendedSurfaces, this.settings);
    }
    //fuel
    if (this.showFlueGas) {
      if (this.phast.losses.flueGasLosses) {
        let tmpFlueGas = this.phast.losses.flueGasLosses[0];
        if (tmpFlueGas) {
          if (tmpFlueGas.flueGasType == 'By Mass') {
            let tmpVal = this.phastService.flueGasByMass(tmpFlueGas.flueGasByMass, this.settings);
            this.flueGasAvailableHeat = tmpVal * 100;
            this.flueGasGrossHeat = this.phastService.sumHeatInput(this.phast.losses, this.settings) / tmpVal;
            this.flueGasSystemLosses = this.flueGasGrossHeat * (1 - tmpVal);
          } else if (tmpFlueGas.flueGasType == 'By Volume') {
            let tmpVal = this.phastService.flueGasByVolume(tmpFlueGas.flueGasByVolume, this.settings);
            this.flueGasAvailableHeat = tmpVal * 100;
            this.flueGasGrossHeat = this.phastService.sumHeatInput(this.phast.losses, this.settings) / tmpVal;
            this.flueGasSystemLosses = this.flueGasGrossHeat * (1 - tmpVal);
          }
        }
      }
    }
    if (this.showSlag) {
      if (this.phast.losses.slagLosses) {
        this.slagSum = this.phastService.sumSlagLosses(this.phast.losses.slagLosses, this.settings);
      }
    }
    if (this.showExGas) {
      if (this.phast.losses.exhaustGasEAF[0]) {
        this.exhaustGas = this.phastService.exhaustGasEAF(this.phast.losses.exhaustGasEAF[0], this.settings);
      }
    }
    if (this.showEnInput1) {
      if (this.phast.losses.energyInputEAF) {
        if (this.phast.losses.energyInputEAF[0]) {
          let tmpResult = this.phastService.energyInputEAF(this.phast.losses.energyInputEAF[0], this.settings);
          this.energyInputHeatDelivered = tmpResult.heatDelivered;
          this.energyInputTotalChemEnergy = tmpResult.totalChemicalEnergyInput;
        }
      }
    }
    if (this.showAuxPower) {
      if (this.phast.losses.auxiliaryPowerLosses) {
        this.sumAux = this.phastService.sumAuxilaryPowerLosses(this.phast.losses.auxiliaryPowerLosses);
      }
    }
    if (this.showEnInput2) {
      if (this.phast.losses.energyInputExhaustGasLoss) {
        if (this.phast.losses.energyInputExhaustGasLoss[0]) {
          this.energyInputHeatDelivered = this.phastService.energyInputExhaustGasLosses(this.phast.losses.energyInputExhaustGasLoss[0], this.settings);
          this.availableHeatPercent = this.phastService.availableHeat(this.phast.losses.energyInputExhaustGasLoss[0], this.settings);
        }
      }
    }
    if (this.showSystemEff) {
      if (this.phast.systemEfficiency) {
        this.heatingSystemEfficiency = this.phast.systemEfficiency;
        this.grossHeatInput = this.phastService.sumHeatInput(this.phast.losses, this.settings) / this.phast.systemEfficiency;
        this.systemLosses = this.grossHeatInput * (1 - (this.phast.systemEfficiency / 100));

      }
    }
  }

}
