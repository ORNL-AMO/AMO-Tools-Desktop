import { inject, Injectable, Signal, signal } from '@angular/core';
import { take } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { WallLossesSurfaceDbService } from '../../../../indexedDb/wall-losses-surface-db.service';
import { WallLoss } from '../../../models/wall-loss';
import { WallLossesSurface } from '../../../../shared/models/materials';
import { Losses } from '../../../models/phast';
import { AssessmentScenario } from '../../../services/process-heating-assessment.service';
import { LossFormItem, LossFormListService } from '../loss-form-list.service';
import { WallLossCalculationService } from './wall-loss-calculation.service';
import { WallLossForm, WallLossesFormService } from './wall-losses-form.service';

export type WallLossItem = LossFormItem<WallLossForm>;

@Injectable()
export class WallLossesService extends LossFormListService<WallLoss, WallLossForm> {
  private readonly wallLossCalculationService = inject(WallLossCalculationService);
  private readonly formService = inject(WallLossesFormService);
  private readonly wallSurfaceDbService = inject(WallLossesSurfaceDbService);

  protected readonly lossKey: keyof Losses = 'wallLosses';

  readonly losses: Signal<WallLossItem[]> = this.items;
  readonly surfaceOptions = signal<WallLossesSurface[]>([]);

  override initialize(scenario: AssessmentScenario = 'baseline'): void {
    super.initialize(scenario);
    this.wallSurfaceDbService.getAllWithObservable()
      .pipe(take(1))
      .subscribe(surfaces => this.surfaceOptions.set(surfaces));
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
