import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeakageHelpComponent } from './leakage-help.component';

describe('LeakageHelpComponent', () => {
  let component: LeakageHelpComponent;
  let fixture: ComponentFixture<LeakageHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeakageHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeakageHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
