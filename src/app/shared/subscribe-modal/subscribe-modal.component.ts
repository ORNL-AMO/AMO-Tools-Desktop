import { Component, ViewChild } from '@angular/core';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { EmailListSubscribeService } from '../subscribe-toast/email-list-subscribe.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subscribe-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalModule, RouterModule],
  templateUrl: './subscribe-modal.component.html',
  styleUrl: './subscribe-modal.component.css'
})
export class SubscribeModalComponent {
  @ViewChild('subscribeModal', { static: false }) public subscribeModal: ModalDirective;
  
  subscriberEmail: string;
  invalidEmailMessage: string;
  submittedStatus: 'error' | 'success' | 'sending' = undefined;
  submittedStatusSubscription: any;
  constructor(
    private emailSubscribeService: EmailListSubscribeService, private router: Router) { }

  ngOnInit() {
    this.submittedStatusSubscription = this.emailSubscribeService.submittedStatus.subscribe(sentStatus => {
      this.submittedStatus = sentStatus;
    });
  }

  ngAfterViewInit() {
    this.subscribeModal.show();
  }

  ngOnDestroy() {
    this.submittedStatusSubscription.unsubscribe();
    this.emailSubscribeService.submittedStatus.next(undefined);
  }

  privacyNotice() {
    this.router.navigate(['/privacy']);
    this.close();
  }

  checkValid() {
    this.invalidEmailMessage = this.emailSubscribeService.checkEmailValid(this.subscriberEmail);
  }


  submitSubscriber() {
    if (!this.invalidEmailMessage) {
      this.emailSubscribeService.submitSubscriberEmail(this.subscriberEmail).subscribe();
    }
  }

  close() {
    this.emailSubscribeService.showModal.next(false);
    this.subscribeModal.hide();
  }

}
