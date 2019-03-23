import {http} from './config'

export default {
    getUsers: () => {
        return http.get('user/all')
    },
    getUser: (identification:string) => {
        return http.post('user/data', {identification: identification})
    }
}