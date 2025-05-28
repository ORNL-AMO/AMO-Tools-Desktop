import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionFlowComponent } from './connection-flow.component';

describe('ConnectionFlowComponent', () => {
  let component: ConnectionFlowComponent;
  let fixture: ComponentFixture<ConnectionFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectionFlowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectionFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
