import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InletConditionsComponent } from './inlet-conditions.component';

describe('InletConditionsComponent', () => {
  let component: InletConditionsComponent;
  let fixture: ComponentFixture<InletConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InletConditionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InletConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
