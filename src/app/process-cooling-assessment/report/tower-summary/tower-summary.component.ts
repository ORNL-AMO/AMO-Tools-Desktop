import { Component, ElementRef, inject, ViewChild, WritableSignal } from '@angular/core';
import { TowerSummaryService, TowerSummaryUI } from '../../services/tower-summary.service';
import { Observable } from 'rxjs';
import { ModificationService } from '../../services/modification.service';

@Component({
  selector: 'app-tower-summary',
  standalone: false,
  templateUrl: './tower-summary.component.html',
  styleUrl: './tower-summary.component.css'
})
export class TowerSummaryComponent {
  private readonly towerSummaryService = inject(TowerSummaryService);
  private modificationService = inject(ModificationService);

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  copyTableString: any;

  readonly towerSummaryUI$: Observable<TowerSummaryUI> = this.towerSummaryService.towerSummaryUI$;
  invalidModificationIds: WritableSignal<Array<string>> = this.modificationService.invalidModificationIds;

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }
}
