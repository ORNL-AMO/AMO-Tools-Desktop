import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndUsesTableComponent } from './end-uses-table.component';

describe('EndUsesTableComponent', () => {
  let component: EndUsesTableComponent;
  let fixture: ComponentFixture<EndUsesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndUsesTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndUsesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
