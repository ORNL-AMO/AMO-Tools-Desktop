import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurbineTableComponent } from './turbine-table.component';

describe('TurbineTableComponent', () => {
  let component: TurbineTableComponent;
  let fixture: ComponentFixture<TurbineTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurbineTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurbineTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
