import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-fla-modal',
    templateUrl: './fla-modal.component.html',
    styleUrls: ['./fla-modal.component.css'],
    standalone: false
})
export class FlaModalComponent implements OnInit {

  @Output('closeModal')
  closeModal = new EventEmitter<number>();
  @Input()
  settings: Settings;
  fullLoadAmps: number;

  constructor() { }

  ngOnInit(): void {
  }
  
  setFullLoadAmps(fullLoadAmps: number) {
    this.fullLoadAmps =  Number(fullLoadAmps.toFixed(1));
  }

  closeFullLoadAmpsModal() {
    this.closeModal.emit(undefined);
  }
  
  saveFullLoadAmps() {
    this.closeModal.emit(this.fullLoadAmps);
  }

}
