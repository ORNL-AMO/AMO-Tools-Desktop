import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertBadgeComponent } from './alert-badge.component';

describe('AlertBadgeComponent', () => {
  let component: AlertBadgeComponent;
  let fixture: ComponentFixture<AlertBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
