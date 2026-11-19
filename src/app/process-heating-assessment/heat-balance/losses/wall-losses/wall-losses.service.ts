import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Settings } from '../../../../shared/models/settings';
import { WallLossesSurfaceDbService } from '../../../../indexedDb/wall-losses-surface-db.service';
import { WallLoss } from '../../../../shared/models/phast/losses/wallLoss';
import { WallLossesSurface } from '../../../../shared/models/materials';
import { Losses } from '../../../models/phast';
import { LossFormItem, LossFormListService } from '../loss-form-list.service';
import { WallLossCalculationService } from './wall-loss-calculation.service';
import { WallLossForm, WallLossesFormService, NEW_WALL_LOSS } from './wall-losses-form.service';

export type WallLossItem = LossFormItem<WallLossForm>;

@Injectable()
export class WallLossesService extends LossFormListService<WallLoss, WallLossForm> {
  private readonly wallLossCalculationService = inject(WallLossCalculationService);
  private readonly formService = inject(WallLossesFormService);
  private readonly wallSurfaceDbService = inject(WallLossesSurfaceDbService);

  protected readonly lossKey: keyof Losses = 'wallLosses';

  readonly losses: Signal<WallLossItem[]> = this.items;
  readonly surfaceOptions: Signal<WallLossesSurface[]> = toSignal(this.wallSurfaceDbService.dbWallLossesSurfaceMaterials, { requireSync: true });

  protected override newLoss(): WallLoss {
    return NEW_WALL_LOSS;
  }

  protected buildForm(loss: WallLoss): WallLossForm {
    return this.formService.getWallLossForm(loss);
  }

  protected buildLoss(form: WallLossForm): WallLoss {
    return this.formService.buildWallLoss(form);
  }

  protected calculateResult(form: WallLossForm, settings: Settings): number {
    const wallLoss = this.formService.buildWallLoss(form);
    return this.wallLossCalculationService.calculate(wallLoss, settings);
  }
}
