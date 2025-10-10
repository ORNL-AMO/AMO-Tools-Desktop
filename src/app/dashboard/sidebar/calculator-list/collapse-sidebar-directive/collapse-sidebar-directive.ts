import { Directive, Input, HostListener } from '@angular/core';
import { DashboardService } from '../../../dashboard.service';
// An attribute directive which modifies the behavior of an existing element
// Used to collapse sidebar when navigating to pre-assessment on small screens
@Directive({
  selector: '[collapseSidebarDirective]',
  standalone: true
})
export class CollapseSidebarDirective {
  @Input('collapseSidebarDirective') route!: string;

  constructor(private dashboardService: DashboardService,) {}

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    const isSmallScreen = window.innerWidth < 1080;
    if (isSmallScreen) {
        this.dashboardService.collapseSidebar.next(true);
    }
  }
}
