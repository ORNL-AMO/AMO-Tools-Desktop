import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CondensateConnectorComponent } from './condensate-connector.component';

describe('CondensateConnectorComponent', () => {
  let component: CondensateConnectorComponent;
  let fixture: ComponentFixture<CondensateConnectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CondensateConnectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CondensateConnectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
