import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

import { store } from '../../lib/service/reducer.service';
import { CustomerManagementService } from '../customer-management.service';
import { MainService } from '../../lib/service/main.service';
import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { DetailCustomerComponent } from '../detail-customer/detail-customer.component';

@Component({
  selector: 'app-city-coverage',
  templateUrl: './city-coverage.component.html',
  styleUrls: ['./city-coverage.component.scss']
})
export class CityCoverageComponent implements OnInit {
	// ============================================================================== //
    // Properties
	// ============================================================================== //
	private checkedAll: boolean = false;
	private checkedAllCity: boolean = false;
	public selectedZone = null;
	public validateBtn: boolean = true;
	public submitButton: boolean = false;
	public loading: boolean = true;
	public cityFilter;

	@Input() disableNext: boolean;
	@Input() isOpen: boolean;
	@Output() onSave = new EventEmitter();

	// Notification
	// =========================== //
	public msgs: Message[] = [];
	
	constructor(
		private mainService: MainService,
		private customerSerive: CustomerManagementService,
		private detailCustomer: DetailCustomerComponent
	) { }

	ngOnInit(){}

	ngOnChanges(){
        if(this.isOpen){
			this.loading = true;
            this.fetchCity();
			this.fetchProvince();
        }
    }

	// ============================================================================== //
    // Cities
	// ============================================================================== //
	private cities = [];
	private selectedCities : String[] = [];
	private filterCities = [];
	private filterDataCheck = [];
	fetchCity(){
		this.customerSerive.getCity().subscribe(res =>{
			this.cities = [];
			this.filterCities= [];
			_.map(res.Data, (x)=>{
				let obj = {
					Id: x.MsCityId,
					name: x.MsCityName, 
					zoneId: x.ProvinceId, 
					selected: false
				};
				this.cities.push(obj);
			});
			this.filterCities = _.filter(this.cities);
			this.fetchCityByCustomer();
		}, err =>{
			if(err.name == "TimeoutError"){
                this.fetchCity();
			}
			
			if(err.status == 401){
				this.mainService.updateToken(() =>{
					this.fetchCity();
				});
			}
		});
	}

	private ConfigurationCityCoverageId = null;
	private selectedItem = [];
	fetchCityByCustomer(){
		this.customerSerive.getCityByCustomer(this.detailCustomer['CustomerId']).subscribe(res =>{
			this.selectedItem = [];
			this.loading = false;
			if(res.Data.length != 0){
				_.map(res.Data, (x)=>{
					this.selectedItem.push(x.CityId);
				});
				this.selectedCities = this.selectedItem;
				_.uniq(this.selectedCities);
				this.ConfigurationCityCoverageId = res.Data[0].ConfigurationCityCoverageId;
				if(this.selectedItem.length != 0){
					this.disableNext = false;
					this.validateBtn = false;
				}
				store.dispatch({ 
                    type: 'SET_CONFIG_CITY_COVERAGE_ID',
                    value: res.Data[0].ConfigurationCityCoverageId
                });
			}
		}, err =>{
			if(err.name == "TimeoutError"){
                this.fetchCityByCustomer();
			}

			if(err.status == 401){
				this.mainService.updateToken(() =>{
					this.fetchCityByCustomer();
				});
			}

		});
	}

	// ============================================================================== //
    // Province
	// ============================================================================== //
	public dataLocation = [];
	fetchProvince(){
		this.customerSerive.getProvince().subscribe(res =>{
			this.dataLocation = [];
			_.map(res.Data, (x)=>{
				let obj = {
					id: x.MsProvinceId,
					zone: x.MsProvinceName
				};
				this.dataLocation.push(obj);
			});
		}, err =>{
			if(err.name == "TimeoutError"){
                this.fetchProvince();
			}

			if(err.status == 401){
				this.mainService.updateToken(() =>{
					this.fetchProvince();
				});
			}
		});
	}

	// Save Data
	// =========================== //
    save(){
        this.disableNext = false;
		this.submitButton = true;
		
		let obj = {
			CustomerId: this.detailCustomer['CustomerId'],
			city: _.uniq(this.selectedCities)
		};

		if(this.ConfigurationCityCoverageId == null){
			this.customerSerive.postCity(obj).subscribe(res =>{
				this.submitButton = false;
				this.detailCustomer.updateConfigStep("4");
				this.msgs = [];
				this.msgs.push({severity:'success', summary: 'Success', detail: 'Add city location'});
				this.fetchCity();
				this.onSave.emit();
			}, err =>{
				if(err.status == 401){
					this.mainService.updateToken(() =>{
						this.save();
					});
				}
				this.msgs = [];
				this.msgs.push({severity:'error', summary: 'Failed', detail: 'Failed add city location'});
				this.submitButton = false;
			});
		}else{
			this.customerSerive.updateCity(obj, this.ConfigurationCityCoverageId).subscribe(res =>{
				this.submitButton = false;
				this.detailCustomer.updateConfigStep("4");
				this.msgs = [];
				this.msgs.push({severity:'success', summary: 'Success', detail: 'Update city location'});
				this.fetchCity();
				this.onSave.emit();
			}, err =>{
				if(err.status == 401){
					this.mainService.updateToken(() =>{
						this.save();
					});
				}
				this.msgs = [];
				this.msgs.push({severity:'error', summary: 'Failed', detail: 'Failed Update city location'});
				this.submitButton = false;
			});
		}
	}
	
	// FilterZone
	// =========================== //
	selectZone(e){
		this.filterCities = _.filter(this.cities, {zoneId: e.id});
		this.selectedZone = e;

		if(this.checkedAll){
			this.checkedAllCity = true;
		}else{
			this.checkedAllCity = false;
		}
	}

	// View All Zone
	// =========================== //
	allZone(){
		this.selectedZone = null;
		this.filterCities = this.cities;
	}

	// Select All
	// =========================== //
	changeAll(e){
		if(e){
			this.selectedCities = [];
			this.filterDataCheck = [];
			_.map(this.filterCities, (x)=>{
				this.filterDataCheck.push(x.Id);				
				this.selectedCities.push(x.Id);
			});
			this.selectedCities = this.selectedCities;
			this.selectedZone = null;
			this.validateBtn = false;
			this.checkedAllCity = true;
		}else{
			this.selectedCities = [];
			this.filterDataCheck = [];
			this.validateBtn = true;
		}
	}

	// Select All City
	// =========================== //
	changeAllCity(e,value){
		if(e){
			this.selectedCities = [];
			_.map(this.filterCities, (x)=>{
				return this.selectedCities.push(x.Id);
			});
			this.validateBtn = false;
		}else{
			this.selectedCities = [];
			this.validateBtn = true;
			this.checkedAllCity = false;
			this.checkedAll = false;
		}
	}

	// Change Select One
	// =========================== //
	changeOne(e, value){
		this.filterDataCheck = this.selectedCities;
		if(e){
			this.filterDataCheck.push(value);
		}else{
			_.remove(this.filterDataCheck, (x)=>{
				return x == value;
			});
		}	

		this.selectedCities = _.uniq(this.filterDataCheck);		

		if(this.selectedCities.length >= 1){
			this.validateBtn = false;
		}else{
			this.validateBtn = true;
		}
	}
}
