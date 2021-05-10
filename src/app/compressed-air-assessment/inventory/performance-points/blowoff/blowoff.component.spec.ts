import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlowoffComponent } from './blowoff.component';

describe('BlowoffComponent', () => {
  let component: BlowoffComponent;
  let fixture: ComponentFixture<BlowoffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlowoffComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlowoffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
