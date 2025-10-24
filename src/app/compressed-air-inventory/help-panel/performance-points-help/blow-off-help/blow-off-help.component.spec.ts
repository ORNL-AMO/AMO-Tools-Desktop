import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlowOffHelpComponent } from './blow-off-help.component';

describe('BlowOffHelpComponent', () => {
  let component: BlowOffHelpComponent;
  let fixture: ComponentFixture<BlowOffHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlowOffHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlowOffHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
