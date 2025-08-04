import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationsHelpComponent } from './operations-help.component';

describe('OperationsHelpComponent', () => {
  let component: OperationsHelpComponent;
  let fixture: ComponentFixture<OperationsHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationsHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
