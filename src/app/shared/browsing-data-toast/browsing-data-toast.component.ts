import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-browsing-data-toast',
  templateUrl: './browsing-data-toast.component.html',
  styleUrls: ['./browsing-data-toast.component.css'],
  animations: [
    trigger('toastAnimate', [
      state('show', style({ top: '0px' })),
      state('hide', style({ top: '-300px' })),
      transition('hide => show', animate('.5s ease')),
      transition('show => hide', animate('.5s ease'))
    ])
  ]
})
export class BrowsingDataToastComponent {
  @Output('emitClose')
  emitClose = new EventEmitter<boolean>();
  
  toastAnimate: string = 'hide';

  constructor(private cd: ChangeDetectorRef, private router: Router) { }

  ngOnInit() {
  }
  
  ngAfterViewInit(){
    this.toastAnimate = 'show';
    this.cd.detectChanges();
  }

  routeToPrivacyNotice() {
    this.router.navigateByUrl('/privacy');
    this.closeToast();
  }

  routeToDataStorage() {
    this.router.navigateByUrl('/data-and-backup');
    this.closeToast();
  }

  closeToast() {
    this.toastAnimate = 'hide';
    this.cd.detectChanges();
    setTimeout(() => {
      this.emitClose.emit(true);
    }, 500);
  }

}
