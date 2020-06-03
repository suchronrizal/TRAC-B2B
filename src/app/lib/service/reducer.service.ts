import { createStore, combineReducers } from 'redux';

export const loginReducer = (
  state = {
    isLogin: false
  },
  action
) => {
  switch (action.type) {
    case 'SET_LOGIN':
      state = {
        ...state,
        isLogin: true
      };
      break;
    case 'SET_LOGOUT':
      state = {
        ...state,
        isLogin: false
      };
      break;
  }
  return state;
};

export const finishConfiguration = (
  state = {
    ProductConfigId: null,
    PriceConfigId: null,
    BillingConfigId: null,
    ApprovalConfigId: null,
    NotificationConfigId: null,
    EligibilityConfigId: null,
    ConfigCityCoverageId: null,
    CustomerId: null
  },
  action
) => {
  switch (action.type) {
    case 'SET_PRODUCT_CONFIG_ID':
      state = {
        ...state,
        ProductConfigId: action.value
      };
      break;
    case 'SET_PRICE_CONFIG_ID':
      state = {
        ...state,
        PriceConfigId: action.value
      };
      break;
    case 'SET_BILLING_CONFIG_ID':
      state = {
        ...state,
        BillingConfigId: action.value
      };
      break;
    case 'SET_APPROVAL_CONFID_ID':
      state = {
        ...state,
        ApprovalConfigId: action.value
      };
      break;
    case 'SET_NOTIFICATION_CONFIG_ID':
      state = {
        ...state,
        NotificationConfigId: action.value
      };
      break;
    case 'SET_ELIGIBILITY_CONFIG_ID':
      state = {
        ...state,
        EligibilityConfigId: action.value
      };
      break;
    case 'SET_CONFIG_CITY_COVERAGE_ID':
      state = {
        ...state,
        ConfigCityCoverageId: action.value
      };
      break;
    case 'SET_CUSTOMER_ID':
      state = {
        ...state,
        CustomerId: action.value
      };
      break;
  }
  return state;
};

export const sidebarMenuReducer = (
  state = {
    menus: []
  },
  action
) => {
  switch (action.type) {
    case 'SET_MENU':
      state = {
        ...state,
        menus: action.value
      };
      break;
  }
  return state;
};

const reducers = combineReducers({
  login: loginReducer,
  sidebar: sidebarMenuReducer,
  config: finishConfiguration
});
const store = createStore(reducers);
export { store };
