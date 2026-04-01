import { Component } from '@angular/core';
import { ChillerInventoryBaseComponent } from '../../../results-panel/inventory-table/chiller-inventory-base.component';
import { CompressorChillerTypeEnum } from '../../../../shared/models/process-cooling-assessment';
import { FilterChillerInventoryParams } from '../../../pipes/filter-chiller-inventory.pipe';

@Component({
  selector: 'app-vsd-inventory-table',
  standalone: false,
  templateUrl: './vsd-inventory-table.component.html',
  styleUrl: '../../../results-panel/inventory-table/chiller-inventory-base.component.css',
})
export class VsdInventoryTableComponent extends ChillerInventoryBaseComponent {
  filterInventoryParams: FilterChillerInventoryParams = {
    chillerType: CompressorChillerTypeEnum.CENTRIFUGAL
  };
}
