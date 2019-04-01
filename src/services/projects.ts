import {http} from './config'

export default {
    getProjects: () => {
        return http.get('project/')
    },
    AddProject: (name:string) => {
        return http.post('project/', {name: name})
    }
}