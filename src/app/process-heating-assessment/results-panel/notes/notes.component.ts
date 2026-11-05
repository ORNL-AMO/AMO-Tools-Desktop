import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { Notes } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';

const NOTE_PLACEHOLDERS: Record<keyof Notes, string> = {
  chargeNotes: 'Add note for charge material',
  wallNotes: 'Add note for wall losses',
  atmosphereNotes: 'Add note for atmosphere losses',
  fixtureNotes: 'Add note for fixture losses',
  openingNotes: 'Add note for opening losses',
  coolingNotes: 'Add note for cooling losses',
  flueGasNotes: 'Add note for flue gas losses',
  leakageNotes: 'Add note for gas leakage',
  extendedNotes: 'Add note for extended surfaces',
  otherNotes: 'Add note for other losses',
  slagNotes: 'Add note for slag loss',
  auxiliaryPowerNotes: 'Add note for aux power',
  energyInputNotes: 'Add note for energy input',
  exhaustGasNotes: 'Add note for exhaust gas',
  energyInputExhaustGasNotes: 'Add note for exhaust gas',
  heatSystemEfficiencyNotes: 'Add note for heat system efficiency',
  operationsNotes: 'Add note for operations changes',
};

@Component({
  selector: 'app-process-heating-notes',
  standalone: false,
  templateUrl: './notes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesComponent {
  private readonly modificationService = inject(ModificationService);

  readonly modificationId = input.required<string>();
  readonly notesKey = input<keyof Notes | undefined>();

  readonly placeholder: Signal<string> = computed(() => {
    const key = this.notesKey();
    return key ? NOTE_PLACEHOLDERS[key] : '';
  });

  readonly note: Signal<string> = computed(() => {
    const key = this.notesKey();
    const modification = this.modificationService.modifications().find(candidate => candidate.id === this.modificationId());
    return (key && modification?.notes?.[key]) || '';
  });

  save(value: string): void {
    const key = this.notesKey();
    if (key) {
      this.modificationService.setModificationNote(this.modificationId(), key, value);
    }
  }
}
