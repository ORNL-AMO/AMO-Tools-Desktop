import { Component, inject, input, InputSignal } from '@angular/core';
import { ChillerInventoryBaseComponent } from '../../../results-panel/inventory-table/chiller-inventory-base.component';
import { ChillerInventoryItem } from '../../../../shared/models/process-cooling-assessment';
import { Refrigerants, SelectOption, getRefrigerantTypes } from '../../../constants/process-cooling-constants';
import { ModificationService } from '../../../services/modification.service';
import { FilterChillerInventoryParams } from '../../../pipes/filter-chiller-inventory.pipe';

@Component({
  selector: 'app-refrigerant-inventory-table',
  standalone: false,
  templateUrl: './refrigerant-inventory-table.component.html',
  styleUrl: '../../../results-panel/inventory-table/chiller-inventory-base.component.css',
})
export class RefrigerantInventoryTableComponent extends ChillerInventoryBaseComponent {
  private modificationService = inject(ModificationService);

  Refrigerants = Refrigerants;
  refrigerantTypes: SelectOption[] = [{value: null, name: 'None'}, ...getRefrigerantTypes()];
  useOpportunity: InputSignal<boolean> = input(false);
  filterInventoryParams: InputSignal<FilterChillerInventoryParams> = input(null);

  setProposedRefrigerant(chiller: ChillerInventoryItem, proposedRefrigerantType: number) {
    this.processCoolingService.updateAssessmentChiller(chiller.itemId, { proposedRefrigerantType });
    this.modificationService.updateModificationEEM('replaceChillerRefrigerant', {
      useOpportunity: this.useOpportunity()
    });
  }
}
