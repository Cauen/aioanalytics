import {http} from './config'

export default {
    getProjects: () => {
        return http.get('project/')
    },
    getFunnels: (project: string) => {
        return http.post('project/funnels', {project: project})
    },
    addProject: (name:string) => {
        return http.post('project/', {name: name})
    },
    addFunnel: (project: string, funnel: {}) => {
        return http.post('project/funnel', {project: project, funnel: funnel});
    }
}