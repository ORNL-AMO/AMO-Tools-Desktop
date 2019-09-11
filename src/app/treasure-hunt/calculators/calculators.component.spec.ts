import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculatorsComponent } from './calculators.component';

describe('CalculatorsComponent', () => {
  let component: CalculatorsComponent;
  let fixture: ComponentFixture<CalculatorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculatorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
