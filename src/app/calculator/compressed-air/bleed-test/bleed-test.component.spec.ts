import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BleedTestComponent } from './bleed-test.component';

describe('BleedTestComponent', () => {
  let component: BleedTestComponent;
  let fixture: ComponentFixture<BleedTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BleedTestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BleedTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
