import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddModificationModalComponent } from './add-modification-modal.component';

describe('AddModificationModalComponent', () => {
  let component: AddModificationModalComponent;
  let fixture: ComponentFixture<AddModificationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddModificationModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddModificationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
