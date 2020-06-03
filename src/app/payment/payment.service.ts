import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { MainService } from '../lib/service/main.service';

@Injectable()
export class PaymentService {
	private urlGetPayment: string = this.mainService['hostBilling'] + '/billing/configuration-payment-scheme/customer/';
	private urlSavePaymentCC: string = this.mainService['hostBilling'] + '/billing/payment-transaction/checkout-cc';
	private urlSavePaymentVA: string = this.mainService['hostBilling'] + '/billing/payment-transaction/checkout-va';
	private urlUpdateUserPaymentCC: string = this.mainService['hostBilling'] + '/billing/payment-transaction/insert-payer';

	constructor(
        private http:Http,
		private mainService: MainService
	){}

	getPayment(id:String){
		if(this.mainService['dataUser'] != null){
			let dataUser = JSON.parse(this.mainService['dataUser']);
			this.mainService.updateLocalStorage();
			let headers = new Headers({ 
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.mainService['token']
			});
			let options = new RequestOptions({ headers: headers });
			return this.http.get(this.urlGetPayment + id + '?BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId, options).timeout(this.mainService['timeOut']).map((res:Response) => res.json());
		}
	}

	postPaymentCC(body:any){
		let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.urlSavePaymentCC, JSON.stringify(body), options).map((res:Response) => res.json());
	}

	postPaymentVA(body:any){
		let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.urlSavePaymentVA, JSON.stringify(body), options).map((res:Response) => res.json());
	}

	postUserPaymentCC(body:any){
		let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.urlUpdateUserPaymentCC, JSON.stringify(body), options).map((res:Response) => res.json());
	}

}
