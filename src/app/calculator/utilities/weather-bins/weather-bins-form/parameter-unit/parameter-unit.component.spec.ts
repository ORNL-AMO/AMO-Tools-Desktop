import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterUnitComponent } from './parameter-unit.component';

describe('ParameterUnitComponent', () => {
  let component: ParameterUnitComponent;
  let fixture: ComponentFixture<ParameterUnitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParameterUnitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
