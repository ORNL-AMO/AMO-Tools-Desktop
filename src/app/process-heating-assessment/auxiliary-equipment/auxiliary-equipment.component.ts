import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-auxiliary-equipment',
  standalone: false,
  templateUrl: './auxiliary-equipment.component.html',
  styleUrl: './auxiliary-equipment.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuxiliaryEquipmentComponent {}
