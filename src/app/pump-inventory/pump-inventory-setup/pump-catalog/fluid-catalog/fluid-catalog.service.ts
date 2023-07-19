import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FluidProperties } from '../../../pump-inventory';

@Injectable()
export class FluidCatalogService {


  constructor(private formBuilder: FormBuilder) { }

  getFormFromFluidProperties(fluidProperties: FluidProperties): FormGroup {
    return this.formBuilder.group({
      fluidType: [fluidProperties.fluidType],
      fluidDensity: [fluidProperties.fluidDensity],
     });
  }

  updateFluidProprtiesFromForm(form: FormGroup, fluidProperties: FluidProperties): FluidProperties {
    fluidProperties.fluidType = form.controls.fluidType.value;
    fluidProperties.fluidDensity = form.controls.fluidDensity.value;
    return fluidProperties;
  }
}
