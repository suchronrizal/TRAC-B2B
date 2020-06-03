import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailOrderHistoryComponent } from './detail-order-history.component';

describe('DetailOrderHistoryComponent', () => {
  let component: DetailOrderHistoryComponent;
  let fixture: ComponentFixture<DetailOrderHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailOrderHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailOrderHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
