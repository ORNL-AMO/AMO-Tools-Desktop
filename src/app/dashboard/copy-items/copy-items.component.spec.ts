import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyItemsComponent } from './copy-items.component';

describe('CopyItemsComponent', () => {
  let component: CopyItemsComponent;
  let fixture: ComponentFixture<CopyItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CopyItemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
