import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiverTankComponent } from './receiver-tank.component';

describe('ReceiverTankComponent', () => {
  let component: ReceiverTankComponent;
  let fixture: ComponentFixture<ReceiverTankComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiverTankComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiverTankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
