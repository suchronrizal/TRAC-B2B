import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { InfoOrderService } from '../info-order.service';
import * as moment from 'moment';
import { MainService } from '../../lib/service/main.service';

@Component({
	selector: 'app-main-info-order',
	templateUrl: './main-info-order.component.html',
	styleUrls: ['./main-info-order.component.scss']
})
export class MainInfoOrderComponent implements OnInit {
	public loading: boolean = false;
	public infoOrder = null;
	public status;
	public hasUpdated: boolean = false;
	public objParam = null;

	constructor(
		private InfoOrder: InfoOrderService,
		private activeRoute: ActivatedRoute,
		private mainService: MainService
	) {}
	ngOnInit() {
		// subscribe to router event
		this.activeRoute.queryParams.subscribe((params: Params) => {
			this.updateOrderInfo(params);
			this.objParam = params;
			if (Number(params.Status) == 1) {
				this.status = 'Approved';
			} else {
				this.status = 'Rejected';
			}
		});
	}

	convertDateTime(str) {
		var date =
			moment(str.substring(0, 10)).format('DD MMM YYYY') +
			' - ' +
			str.substring(11, 16);
		return (str = date);
	}

	updateOrderInfo(body) {
		this.loading = true;
		this.InfoOrder.putOrderInfo(body).subscribe(
			res => {
				this.loading = false;
				this.infoOrder = res.Data;
				this.infoOrder['Date'] = this.convertDateTime(this.infoOrder['Date']);
				this.infoOrder['PriceOLC'] = Number(
					this.infoOrder['PriceOLC']
				).toLocaleString();
				this.infoOrder['PriceTrip'] = Number(
					this.infoOrder['PriceTrip']
				).toLocaleString();
			},
			err => {
				this.loading = false;

				switch (err.status) {
					case 401:
						this.mainService.updateToken(() => {
							this.updateOrderInfo(body);
						});
						break;
					case 500:
						this.hasUpdated = true;
						break;
				}

				if (err.name == 'TimeoutError') {
					this.updateOrderInfo(body);
				}
			}
		);
	}
}
