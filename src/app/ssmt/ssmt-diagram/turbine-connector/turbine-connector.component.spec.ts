import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurbineConnectorComponent } from './turbine-connector.component';

describe('TurbineConnectorComponent', () => {
  let component: TurbineConnectorComponent;
  let fixture: ComponentFixture<TurbineConnectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurbineConnectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurbineConnectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
