import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackbarNotificationComponent } from './snackbar-notification.component';

describe('SnackbarNotificationComponent', () => {
  let component: SnackbarNotificationComponent;
  let fixture: ComponentFixture<SnackbarNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnackbarNotificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SnackbarNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
