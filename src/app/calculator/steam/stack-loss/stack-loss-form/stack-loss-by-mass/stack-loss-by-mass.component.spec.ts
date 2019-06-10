import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StackLossByMassComponent } from './stack-loss-by-mass.component';

describe('StackLossByMassComponent', () => {
  let component: StackLossByMassComponent;
  let fixture: ComponentFixture<StackLossByMassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StackLossByMassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StackLossByMassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
