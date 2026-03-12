import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-baseline-system-profile-setup',
  standalone: false,
  templateUrl: './baseline-system-profile-setup.component.html',
  styleUrl: './baseline-system-profile-setup.component.css'
})
export class BaselineSystemProfileSetupComponent {

  showProfileSetupForm: boolean;
  eventsSub: Subscription;
  constructor(private router: Router) {
  }

  ngOnInit() {
    this.eventsSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setShowProfileSetupForm();
      }
    });
    //event doesn't fire on init
    this.setShowProfileSetupForm();
  }

  ngOnDestroy(){
    this.eventsSub.unsubscribe();
  }

  setShowProfileSetupForm() {
    //not annual summary or compressor summary
    this.showProfileSetupForm = this.router.url.includes('annual-summary') == false && this.router.url.includes('compressor-summary') == false;
  }


}
