import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlaModalComponent } from './fla-modal.component';

describe('FlaModalComponent', () => {
  let component: FlaModalComponent;
  let fixture: ComponentFixture<FlaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlaModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
