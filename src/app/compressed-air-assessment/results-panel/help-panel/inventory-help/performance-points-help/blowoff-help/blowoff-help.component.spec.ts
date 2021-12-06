import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlowoffHelpComponent } from './blowoff-help.component';

describe('BlowoffHelpComponent', () => {
  let component: BlowoffHelpComponent;
  let fixture: ComponentFixture<BlowoffHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlowoffHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlowoffHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
