import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OneHeaderConnectorComponent } from './one-header-connector.component';

describe('OneHeaderConnectorComponent', () => {
  let component: OneHeaderConnectorComponent;
  let fixture: ComponentFixture<OneHeaderConnectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OneHeaderConnectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OneHeaderConnectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
