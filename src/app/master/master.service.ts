import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { MainService } from '../lib/service/main.service';

@Injectable()
export class MasterService {
	private urlCity: string = this.mainService['hostCon'] + '/configuration/city/';
	private urlUpdateCity: string = this.mainService['hostCon'] + '/configuration/city/update/';
	
	private urlProvince: string = this.mainService['hostCon'] + '/configuration/province';
	private urlBranch: string = this.mainService['hostCon'] + '/configuration/branch/get-from-om/business-unit/';
	private urlMenu: string = this.mainService['host'] + '/authorization/menu';
	private urlPutMenu: string = this.mainService['host'] + '/authorization/menu/update/';
	private urlSaveMenu: string = this.mainService['host'] + '/authorization/menu/save';
	private urlDeleteMenu: string = this.mainService['host'] + '/authorization/menu/delete/';
	private urlGetDate: string = this.mainService['hostOrder'] + '/order/holiday-calendar/';
	private urlPostDate: string = this.mainService['hostOrder'] + '/order/holiday-calendar/save';
	private urlUpdateDate: string = this.mainService['hostOrder'] + '/order/holiday-calendar/update/';
	private urlDeleteDate: string = this.mainService['hostOrder'] + '/order/holiday-calendar/delete/';

	constructor(
		private http:Http,
		private mainService: MainService
	) { }

	// Get All Date
    // ======================== //
    getAllDate(): Observable<any>{
        let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
        return this.http.get(this.urlGetDate, options).timeout(this.mainService['timeOut']).map((res:Response) => res.json());
	}
	postDate(body:any){
		let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.urlPostDate, JSON.stringify(body), options).map((res:Response) => res.json());
	}
	putDate(body:any,id:string){
		let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.put(this.urlUpdateDate + id, JSON.stringify(body), options).map((res:Response) => res.json());
	}
	deleteMasterDate(id:String){
		let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.delete(this.urlDeleteDate + id, options).map((res:Response) => res.json());
	}

	// Get City
    // ======================== //
    getCity(BusinessUnitId): Observable<any>{
        let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
        return this.http.get(this.urlCity + '?BusinessUnitId=' + BusinessUnitId, options).timeout(this.mainService['timeOut']).map((res:Response) => res.json());
	}
	putCity(body:any,id:string){
		let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.put(this.urlUpdateCity + id, JSON.stringify(body), options).map((res:Response) => res.json());
	}
	getProvince(): Observable<any>{
        let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
        return this.http.get(this.urlProvince, options).map((res:Response) => res.json());
	}

	// Get Branch
	// ======================== //
	getBranch(id:any): Observable<any>{
		let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
        return this.http.get(this.urlBranch + id, options).timeout(this.mainService['timeOut']).map((res:Response) => res.json());
	}

	// CRUD Menu
	// ======================== //
	getMenu(): Observable<any>{
        let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
        return this.http.get(this.urlMenu, options).map((res:Response) => res.json());
	}
	putMenu(body:any,id:string){
		let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.put(this.urlPutMenu + id, JSON.stringify(body), options).map((res:Response) => res.json());
	}
	postMenu(body:any){
		let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.urlSaveMenu, JSON.stringify(body), options).map((res:Response) => res.json());
	}
	deleteAccount(id:String){
		let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.delete(this.urlDeleteMenu + id, options).map((res:Response) => res.json());
	}
}
