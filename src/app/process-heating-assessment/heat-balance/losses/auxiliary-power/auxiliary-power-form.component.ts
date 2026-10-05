import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { MOTOR_PHASES } from '../../../constants/motor-phases';
import { generateFormControlIds } from '../../../../shared/helperFunctions';
import { Settings } from '../../../../shared/models/settings';
import { AuxiliaryPowerWarnings, getAuxiliaryPowerWarnings } from './auxiliary-power-warnings';
import { AuxiliaryPowerForm, AuxiliaryPowerFormService } from './auxiliary-power-form.service';
import { AuxiliaryPowerItem } from './auxiliary-power.service';

@Component({
  selector: 'app-auxiliary-power-form',
  standalone: false,
  templateUrl: './auxiliary-power-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuxiliaryPowerFormComponent implements OnInit {
  readonly item = input.required<AuxiliaryPowerItem>();
  readonly settings = input.required<Settings>();

  private readonly formService = inject(AuxiliaryPowerFormService);
  private readonly destroyRef = inject(DestroyRef);

  readonly motorPhases = MOTOR_PHASES;
  readonly form = computed(() => this.item().form as AuxiliaryPowerForm);
  readonly controlIds = computed(() => generateFormControlIds(this.form().controls));
  readonly warnings = signal<AuxiliaryPowerWarnings | null>(null);

  ngOnInit(): void {
    this.form().valueChanges
      .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.warnings.set(getAuxiliaryPowerWarnings(this.formService.buildAuxiliaryPowerLoss(this.form()))));
  }
}
