import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-browsing-data-toast',
  templateUrl: './browsing-data-toast.component.html',
  styleUrls: ['./browsing-data-toast.component.css'],
  animations: [
    trigger('toast', [
      state('show', style({
        top: '20px'
      })),
      transition('hide => show', animate('.5s ease-in')),
      transition('show => hide', animate('.5s ease-out'))
    ])
  ]
})
export class BrowsingDataToastComponent {
  @Output('emitClose')
  emitClose = new EventEmitter<boolean>();
  
  showBrowsingDataToast: string = 'hide';

  constructor(private cd: ChangeDetectorRef, private router: Router) { }

  ngOnInit() {
  }
  
  ngAfterViewInit(){
    this.showBrowsingDataToast = 'show';
    this.cd.detectChanges();
  }

  routeToPrivacyNotice() {
    this.router.navigateByUrl('/privacy');
    this.closeToast();
  }

  closeToast() {
    this.showBrowsingDataToast = 'hide';
    this.cd.detectChanges();
    setTimeout(() => {
      this.emitClose.emit(true);
    }, 500);
  }

}
