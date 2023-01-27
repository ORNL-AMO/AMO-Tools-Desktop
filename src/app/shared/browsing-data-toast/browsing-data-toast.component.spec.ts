import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowsingDataToastComponent } from './browsing-data-toast.component';

describe('BrowsingDataToastComponent', () => {
  let component: BrowsingDataToastComponent;
  let fixture: ComponentFixture<BrowsingDataToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrowsingDataToastComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrowsingDataToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
