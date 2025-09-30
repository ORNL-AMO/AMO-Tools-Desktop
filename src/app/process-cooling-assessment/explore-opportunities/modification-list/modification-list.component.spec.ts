import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificationListComponent } from './modification-list.component';

describe('ModificationListComponent', () => {
  let component: ModificationListComponent;
  let fixture: ComponentFixture<ModificationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
