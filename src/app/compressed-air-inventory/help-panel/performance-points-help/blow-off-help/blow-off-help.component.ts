import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';

@Component({
  selector: 'app-blow-off-help',
  standalone: false,
  templateUrl: './blow-off-help.component.html',
  styleUrl: './blow-off-help.component.css'
})
export class BlowOffHelpComponent {

  focusedField: string;
  focusedFieldSub: Subscription;
  settings: Settings;

  constructor(private compressedAirInventoryService: CompressedAirInventoryService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirInventoryService.settings.getValue();
    this.focusedFieldSub = this.compressedAirInventoryService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  ngOnDestroy() {
    this.focusedFieldSub.unsubscribe();
  }

}
