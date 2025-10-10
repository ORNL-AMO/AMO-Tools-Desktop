import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
@Component({
    selector: 'app-calculator-list',
    templateUrl: './calculator-list.component.html',
    styleUrls: ['./calculator-list.component.css'],
    standalone: false
})
export class CalculatorListComponent implements OnInit {
  @ViewChild('sidebarWrapper', { static: true }) sidebarWrapper!: ElementRef;
 totalScreenWidth: BehaviorSubject<number>;

  constructor(private dashboardService: DashboardService, private router: Router) {
    this.totalScreenWidth = new BehaviorSubject<number>(undefined);
  }


  ngOnInit() {
    // this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
    //   const el = this.sidebarWrapper.nativeElement;
    //   console.log(el, window.innerWidth, el.classList);
    //   const isSmallScreen = window.innerWidth < 1080;

    //   setTimeout(() => {
    //     if (isSmallScreen && el.classList.contains('show-border')) {
    //       el.classList.remove('show-border');
    //     }
    //   }, 0);

    // });

    // this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
    //   const target = event.urlAfterRedirects;
    //   const isSidebarChild = target.startsWith('/calculators/') && target !== '/calculators/process-heating-list';

    //   if (isSidebarChild && window.innerWidth < 1080) {
    //     console.log('Navigated via sidebar child:', target);
    //     // Add logic here (e.g. collapse parent, remove class)
    //   }
    // });

  }

  navigateWithSidebarOptions(url: string) {
    // this.dashboardService.navigateWithSidebarOptions(url);
    this.dashboardService.conditionalNavigate(url);

  }

}
