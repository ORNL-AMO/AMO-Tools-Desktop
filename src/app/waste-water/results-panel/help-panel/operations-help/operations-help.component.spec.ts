import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationsHelpComponent } from './operations-help.component';

describe('OperationsHelpComponent', () => {
  let component: OperationsHelpComponent;
  let fixture: ComponentFixture<OperationsHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperationsHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
