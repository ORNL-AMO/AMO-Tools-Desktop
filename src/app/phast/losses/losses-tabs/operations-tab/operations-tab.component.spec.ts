import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationsTabComponent } from './operations-tab.component';

describe('OperationsTabComponent', () => {
  let component: OperationsTabComponent;
  let fixture: ComponentFixture<OperationsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationsTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
