import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SystemProperties } from '../../../pump-inventory';

@Injectable()
export class SystemCatalogService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromPumpMotor(systemProperties: SystemProperties): FormGroup {
    return this.formBuilder.group({
      driveType: [systemProperties.driveType],
      flangeConnectionClass: [systemProperties.flangeConnectionClass],
      flangeConnectionSize: [systemProperties.flangeConnectionSize],
      componentId: [systemProperties.componentId],
      system: [systemProperties.system],
      location: [systemProperties.location],
    });
    }

  updatePumpMotorFromForm(form: FormGroup, systemProperties: SystemProperties): SystemProperties {
    systemProperties.driveType = form.controls.driveType.value; 
    systemProperties.flangeConnectionClass = form.controls.flangeConnectionClass.value; 
    systemProperties.flangeConnectionSize = form.controls.flangeConnectionSize.value;
    systemProperties.componentId = form.controls.componentId.value;
    systemProperties.system = form.controls.system.value;
    systemProperties.location = form.controls.location.value;

    return systemProperties;
  }
}