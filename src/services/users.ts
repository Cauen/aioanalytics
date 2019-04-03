import {http} from './config'

export default {
    getUsers: (project: string) => {
        return http.post('user/all', {project: project})
    },
    getUser: (identification:string, project:string) => {
        return http.post('user/data', {identification: identification, project:project})
    },
    deleteUser: (identification: string, project:string) => {
        return http.post('user/delete', {identification:identification, project:project} )
    }
}