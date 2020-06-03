import { TestBed, inject } from '@angular/core/testing';

import { InfoOrderService } from './info-order.service';

describe('InfoOrderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InfoOrderService]
    });
  });

  it('should be created', inject([InfoOrderService], (service: InfoOrderService) => {
    expect(service).toBeTruthy();
  }));
});
