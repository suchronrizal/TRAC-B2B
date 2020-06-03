import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import * as _ from "lodash";

import { MainService } from '../lib/service/main.service';
import { Product } from './product/product';

@Injectable()
export class ProductPriceService {
	// ============================================================================== //
	// Properties
	// ============================================================================== //
	private urlProduct = this.mainService['hostPrice'] + '/price/customer-product/';
	private urlCustomer: string = this.mainService['hostCostumer'] + '/customer';

	constructor(
		private http:Http,
		private mainService: MainService
	){
		this.mainService.updateLocalStorage();
	}

	// ============================================================================== //
	// GET Product  
	// ============================================================================== //
	getProduct(CustomerId,BusinessUnitId){
		let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
        return this.http.get(this.urlProduct + 'customer/'+ CustomerId +'/business-unit/' + BusinessUnitId, options).map((res:Response) => res.json());
	}

	getProductByFilter(CustomerId,BusinessUnitId,startDate,endDate){
		let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
        return this.http.get(this.urlProduct + 'customer/'+ CustomerId +'/business-unit/'+ BusinessUnitId +'/?startdate='+ startDate +'&enddate=' + endDate, options).map((res:Response) => res.json());
	}

	// ============================================================================== //
    // Customer
    // ============================================================================== //
    getCustomer(): Observable<any>{
		if(this.mainService['dataUser'] != null){
			let dataUser = JSON.parse(this.mainService['dataUser']);
			let headers = new Headers({ 
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.mainService['token']
			});
			let options = new RequestOptions({ headers: headers });
			return this.http.get(this.urlCustomer + '?BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId, options).map((res:Response) => res.json());
		}
	}
}
