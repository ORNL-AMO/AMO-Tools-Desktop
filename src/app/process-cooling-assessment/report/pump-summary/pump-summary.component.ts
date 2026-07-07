import { ChangeDetectionStrategy, ViewChild, ElementRef, WritableSignal, inject, Component } from '@angular/core';
import { PumpSummaryResultsService, PumpSummaryUI } from '../../services/pump-summary-results.service';
import { Observable } from 'rxjs';
import { ModificationService } from '../../services/modification.service';

@Component({
  selector: 'app-pump-summary',
  standalone: false,
  templateUrl: './pump-summary.component.html',
  styleUrls: ['./pump-summary.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PumpSummaryComponent {
  private pumpSummaryResultsService = inject(PumpSummaryResultsService);
  private modificationService = inject(ModificationService);

  @ViewChild('totalsTable', { static: false }) totalsTable: ElementRef;
  totalsTableString: string;
  @ViewChild('pumpingEnergyTable', { static: false }) pumpingEnergyTable: ElementRef;
  pumpingEnergyTableString: string;

  pumpSummaryUI$: Observable<PumpSummaryUI> = this.pumpSummaryResultsService.pumpSummaryUI$;
  invalidModificationIds: WritableSignal<Array<string>> = this.modificationService.invalidModificationIds;

  updateCopyTableString() {
    this.totalsTableString = this.totalsTable?.nativeElement?.innerText;
    this.pumpingEnergyTableString = this.pumpingEnergyTable?.nativeElement?.innerText;
  }

}
