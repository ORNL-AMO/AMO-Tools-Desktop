import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeakageComponent } from './leakage.component';

describe('LeakageComponent', () => {
  let component: LeakageComponent;
  let fixture: ComponentFixture<LeakageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeakageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeakageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
