import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedSludgeData } from '../../shared/models/waste-water';

@Injectable()
export class ActivatedSludgeFormService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(obj: ActivatedSludgeData): FormGroup {
    let MLSSparValidators: Array<ValidatorFn> = [];
    let DefinedSRTValidators: Array<ValidatorFn> = [];
    if(obj.CalculateGivenSRT == true){
      DefinedSRTValidators = [Validators.required, Validators.min(0)];
    }else{
      MLSSparValidators = [Validators.required, Validators.min(0)];
    }

    let form: FormGroup = this.formBuilder.group({
      Temperature: [obj.Temperature, [Validators.required, Validators.min(0)]],
      So: [obj.So, [Validators.required, Validators.min(0)]],
      Volume: [obj.Volume, [Validators.required, Validators.min(0)]],
      FlowRate: [obj.FlowRate, [Validators.required, Validators.min(0)]],
      InertVSS: [obj.InertVSS, [Validators.required, Validators.min(0)]],
      OxidizableN: [obj.OxidizableN, [Validators.required, Validators.min(0)]],
      Biomass: [obj.Biomass, [Validators.required, Validators.min(0), Validators.max(1)]],
      InfluentTSS: [obj.InfluentTSS, [Validators.required, Validators.min(0)]],
      InertInOrgTSS: [obj.InertInOrgTSS, [Validators.required, Validators.min(0)]],
      EffluentTSS: [obj.EffluentTSS, [Validators.required, Validators.min(0)]],
      RASTSS: [obj.RASTSS, [Validators.required, Validators.min(0)]],
      MLSSpar: [obj.MLSSpar, MLSSparValidators],
      FractionBiomass: [obj.FractionBiomass, [Validators.required, Validators.min(0), Validators.max(1)]],
      BiomassYeild: [obj.BiomassYeild, [Validators.required, Validators.min(0), Validators.max(1)]],
      HalfSaturation: [obj.HalfSaturation, [Validators.required, Validators.min(0)]],
      MicrobialDecay: [obj.MicrobialDecay, [Validators.required, Validators.min(0)]],
      MaxUtilizationRate: [obj.MaxUtilizationRate, [Validators.required, Validators.min(0)]],
      CalculateGivenSRT: [obj.CalculateGivenSRT, [Validators.required]],
      DefinedSRT: [obj.DefinedSRT, DefinedSRTValidators]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getObjFromForm(form: FormGroup): ActivatedSludgeData {
    return {
      Temperature: form.controls.Temperature.value,
      So: form.controls.So.value,
      Volume: form.controls.Volume.value,
      FlowRate: form.controls.FlowRate.value,
      InertVSS: form.controls.InertVSS.value,
      OxidizableN: form.controls.OxidizableN.value,
      Biomass: form.controls.Biomass.value,
      InfluentTSS: form.controls.InfluentTSS.value,
      InertInOrgTSS: form.controls.InertInOrgTSS.value,
      EffluentTSS: form.controls.EffluentTSS.value,
      RASTSS: form.controls.RASTSS.value,
      MLSSpar: form.controls.MLSSpar.value,
      FractionBiomass: form.controls.FractionBiomass.value,
      BiomassYeild: form.controls.BiomassYeild.value,
      HalfSaturation: form.controls.HalfSaturation.value,
      MicrobialDecay: form.controls.MicrobialDecay.value,
      MaxUtilizationRate: form.controls.MaxUtilizationRate.value,
      CalculateGivenSRT: form.controls.CalculateGivenSRT.value,
      DefinedSRT: form.controls.DefinedSRT.value
    }
  }
}
