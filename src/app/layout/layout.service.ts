import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import * as _ from "lodash";

import { MainService } from '../lib/service/main.service';

@Injectable()
export class LayoutService {
	private urlLogout = this.mainService['host'] + '/authorization/logout/';
	private urlCheckToken = this.mainService['host'] + '/authorization/check-token/';
	private urlMenu = this.mainService['host'] + '/authorization/menu/';
	private costCenter = this.mainService['hostOrg'] + '/organization/config-organization/';
	private urlBudget = this.mainService['hostBilling'] + '/billing/configuration-payment-scheme/customer/';
	private urlBudgetSingle = this.mainService['hostBilling'] + '/billing/configuration-payment-scheme/single-costcenter/';
	private urlSaveBudget = this.mainService['hostBilling'] + '/billing/configuration-payment-scheme-detail/save';

	constructor(
		private http:Http,
		private mainService: MainService
	){
		this.mainService.updateLocalStorage();
	}

	// Post Login
	// =========================== //
    postLogout(){
        let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.urlLogout, options).timeout(this.mainService['timeOut']).map((res:Response) => res.json());
	}
	
	// Check Token
	// =========================== //
	checkToken(){
		let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
        return this.http.get('http://omni-service-configuration.azurewebsites.net/api/configuration/customer/', options).map((res:Response) => res.json());
	}

	// Get Menu
	// =========================== //
	getMenu(){
		this.mainService.updateLocalStorage();
		let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
        return this.http.get(this.urlMenu, options).timeout(this.mainService['timeOut']).map((res:Response) => res.json());
	}

	// Ger Cost Center
	// =========================== //
	getCostCenter(id:String){
		if(this.mainService['dataUser'] != null){
			let dataUser = JSON.parse(this.mainService['dataUser']);
			let headers = new Headers({ 
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.mainService['token']
			});
			let options = new RequestOptions({ headers: headers });
			return this.http.get(this.costCenter + id + '?BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId, options).map((res:Response) => res.json());
		}
	}

	// Get Budget
	// =========================== //
	getBudget(CustomerId,CostCenterId){
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
      return this.http.get(this.urlBudget + CustomerId + '/cost-center/' + CostCenterId + '?BusinessUnitId='+ dataUser.UserCompanyMapping[0].BusinessUnitId, options).map((res:Response) => res.json());
	}
	
	getBudgetSingle(CustomerId,CostCenterId){
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
      return this.http.get(this.urlBudgetSingle + CustomerId + '/cost-center/' + CostCenterId + '?BusinessUnitId='+ dataUser.UserCompanyMapping[0].BusinessUnitId, options).map((res:Response) => res.json());
	}

	// Post Budgte
	// =========================== //
    postBudget(body:any){
        let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.urlSaveBudget, JSON.stringify(body), options).map((res:Response) => res.json());
	}
}
