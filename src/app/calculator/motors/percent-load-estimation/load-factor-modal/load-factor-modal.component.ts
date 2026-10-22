import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Settings } from '../../../../shared/models/settings';
import { PercentLoadEstimationService } from '../percent-load-estimation.service';

/**
 * Percent Load Estimation calculator in a modal - emits the estimated load factor (%) on apply
 */
@Component({
  selector: 'app-load-factor-modal',
  templateUrl: './load-factor-modal.component.html',
  styleUrls: ['./load-factor-modal.component.css'],
  standalone: false,
  providers: [PercentLoadEstimationService]
})
export class LoadFactorModalComponent {
  @Input()
  settings: Settings;
  @Output('emitClose')
  emitClose = new EventEmitter<boolean>();
  @Output('emitSave')
  emitSave = new EventEmitter<number>();
  @ViewChild('loadFactorModal', { static: false }) public loadFactorModal: ModalDirective;

  constructor(private percentLoadEstimationService: PercentLoadEstimationService) { }

  ngAfterViewInit() {
    this.loadFactorModal.show();
  }

  hideModal() {
    this.loadFactorModal.hide();
    this.emitClose.emit(true);
  }

  save() {
    const percentLoad: number = this.percentLoadEstimationService.getResults(this.percentLoadEstimationService.fieldMeasurementInputs).percentLoad;
    this.loadFactorModal.hide();
    this.emitSave.emit(Number(percentLoad.toFixed(1)));
  }
}
