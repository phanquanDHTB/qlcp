// import axios from 'axios';
// import { REACT_APP_COST_MANAGEMENT_API_DOMAIN, REACT_APP_COST_MANAGEMENT_API_LOCAL, REACT_APP_ENV } from 'utils/env';
// axios.defaults.baseURL =
//   REACT_APP_ENV === "development"
//     ? `${REACT_APP_COST_MANAGEMENT_API_LOCAL}/api/`
//     : `${REACT_APP_COST_MANAGEMENT_API_DOMAIN}/api/`;
// axios.defaults.baseURL = `https://dev-qlcp-viettelpost-api.wiinvent.tv/api/`;
// axios.defaults.baseURL = `http://localhost:8080/api/`;

import axios from "axios";
axios.defaults.baseURL = `http://dev-qlcp-viettelpost-api.wiinvent.tv/api/`;
// axios.defaults.baseURL = `http://localhost:8080/api/`;
