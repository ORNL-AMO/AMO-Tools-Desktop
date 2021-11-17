import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullLoadComponent } from './full-load.component';

describe('FullLoadComponent', () => {
  let component: FullLoadComponent;
  let fixture: ComponentFixture<FullLoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FullLoadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FullLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
