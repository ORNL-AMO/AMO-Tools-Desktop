import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { SystemInformationFormService } from '../system-information/system-information-form.service';
import { Settings } from '../../shared/models/settings';
import { UpgradeCoolingTowerFans, UseFreeCooling } from '../../shared/models/process-cooling-assessment';

@Injectable()
export class ExploreOpportunitiesFormService {
  private formBuilder: FormBuilder = inject(UntypedFormBuilder);
  private systemInformationService = inject(SystemInformationFormService);

  getIncreaseChilledTempForm(chilledWaterTemperature: number, settings: Settings, baselineChilledWaterTemperature?: number): FormGroup<IncreaseChilledTempForm> {
    // * min comparison vs default - waiting on feedback 2/11
    if (baselineChilledWaterTemperature === undefined) {
      baselineChilledWaterTemperature = chilledWaterTemperature;
    }
    const validators = this.systemInformationService.getChilledWaterTemperatureValidators(settings, baselineChilledWaterTemperature);
    const form: FormGroup<IncreaseChilledTempForm> = this.formBuilder.group({ chilledWaterTemperature: [chilledWaterTemperature, validators] });
    return form;
  }

  getDecreaseCondenserWaterTempForm(condenserWaterTemperature: number, settings: Settings, baselineCondenserWaterTemperature?: number): FormGroup<DecreaseCondenserWaterTempForm> {
    if (baselineCondenserWaterTemperature === undefined) {
      baselineCondenserWaterTemperature = condenserWaterTemperature;
    }
    const validators = this.systemInformationService.getCondenserWaterTempValidators(settings, baselineCondenserWaterTemperature);
    return this.formBuilder.group({ condenserWaterTemperature: [condenserWaterTemperature, validators] });
  }

  getSlidingCondenserWaterTempForm(followingTempDifferential: number, settings: Settings): FormGroup<SlidingCondenserWaterTempForm> {
    const validators = this.systemInformationService.getWaterCooledFollowingTempDifferentialValidators(settings);
    return this.formBuilder.group({ followingTempDifferential: [followingTempDifferential, validators] });
  }

  getApplyVariableSpeedControlForm(chilledWaterVariableFlow: boolean, condenserWaterVariableFlow: boolean): FormGroup<ApplyVariableSpeedControlForm> {
    return this.formBuilder.group({
      chilledWaterVariableFlow: [chilledWaterVariableFlow],
      condenserWaterVariableFlow: [condenserWaterVariableFlow]
    });
  }


  getUpgradeCoolingTowerFanForm(formValues: UpgradeCoolingTowerFans): FormGroup<UpgradeCoolingTowerFanForm> {
    return this.formBuilder.group({
      towerType: [formValues.towerType],
      numberOfFans: [formValues.numberOfFans],
      fanSpeedType: [formValues.fanSpeedType]
    });
  }

  getReplaceChillerRefrigerantForm(proposedRefrigerantType: number): FormGroup<ReplaceChillerRefrigerantForm> {
    return this.formBuilder.group({
      proposedRefrigerantType: [proposedRefrigerantType]
    });
  }

  getUseFreeCoolingForm(formValues: UseFreeCooling, settings: Settings): FormGroup<UseFreeCoolingForm> {
    const hexValidators = formValues.isHEXRequired ? this.systemInformationService.getHexApproachTempValidators(settings) : [];
    return this.formBuilder.group({
      usesFreeCooling: [formValues.usesFreeCooling],
      isHEXRequired: [formValues.isHEXRequired],
      HEXApproachTemp: [formValues.HEXApproachTemp, hexValidators]
    });
  }

}

export interface IncreaseChilledTempForm {
  chilledWaterTemperature: FormControl<number>;
}

export interface SlidingCondenserWaterTempForm {
  followingTempDifferential: FormControl<number>;
}

export interface ApplyVariableSpeedControlForm {
  chilledWaterVariableFlow: FormControl<boolean>;
  condenserWaterVariableFlow: FormControl<boolean>;
}

export interface DecreaseCondenserWaterTempForm {
  condenserWaterTemperature: FormControl<number>;
}

export interface UpgradeCoolingTowerFanForm {
  towerType: FormControl<number>;
  numberOfFans: FormControl<number>;
  fanSpeedType: FormControl<number>;
}

export interface UseFreeCoolingForm {
  usesFreeCooling: FormControl<boolean>;
  isHEXRequired: FormControl<boolean>;
  HEXApproachTemp: FormControl<number>;
}

export interface ReplaceChillerRefrigerantForm {
  proposedRefrigerantType: FormControl<number>;
}
