import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TowerSummaryService, TowerSummaryUI } from '../../services/tower-summary.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tower-summary',
  standalone: false,
  templateUrl: './tower-summary.component.html',
  styleUrl: './tower-summary.component.css'
})
export class TowerSummaryComponent {
  private readonly towerSummaryService = inject(TowerSummaryService);

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  copyTableString: any;

  readonly towerSummaryUI$: Observable<TowerSummaryUI> = this.towerSummaryService.towerSummaryUI$;

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }
}
