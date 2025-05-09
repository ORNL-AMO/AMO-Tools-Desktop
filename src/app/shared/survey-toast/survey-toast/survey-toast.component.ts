import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MeasurSurveyService } from '../../measur-survey/measur-survey.service';

@Component({
    selector: 'app-survey-toast',
    templateUrl: './survey-toast.component.html',
    styleUrl: './survey-toast.component.css',
    standalone: false,
    animations: [
        trigger('toast', [
            state('show', style({ top: '0px' })),
            state('hide', style({ top: '-300px' })),
            transition('hide => show', animate('.5s ease')),
            transition('show => hide', animate('.5s ease'))
        ])
    ],
})
export class SurveyToastComponent {
  @Output('emitCloseToast')
  emitCloseToast = new EventEmitter<boolean>();

  showSurveyToast: string = 'hide';
  constructor(private cd: ChangeDetectorRef, 
    private measurSurveyService: MeasurSurveyService) { }

  ngOnInit() {
  }

  showSurvey() {
    this.measurSurveyService.showSurveyModal.next(true);
    this.closeToast();
  }

  ngOnDestroy() {
    this.showSurveyToast = 'hide';
  }

  ngAfterViewInit(){
    this.showSurveyToast = 'show';
    this.cd.detectChanges();
  }

  closeToast() {
    this.showSurveyToast = 'hide';
    this.cd.detectChanges();
    setTimeout(() => {
      this.emitCloseToast.emit(true);
    }, 500);
  }
}
