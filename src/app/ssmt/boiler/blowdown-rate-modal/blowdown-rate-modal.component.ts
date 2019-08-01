import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-blowdown-rate-modal',
  templateUrl: './blowdown-rate-modal.component.html',
  styleUrls: ['./blowdown-rate-modal.component.css'],
  animations: [
    trigger('modal', [
      state('show', style({
        top: '50px'
      })),
      transition('hide => show', animate('.5s ease-in')),
      transition('show => hide', animate('.5s ease-out'))
    ])
  ]
})
export class BlowdownRateModalComponent implements OnInit {
  @Output('emitClose')
  emitClose = new EventEmitter<boolean>();
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  width: number;
  @Input()
  form: FormGroup;

  showModal: string = 'hide';
  blowdownRate: number = 0;
  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      this.showModal = 'show';
    }, 100)
    this.calculate();
  }

  calculate() {
    this.blowdownRate = (this.form.controls.feedwaterConductivity.value / this.form.controls.blowdownConductivity.value) * 100;
  }

  close() {
    this.emitClose.emit(true);
  }

  save() {
    this.form.controls.blowdownRate.patchValue(this.blowdownRate);
    this.emitSave.emit(true);
  }
}
