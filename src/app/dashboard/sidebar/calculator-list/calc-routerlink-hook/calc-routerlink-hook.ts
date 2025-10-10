import { Directive, Input, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

// Mimics routerlink but forces a rerender on small screens
// Used to collapse sidebar children when navigating to pre-assessment on small screens
@Directive({
  selector: '[routerLinkHook]',
  standalone: true
})
export class RouterLinkHookDirective {
  @Input('routerLinkHook') route!: string;

  constructor(private router: Router, private routerLink: RouterLink) {}

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    const isSmallScreen = window.innerWidth < 1080;
    const route = this.router.serializeUrl(this.routerLink.urlTree); // Get the target route from RouterLink
    if (isSmallScreen) {
        this.router.navigate([route], {
            queryParams: { reload: Date.now() } // Add a dummy query param to force reload
        });
    }
  }
}
