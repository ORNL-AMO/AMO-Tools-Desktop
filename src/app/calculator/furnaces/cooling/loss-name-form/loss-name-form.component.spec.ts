import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LossNameFormComponent } from './loss-name-form.component';

describe('LossNameFormComponent', () => {
  let component: LossNameFormComponent;
  let fixture: ComponentFixture<LossNameFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LossNameFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LossNameFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
