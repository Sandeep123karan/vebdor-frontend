import { api } from "./axios";
const Add_BNB_URL = "api/vendor/bnb/add";



export const addBnbLibrary = (data) =>  api.post(Add_BNB_URL, data);
