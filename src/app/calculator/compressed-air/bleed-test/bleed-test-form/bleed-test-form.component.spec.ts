import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BleedTestFormComponent } from './bleed-test-form.component';

describe('BleedTestFormComponent', () => {
  let component: BleedTestFormComponent;
  let fixture: ComponentFixture<BleedTestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BleedTestFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BleedTestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
