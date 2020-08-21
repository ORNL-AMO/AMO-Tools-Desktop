import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationsDetailsComponent } from './operations-details.component';

describe('OperationsDetailsComponent', () => {
  let component: OperationsDetailsComponent;
  let fixture: ComponentFixture<OperationsDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationsDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
