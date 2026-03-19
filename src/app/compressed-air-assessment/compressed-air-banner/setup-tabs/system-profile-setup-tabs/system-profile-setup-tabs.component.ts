import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-system-profile-setup-tabs',
  standalone: false,
  templateUrl: './system-profile-setup-tabs.component.html',
  styleUrl: './system-profile-setup-tabs.component.css'
})
export class SystemProfileSetupTabsComponent {

  /**
 * Profile Tabs:
 * - setup-profile
 * - profile-summary
 * - profile-graphs
 * - annual-summary
 * - compressor-summary
 */

  constructor(private router: Router, private route: ActivatedRoute) { }


  back() {
    if (this.router.url.includes('setup-profile')) {
      //day type setup
      this.router.navigate(['./baseline/day-types-setup'], { relativeTo: this.route });
    } else if (this.router.url.includes('profile-summary')) {
      this.router.navigate(['./baseline/system-profile-setup/setup-profile'], { relativeTo: this.route });
    } else if (this.router.url.includes('profile-graphs')) {
      this.router.navigate(['./baseline/system-profile-setup/profile-summary'], { relativeTo: this.route });
    } else if (this.router.url.includes('annual-summary')) {
      this.router.navigate(['./baseline/system-profile-setup/profile-graphs'], { relativeTo: this.route });
    } else if (this.router.url.includes('compressor-summary')) {
      this.router.navigate(['./baseline/system-profile-setup/annual-summary'], { relativeTo: this.route });
    }
  }

  continue() {
    if (this.router.url.includes('setup-profile')) {
      this.router.navigate(['./baseline/system-profile-setup/profile-summary'], { relativeTo: this.route });
    } else if (this.router.url.includes('profile-summary')) {
      this.router.navigate(['./baseline/system-profile-setup/profile-graphs'], { relativeTo: this.route });
    } else if (this.router.url.includes('profile-graphs')) {
      this.router.navigate(['./baseline/system-profile-setup/annual-summary'], { relativeTo: this.route });
    } else if (this.router.url.includes('annual-summary')) {
      this.router.navigate(['./baseline/system-profile-setup/compressor-summary'], { relativeTo: this.route });
    } else if (this.router.url.includes('compressor-summary')) {
      //go to end uses
      this.router.navigate(['./baseline/end-uses'], { relativeTo: this.route });
    }
  }
}
