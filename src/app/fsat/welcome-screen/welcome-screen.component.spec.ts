import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { WelcomeScreenComponent } from './welcome-screen.component';
import { DashboardService } from '../../dashboard/dashboard.service';

describe('WelcomeScreenComponent', () => {
  let component: WelcomeScreenComponent;
  let fixture: ComponentFixture<WelcomeScreenComponent>;
  let totalScreenWidth: BehaviorSubject<number>;

  beforeEach(async () => {
    totalScreenWidth = new BehaviorSubject<number>(1400);
    const dashboardServiceSpy = jasmine.createSpyObj('DashboardService', [], { totalScreenWidth });

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [WelcomeScreenComponent],
      providers: [{ provide: DashboardService, useValue: dashboardServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  /** Must be called inside fakeAsync: ngAfterViewInit defers showing the screen with setTimeout. */
  function createComponent(): void {
    fixture = TestBed.createComponent(WelcomeScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const navItemCount = (): number => fixture.nativeElement.querySelectorAll('nav .home-nav-item').length;

  describe('initialization', () => {
    it('shows the welcome screen after the view initializes', fakeAsync(() => {
      createComponent();
      expect(component.showWelcomeScreen).toBeFalse();
      expect(fixture.nativeElement.querySelector('.welcome-screen.show')).toBeNull();

      tick(500);
      fixture.detectChanges();

      expect(component.showWelcomeScreen).toBeTrue();
      expect(fixture.nativeElement.querySelector('.welcome-screen.show')).not.toBeNull();
    }));
  });

  describe('closePopUp', () => {
    it('hides the screen and emits close after the animation delay', fakeAsync(() => {
      createComponent();
      tick(500);
      const emitted: boolean[] = [];
      component.emitClose.subscribe((v: boolean) => emitted.push(v));

      component.closePopUp();
      expect(component.showWelcomeScreen).toBeFalse();
      expect(emitted).toEqual([]);

      tick(1500);
      expect(emitted).toEqual([true]);
    }));
  });

  describe('template visibility', () => {
    it('shows the banner navigation items on wide screens', fakeAsync(() => {
      totalScreenWidth.next(1070);
      createComponent();
      tick(500);

      expect(navItemCount()).toBe(4);
      expect(fixture.nativeElement.querySelector('nav .fa-book')).not.toBeNull();
    }));

    it('hides the banner navigation items at the width threshold', fakeAsync(() => {
      totalScreenWidth.next(1069);
      createComponent();
      tick(500);

      expect(navItemCount()).toBe(0);
    }));

    it('hides the banner navigation items when the screen width is unknown', fakeAsync(() => {
      totalScreenWidth.next(undefined);
      createComponent();
      tick(500);

      expect(navItemCount()).toBe(0);
    }));

    it('updates the navigation items when the screen width changes', fakeAsync(() => {
      totalScreenWidth.next(800);
      createComponent();
      tick(500);
      expect(navItemCount()).toBe(0);

      totalScreenWidth.next(1400);
      fixture.detectChanges();
      expect(navItemCount()).toBe(4);
    }));

    it('always renders the welcome content', fakeAsync(() => {
      totalScreenWidth.next(800);
      createComponent();
      tick(500);

      expect(fixture.nativeElement.querySelector('.welcome-content h1')).not.toBeNull();
    }));
  });
});
