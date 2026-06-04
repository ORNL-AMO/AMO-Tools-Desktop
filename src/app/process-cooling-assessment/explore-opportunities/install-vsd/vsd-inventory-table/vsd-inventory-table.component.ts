import { Component, inject, input, InputSignal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChillerInventoryBaseComponent } from '../../../results-panel/inventory-table/chiller-inventory-base.component';
import { ChillerInventoryItem, CompressorChillerTypeEnum, Modification } from '../../../../shared/models/process-cooling-assessment';
import { FilterChillerInventoryParams } from '../../../pipes/filter-chiller-inventory.pipe';
import { ModificationService } from '../../../services/modification.service';

@Component({
  selector: 'app-vsd-inventory-table',
  standalone: false,
  templateUrl: './vsd-inventory-table.component.html',
  styleUrl: '../../../results-panel/inventory-table/chiller-inventory-base.component.css',
})
export class VsdInventoryTableComponent extends ChillerInventoryBaseComponent implements OnInit {
  private modificationService = inject(ModificationService);

  useOpportunity: InputSignal<boolean> = input(false);
  filterInventoryParams: FilterChillerInventoryParams = {
    chillerType: CompressorChillerTypeEnum.CENTRIFUGAL
  };
  chillerIds: string[] = [];

  override ngOnInit(): void {
    super.ngOnInit();
    
    this.modificationService.selectedModification$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((modification: Modification) => {
      if (modification) {
        this.chillerIds = modification.installVSDOnCentrifugalCompressors?.chillerIds ?? [];
      }
    });
  }

  isVsdSelected(itemId: string): boolean {
    return this.chillerIds.includes(itemId);
  }

  setInstallVSD(chiller: ChillerInventoryItem, checked: boolean) {
    let chillerIds: string[];
    if (checked) {
      chillerIds = [...this.chillerIds, chiller.itemId];
    } else {
      chillerIds = this.chillerIds.filter(id => id !== chiller.itemId);
    }
    this.modificationService.updateModificationEEM('installVSDOnCentrifugalCompressors', {
      chillerIds,
      useOpportunity: this.useOpportunity()
    });
  }
}
