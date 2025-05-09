import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EmailListSubscribeService } from './email-list-subscribe.service';

@Component({
  selector: 'app-subscribe-toast',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './subscribe-toast.component.html',
  styleUrl: './subscribe-toast.component.css',
  animations: [
    trigger('toast', [
        state('show', style({ top: '0px' })),
        state('hide', style({ top: '-300px' })),
        transition('hide => show', animate('.5s ease')),
        transition('show => hide', animate('.5s ease'))
    ])
],
})
export class SubscribeToastComponent {
  @Output('emitCloseToast')
  emitCloseToast = new EventEmitter<boolean>();
  subscriberEmail: string;
  invalidEmailMessage: string;
  showToast: string = 'hide';
  submittedStatus: 'error' | 'success' | 'sending' = undefined;
  submittedStatusSubscription: any;
  constructor(private cd: ChangeDetectorRef, private router: Router, private emailSubscribeService: EmailListSubscribeService) { }

  ngOnInit() {
    this.submittedStatusSubscription = this.emailSubscribeService.submittedStatus.subscribe(sentStatus => {
      this.submittedStatus = sentStatus;
    });
  }

  ngOnDestroy() {
    this.submittedStatusSubscription.unsubscribe();
    this.emailSubscribeService.submittedStatus.next(undefined);
    this.showToast = 'hide';
  }

  privacyNotice() {
    this.router.navigate(['/privacy']);
    this.closeToast();
  }

  checkValid() {
    this.invalidEmailMessage = this.emailSubscribeService.checkEmailValid(this.subscriberEmail);
  }

  submitSubscriber() {
    if (!this.invalidEmailMessage) {
      this.emailSubscribeService.submitSubscriberEmail(this.subscriberEmail).subscribe();
    }
  }

  ngAfterViewInit(){
    this.showToast = 'show';
    this.cd.detectChanges();
  }

  closeToast() {
    this.showToast = 'hide';
    this.cd.detectChanges();
    setTimeout(() => {
      this.emitCloseToast.emit(true);
    }, 500);
  }
}

