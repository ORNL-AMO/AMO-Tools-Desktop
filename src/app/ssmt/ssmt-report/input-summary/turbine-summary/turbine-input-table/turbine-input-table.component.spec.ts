import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurbineInputTableComponent } from './turbine-input-table.component';

describe('TurbineInputTableComponent', () => {
  let component: TurbineInputTableComponent;
  let fixture: ComponentFixture<TurbineInputTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurbineInputTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurbineInputTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
