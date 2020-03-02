import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  animations: [
    trigger('toast', [
      state('show', style({
        bottom: '20px'
      })),
      transition('hide => show', animate('.5s ease-in')),
      transition('show => hide', animate('.5s ease-out'))
    ])
  ]
})
export class ToastComponent implements OnInit {
  @Input()
  title: string;
  @Input()
  body: string;
  @Output('emitCloseToast')
  emitCloseToast = new EventEmitter<boolean>();
  @Input()
  setTimeoutVal: number;
  @Input()
  toastClass: string;
  @Input()
  showDisableFooter: boolean;
  @Output('emitDisable')
  emitDisable = new EventEmitter<boolean>();

  showToast: string = 'hide';
  destroyToast: boolean = false;
  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      this.showToast = 'show';
    }, 100);

    if (this.setTimeoutVal) {
      setTimeout(() => {
        this.closeToast();
      }, this.setTimeoutVal);
    }
  }


  closeToast() {
    this.showToast = 'hide';
    setTimeout(() => {
      this.destroyToast = true;
      this.emitCloseToast.emit(true);
    }, 500);
  }

  disable() {
    this.showToast = 'hide';
    setTimeout(() => {
      this.destroyToast = true;
      this.emitDisable.emit(true);
    }, 500);
  }
}
