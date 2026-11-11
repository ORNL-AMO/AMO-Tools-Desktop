import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auxiliary-equipment-help',
  standalone: false,
  templateUrl: './auxiliary-equipment-help.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuxiliaryEquipmentHelpComponent {
  readonly currentField = input<string>();

  readonly docsLink = environment.measurDocsUrl;
}
