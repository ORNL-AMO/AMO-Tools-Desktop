import { Component, OnInit, Input } from '@angular/core';
import { PhastService } from '../../phast.service';
import { PHAST, PhastResults } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { PhastResultsService } from '../../phast-results.service';
@Component({
  selector: 'app-results-data',
  templateUrl: './results-data.component.html',
  styleUrls: ['./results-data.component.css']
})
export class ResultsDataComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;
  @Input()
  inPhast: boolean;
  @Input()
  assessment: Assessment;

  baseLineResults: PhastResults;
  modificationResults: Array<PhastResults>;

  showSlag: boolean = false;
  showAuxPower: boolean = false;
  showSystemEff: boolean = false;
  showFlueGas: boolean = false;
  showEnInput1: boolean = false;
  showEnInput2: boolean = false;
  showExGas: boolean = false;
  constructor(private phastService: PhastService, private phastResultsService: PhastResultsService) { }

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

    this.baseLineResults = this.phastResultsService.getResults(this.phast, this.settings);

    //fuel
    // if (this.showFlueGas) {
    //   if (this.phast.losses.flueGasLosses) {
    //     let tmpFlueGas = this.phast.losses.flueGasLosses[0];
    //     if (tmpFlueGas) {
    //       if (tmpFlueGas.flueGasType == 'By Mass') {
    //         let tmpVal = this.phastService.flueGasByMass(tmpFlueGas.flueGasByMass, this.settings);
    //         this.flueGasAvailableHeat = tmpVal * 100;
    //         this.flueGasGrossHeat = this.phastService.sumHeatInput(this.phast.losses, this.settings) / tmpVal;
    //         this.flueGasSystemLosses = this.flueGasGrossHeat * (1 - tmpVal);
    //       } else if (tmpFlueGas.flueGasType == 'By Volume') {
    //         let tmpVal = this.phastService.flueGasByVolume(tmpFlueGas.flueGasByVolume, this.settings);
    //         this.flueGasAvailableHeat = tmpVal * 100;
    //         this.flueGasGrossHeat = this.phastService.sumHeatInput(this.phast.losses, this.settings) / tmpVal;
    //         this.flueGasSystemLosses = this.flueGasGrossHeat * (1 - tmpVal);
    //       }
    //     }
    //   }
    // }

    // if (this.showSystemEff) {
    //   if (this.phast.systemEfficiency) {
    //     this.heatingSystemEfficiency = this.phast.systemEfficiency;
    //     this.grossHeatInput = this.phastService.sumHeatInput(this.phast.losses, this.settings) / this.phast.systemEfficiency;
    //     this.systemLosses = this.grossHeatInput * (1 - (this.phast.systemEfficiency / 100));

    //   }
    // }
  }
}
