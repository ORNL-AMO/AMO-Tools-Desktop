import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeakageFormComponent } from './leakage-form.component';

describe('LeakageFormComponent', () => {
  let component: LeakageFormComponent;
  let fixture: ComponentFixture<LeakageFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeakageFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeakageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
