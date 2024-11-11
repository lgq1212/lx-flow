import axios from "axios";
import {ElMessageBox, ElMessage} from "element-plus";

const service = axios.create({
	baseURL: import.meta.env.VITE_APP_BASE_API,
	timeout: 50000
});

service.defaults.withCredentials = true; // 让ajax携带cookie
service.interceptors.request.use(
	// 每次请求都自动携带Cookie
	config => {
		config.headers.wflowToken = localStorage.getItem('wflow-token')
		return config;
	},
	// eslint-disable-next-line handle-callback-err
	error => {
		return Promise.reject(error);
	}
);

service.interceptors.response.use(
	rsp => {

		return rsp;
	},
	// 拦截异常的响应
	err => {
		switch (err.response.status) {
			case 401:
				ElMessageBox.alert("登陆失效，请点击右上角头像重新切换人员");
				break;
			case 403:
				ElMessage.warning("抱歉，您无权访问！")
				break;
			case 500:
				break;
			case 404:
				break;
			default:
				//throw 'request error'
				return Promise.reject(err);
		}
		//throw 'request error'
		return Promise.reject(err);
	}
);
export default service;
