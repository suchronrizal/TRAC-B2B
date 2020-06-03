import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { MainService } from '../lib/service/main.service';

@Injectable()
export class InfoOrderService {
	private urlOrderInfo: string = this.mainService['hostOrder'] + '/order/additional-reservation/approval';

	constructor(
		private http:Http,
		private mainService: MainService
	){
		this.mainService.updateLocalStorage();
	}

	putOrderInfo(body: any){
		let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.put(this.urlOrderInfo, JSON.stringify(body), options).map((res:Response) => res.json());
	}
}
