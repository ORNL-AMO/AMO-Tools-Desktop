import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { OperatingHours } from '../models/operations';
import { OperatingHoursModalService } from './operating-hours-modal.service';
import { UntypedFormGroup, AbstractControl } from '@angular/forms';

@Component({
    selector: 'app-operating-hours-modal',
    templateUrl: './operating-hours-modal.component.html',
    styleUrls: ['./operating-hours-modal.component.css'],
    animations: [
        trigger('modal', [
            state('show', style({ top: '50px' })),
            state('hide', style({ top: '-300px' })),
            transition('hide => show', animate('500ms ease-in')),
            transition('show => hide', animate('500ms ease-out'))
        ])
    ],
    standalone: false
})
export class OperatingHoursModalComponent implements OnInit {
  @Output('emitClose')
  emitClose = new EventEmitter<boolean>();
  @Output('emitSave')
  emitSave = new EventEmitter<OperatingHours>();
  @Input()
  width: number;
  @Input()
  operatingHours: OperatingHours;
  @Input()
  showMinutesSeconds: boolean;

  showModal: string = 'hide';
  operatingHoursForm: UntypedFormGroup;
  constructor(private operatingHoursModalService: OperatingHoursModalService) { }

  ngOnInit() {
    if (this.width < 300) {
      this.width = 300;
    }
    setTimeout(() => {
      this.showModal = 'show';
    }, 100)
    if (!this.operatingHours) {
      this.operatingHours = {
        weeksPerYear: 52.14,
        daysPerWeek: 7,
        hoursPerDay: 24,
        minutesPerHour: 60,
        secondsPerMinute: 60,
        hoursPerYear: 8760
      };
    }
    if(!this.operatingHours.weeksPerYear){
      this.operatingHours.weeksPerYear = 52.14;
    }
    if(!this.operatingHours.daysPerWeek){
      this.operatingHours.daysPerWeek = 7;
    }
    if(!this.operatingHours.hoursPerDay){
      this.operatingHours.hoursPerDay = 24;
    }
    if(!this.operatingHours.minutesPerHour){
      this.operatingHours.minutesPerHour = 60;
    }
    if(!this.operatingHours.secondsPerMinute){
      this.operatingHours.secondsPerMinute = 60;
    }
    
    this.operatingHoursForm = this.operatingHoursModalService.getFormFromObj(this.operatingHours);
    this.calculatHrsPerYear();
  }

  calculatHrsPerYear() {
    this.operatingHours = this.operatingHoursModalService.getObjectFromForm(this.operatingHoursForm);
  }

  addOne(control: AbstractControl) {
    let value: number = control.value + 1;
    control.patchValue(value);
    this.calculatHrsPerYear();
  }

  subtractOne(control: AbstractControl) {
    let value: number = control.value - 1;
    control.patchValue(value);
    this.calculatHrsPerYear();
  }

  close() {
    this.emitClose.emit(true);
  }

  save() {
    this.showModal = 'hide';
    setTimeout(() => {
      this.emitSave.emit(this.operatingHours);
    }, 500)
  }
}
