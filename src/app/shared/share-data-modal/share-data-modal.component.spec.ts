import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareDataModalComponent } from './share-data-modal.component';

describe('ShareDataModalComponent', () => {
  let component: ShareDataModalComponent;
  let fixture: ComponentFixture<ShareDataModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareDataModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareDataModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
