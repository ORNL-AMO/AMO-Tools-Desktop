import { inject, Injectable, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { ExtendedSurface } from '../../../models/extended-surface';
import { WallLoss } from '../../../models/wall-loss';
import { Losses } from '../../../models/phast';
import { LossFormItem, LossFormListService } from '../loss-form-list.service';
import { WallLossCalculationService } from '../wall-losses/wall-loss-calculation.service';
import { ExtendedSurfaceForm, ExtendedSurfaceFormService } from './extended-surface-form.service';

export type ExtendedSurfaceItem = LossFormItem<ExtendedSurfaceForm>;

@Injectable()
export class ExtendedSurfaceService extends LossFormListService<ExtendedSurface, ExtendedSurfaceForm> {
  private readonly wallLossCalculationService = inject(WallLossCalculationService);
  private readonly formService = inject(ExtendedSurfaceFormService);

  protected readonly lossKey: keyof Losses = 'extendedSurfaces';

  readonly surfaces: Signal<ExtendedSurfaceItem[]> = this.items;

  protected buildForm(surface: ExtendedSurface): ExtendedSurfaceForm {
    return this.formService.getExtendedSurfaceForm(surface);
  }

  protected buildLoss(form: ExtendedSurfaceForm): ExtendedSurface {
    return this.formService.buildExtendedSurface(form);
  }

  protected calculateResult(form: ExtendedSurfaceForm, settings: Settings): number | null {
    const extSurface = this.formService.buildExtendedSurface(form);
    /** Extended surface reuses the wall-loss WASM with hardcoded aerodynamic assumptions. */
    const asWallLoss: WallLoss = {
      surfaceArea: extSurface.surfaceArea,
      ambientTemperature: extSurface.ambientTemperature,
      surfaceTemperature: extSurface.surfaceTemperature,
      surfaceEmissivity: extSurface.surfaceEmissivity,
      windVelocity: 5,
      correctionFactor: 1,
      conditionFactor: 1,
    };
    const result = this.wallLossCalculationService.calculate(asWallLoss, settings);
    return isNaN(result) ? null : result;
  }
}
