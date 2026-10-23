import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { InvalidModification } from '../../services/process-heating-validity.service';

@Component({
  selector: 'app-invalid-modification-alert',
  standalone: false,
  templateUrl: './invalid-modification-alert.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvalidModificationAlertComponent {
  readonly modifications = input.required<InvalidModification[]>();
}
