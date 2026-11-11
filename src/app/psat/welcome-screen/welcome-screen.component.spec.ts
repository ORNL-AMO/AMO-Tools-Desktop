import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WelcomeScreenComponent } from './welcome-screen.component';
import { DashboardService } from '../../dashboard/dashboard.service';

describe('WelcomeScreenComponent', () => {
  let component: WelcomeScreenComponent;
  let fixture: ComponentFixture<WelcomeScreenComponent>;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;
  let totalScreenWidth: BehaviorSubject<number>;

  beforeEach(async () => {
    totalScreenWidth = new BehaviorSubject<number>(1200);
    dashboardServiceSpy = jasmine.createSpyObj(
      'DashboardService',
      [],
      { totalScreenWidth }
    );

    await TestBed.configureTestingModule({
      declarations: [WelcomeScreenComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomeScreenComponent);
    component = fixture.componentInstance;
  });

  describe('closePopUp', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('hides the welcome screen immediately', () => {
      component.showWelcomeScreen = true;
      component.closePopUp();
      expect(component.showWelcomeScreen).toBeFalse();
    });

    it('emits emitClose after the close delay', fakeAsync(() => {
      const emitted: boolean[] = [];
      component.emitClose.subscribe((value: boolean) => emitted.push(value));

      component.closePopUp();
      expect(emitted).toEqual([]);

      tick(1500);
      expect(emitted).toEqual([true]);
    }));
  });

  describe('template visibility', () => {
    it('applies the show class once ngAfterViewInit sets showWelcomeScreen true', fakeAsync(() => {
      fixture.detectChanges(); // triggers ngAfterViewInit within this fakeAsync zone
      expect(fixture.nativeElement.querySelector('.welcome-screen').classList.contains('show')).toBeFalse();

      tick(500); // ngAfterViewInit sets showWelcomeScreen true after this delay
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.welcome-screen').classList.contains('show')).toBeTrue();
    }));

    it('hides the top-right nav icons when getScreenWidth is 1067 or less', () => {
      totalScreenWidth.next(1067);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.home-nav-item')).toBeNull();
    });

    it('shows the top-right nav icons when getScreenWidth is greater than 1067', () => {
      totalScreenWidth.next(1200);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.home-nav-item')).not.toBeNull();
    });
  });
});
