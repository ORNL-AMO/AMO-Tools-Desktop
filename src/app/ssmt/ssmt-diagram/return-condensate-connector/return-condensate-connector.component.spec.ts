import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnCondensateConnectorComponent } from './return-condensate-connector.component';

describe('ReturnCondensateConnectorComponent', () => {
  let component: ReturnCondensateConnectorComponent;
  let fixture: ComponentFixture<ReturnCondensateConnectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReturnCondensateConnectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReturnCondensateConnectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
