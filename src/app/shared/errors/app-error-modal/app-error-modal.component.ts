import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { MeasurFormattedError } from '../MeasurErrorHandler';
import { AppErrorService } from '../app-error.service';


@Component({
    selector: 'app-error-modal',
    templateUrl: './app-error-modal.component.html',
    styleUrl: './app-error-modal.component.css',
    standalone: false
})
export class AppErrorModalComponent {
  @Output('emitModalClosed')
  modalClosed = new EventEmitter<boolean>();
  @ViewChild('appErrorModal', { static: false }) public appErrorModal: ModalDirective;
  onHiddenSubscription: Subscription;

  measurFormattedError: MeasurFormattedError;

  constructor(private appErrorService: AppErrorService) {}

  ngOnInit() {
    this.measurFormattedError = this.appErrorService.measurFormattedError.getValue();
  }

  ngOnDestroy() {
    if (this.onHiddenSubscription) {
      this.onHiddenSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.appErrorModal.show();
    this.onHiddenSubscription = this.appErrorModal.onHidden.subscribe(() => {
      this.close()
    });
  }

  close() {
    this.appErrorModal.hide();
    this.modalClosed.emit(true)
  }

}
