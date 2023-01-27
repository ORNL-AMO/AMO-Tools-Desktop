import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { MeasurMessageData } from '../models/utilities';

@Component({
  selector: 'app-user-message-overlay',
  templateUrl: './user-message-overlay.component.html',
  styleUrls: ['./user-message-overlay.component.css'],
  // host: {'class': 'message-overlay'}
})
export class UserMessageOverlayComponent implements OnInit {
  @Input()
  measurMessageData: MeasurMessageData;
  @Output('emitDismiss')
  emitDismiss = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
    if (this.measurMessageData && this.measurMessageData.dismissButtonText === undefined) {
      this.measurMessageData.dismissButtonText = 'Dismiss';
    }
  }

  dismissMessageOverlay() {
    this.emitDismiss.emit(true)
  }
}
