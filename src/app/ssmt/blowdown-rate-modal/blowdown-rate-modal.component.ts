import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { UntypedFormGroup } from '@angular/forms';
import { BoilerBlowdownRateService } from '../../calculator/steam/boiler-blowdown-rate/boiler-blowdown-rate.service';

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
  form: UntypedFormGroup;

  showModal: string = 'hide';
  blowdownRate: number = 0;
  constructor(private boilerBlowdownRateService: BoilerBlowdownRateService) { }

  ngOnInit() {
    setTimeout(() => {
      this.showModal = 'show';
    }, 100)
    this.calculate();
  }

  calculate() {
    if (this.form.controls.feedwaterConductivity.value != undefined && this.form.controls.blowdownConductivity.value != undefined) {
      this.blowdownRate = this.boilerBlowdownRateService.calculateBlowdownRate(this.form.controls.feedwaterConductivity.value, this.form.controls.blowdownConductivity.value) * 100;
    } else {
      this.blowdownRate = 0;
    }
  }

  close() {
    this.emitClose.emit(true);
  }

  save() {
    this.form.controls.blowdownRate.patchValue(Number(this.blowdownRate.toFixed(3)));
    this.emitSave.emit(true);
  }
}
