import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificationListModalComponent } from './modification-list-modal.component';

describe('ModificationListModalComponent', () => {
  let component: ModificationListModalComponent;
  let fixture: ComponentFixture<ModificationListModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModificationListModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModificationListModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
