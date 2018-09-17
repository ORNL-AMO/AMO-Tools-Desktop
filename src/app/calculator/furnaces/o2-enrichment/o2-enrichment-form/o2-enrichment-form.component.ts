import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { O2Enrichment, O2EnrichmentOutput } from '../../../../shared/models/phast/o2Enrichment';
import { Settings } from '../../../../shared/models/settings';
import { O2EnrichmentService, O2EnrichmentMinMax } from '../o2-enrichment.service';
import { FormGroup, Validators } from '@angular/forms';
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
  @Output('changeFieldEmit')
  changeFieldEmit = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  o2Form: FormGroup;
  constructor(private o2EnrichmentService: O2EnrichmentService) { }

  ngOnInit() {
    this.o2Form.controls.o2CombAir.disable();
    this.setRanges();
  }

  calc() {
    this.setRanges();
    this.calculate.emit(true);
  }

  changeField(str: string) {
    this.changeFieldEmit.emit(str);
  }
  focusOut() {
    this.changeFieldEmit.emit('default');
  }

  setRanges() {
    let tmpO2Enrichment: O2Enrichment = this.o2EnrichmentService.getObjFromForm(this.o2Form);
    let tmpRanges: O2EnrichmentMinMax = this.o2EnrichmentService.getMinMaxRanges(this.settings, tmpO2Enrichment);
    let combAirTempDirty: boolean = this.o2Form.controls.combAirTempEnriched.dirty;
    let o2CombAirDirty: boolean = this.o2Form.controls.o2CombAir.dirty;
    let combAirTempEnrichedDirty: boolean = this.o2Form.controls.combAirTemp.dirty;

    this.o2Form.controls.combAirTempEnriched.setValidators([Validators.required, Validators.min(tmpRanges.combAirTempEnrichedMin), Validators.max(tmpRanges.combAirTempEnrichedMax)])
    this.o2Form.controls.combAirTempEnriched.reset(this.o2Form.controls.combAirTempEnriched.value);

    this.o2Form.controls.o2CombAir.setValidators([Validators.required, Validators.max(tmpRanges.o2CombAirMax)])
    this.o2Form.controls.o2CombAir.reset(this.o2Form.controls.o2CombAir.value);

    this.o2Form.controls.combAirTemp.setValidators([Validators.required, Validators.min(tmpRanges.combAirTempMin), Validators.max(tmpRanges.combAirTempMax)])
    this.o2Form.controls.combAirTemp.reset(this.o2Form.controls.combAirTemp.value);

    if (combAirTempDirty) {
      this.o2Form.controls.combAirTempEnriched.markAsDirty();
    }
    if (o2CombAirDirty) {
      this.o2Form.controls.o2CombAir.markAsDirty();
    }
    if (combAirTempEnrichedDirty) {
      this.o2Form.controls.combAirTemp.markAsDirty();
    }
  }

  plot(){
    
  }
}

// if (this.o2Enrichment.combAirTemp > this.o2Enrichment.flueGasTemp) {
//   this.error.combAirTemp = 'Combustion air temperature must be less than flue gas temperature';
// }
// if (this.o2Enrichment.combAirTempEnriched > this.o2Enrichment.flueGasTempEnriched) {
//   this.error.combAirTempEnriched = 'Enriched combustion air temperature must be less than enriched flue gas temperature';
// }
// // if (this.o2Enrichment.combAirTemp < this.o2Enrichment.combAirTempEnriched) {
// // //   this.error.combAirTemp = 'Combustion air preheat temperature must be greater than or equal to the oxygen enriched air mixture preheat temperature';
// // }
