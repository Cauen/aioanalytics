import axios from 'axios'
import authService from './auth';

export const http = axios.create({
    baseURL: 'http://192.168.1.6:3000/',
})

http.interceptors.request.use(
(config) => {
    let token = authService.getToken();

    if (token) {
        config.headers['Authorization'] = `Bearer ${ token }`
    }

    return config
    },

    (error) => {
    return Promise.reject(error)
    });