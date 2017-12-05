import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { O2Enrichment, O2EnrichmentOutput } from '../../../../shared/models/phast/o2Enrichment';
@Component({
  selector: 'app-o2-enrichment-form',
  templateUrl: './o2-enrichment-form.component.html',
  styleUrls: ['./o2-enrichment-form.component.css']
})
export class O2EnrichmentFormComponent implements OnInit {
  @Input()
  o2Enrichment: O2Enrichment;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  o2EnrichmentOutput: O2EnrichmentOutput;
  @Input()
  lines: any;
  @Output('changeFieldEmit')
  changeFieldEmit = new EventEmitter<string>();
  error = {
    flueGasTemp: null,
    flueGasTempEnriched: null,
    o2CombAir: null,
    o2CombAirEnriched: null,
    combAirTemp: null,
    combAirTempEnriched : null,
    o2FlueGas: null,
    o2FlueGasEnriched: null
  };

  constructor() { }

  ngOnInit() { }
  calc() {
    this.error.flueGasTemp = this.error.flueGasTempEnriched = this.error.o2CombAir = this.error.o2CombAirEnriched = null;
    this.error.combAirTemp = this.error.combAirTempEnriched = this.error.o2FlueGas = this.error.o2FlueGasEnriched = null;
    let canCalculate: any = true;
    if (this.o2Enrichment.o2CombAirEnriched < 21 || this.o2Enrichment.o2CombAirEnriched > 100) {
      canCalculate = false;
      this.error.o2CombAirEnriched = 'O2 in combustion air must be between 21 and 100 percent';
    }
    if (this.o2Enrichment.o2CombAir > this.o2Enrichment.o2CombAirEnriched) {
      canCalculate = false;
      this.error.o2CombAir = 'O2 in combustion air must be less than or equal to the O2 in the enriched air';
    }
    if (this.o2Enrichment.combAirTemp < 0 || this.o2Enrichment.combAirTemp > 2000) {
      canCalculate = false;
      this.error.combAirTemp = 'Combustion air preheat temperature must be between 0 and 2000 deg F';
    }
    if (this.o2Enrichment.combAirTempEnriched < 0 || this.o2Enrichment.combAirTempEnriched > 2000) {
      canCalculate = false;
      this.error.combAirTempEnriched = 'Combustion air preheat temperature must be between 0 and 2000 deg F';
    }
    // if (this.o2Enrichment.combAirTemp < this.o2Enrichment.combAirTempEnriched) {
    //   canCalculate = false;
    //   this.error.combAirTemp = 'Combustion air preheat temperature must be greater than or equal to the oxygen enriched air mixture preheat temperature';
    // }
    if (this.o2Enrichment.o2FlueGas < 0 || this.o2Enrichment.o2FlueGas > 100) {
      canCalculate = false;
      this.error.o2FlueGas = 'O2 in flue gasses must be between 0 and 100 percent';
    }
    if (this.o2Enrichment.o2FlueGasEnriched < 0 || this.o2Enrichment.o2FlueGasEnriched > 100) {
      canCalculate = false;
      this.error.o2FlueGasEnriched = 'O2 in flue gasses must be between 0 and 100 percent';
    }
    if (this.o2Enrichment.flueGasTemp < 0 || this.o2Enrichment.flueGasTemp > 4000) {
      canCalculate = false;
      this.error.flueGasTemp = 'Flue gas temperature must be between 0 and 4000 deg F';
    }
    if (this.o2Enrichment.flueGasTempEnriched < 0 || this.o2Enrichment.flueGasTempEnriched > 4000) {
      canCalculate = false;
      this.error.flueGasTempEnriched = 'Flue gas temperature Enriched must be between 0 and 4000 deg F';
    }
    if (this.o2Enrichment.flueGasTemp < this.o2Enrichment.flueGasTempEnriched) {
      canCalculate = false;
      this.error.flueGasTemp = 'Flue gas temperature must be greater than or equal to the enriched flue gas temperature';
    }
    if (canCalculate) {
      this.calculate.emit(true);
    }
  }

  changeField(str: string) {
    this.changeFieldEmit.emit(str);
  }
}
