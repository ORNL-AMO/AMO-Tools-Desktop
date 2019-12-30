import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculatorsListComponent } from './calculators-list.component';

describe('CalculatorsListComponent', () => {
  let component: CalculatorsListComponent;
  let fixture: ComponentFixture<CalculatorsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculatorsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculatorsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
