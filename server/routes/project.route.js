const express = require('express');
let Project = require('../models/Project');

module.exports.getProjects = (function (req, res) {
    
    var adminid = req.adminid;
    Project.find({admins: adminid}, (err, project) => {
        if(!project)
            return res.send('Not found');
        res.json(project);
    })
});


module.exports.getFunnels = (function (req, res) {
    var projectId = req.body.project;
    Project.findById(projectId, (err, project) => {
        if(!project)
            return res.send('Not found');
        res.json(project.funnels);
    })
});

module.exports.addProject = (function (req, res) {
    var projectName = req.body.name;
    var adminid = req.adminid;
    if (!adminid)
        return res.send('User not set');

    let project = new Project({name: projectName});
    project.admins.push(adminid);
    console.log('Adding project');
    //let project = new Project(req.body);
    project.save()
        .then(projectsaved => {
            res.status(200).json({ success: projectsaved });
        })
        .catch(err => {
            res.status(400).send(err);
        });
});

module.exports.addFunnel = (function (req, res) {
    var adminId = req.adminid;
    var projectId = req.body.project;
    var funnel = req.body.funnel;

    var funnelName = funnel.funnelName;
    var funnelDesc = funnel.funnelDescription;
    var funnelSteps = funnel.funnelSteps;

    console.log(adminId);
    console.log(projectId);
    console.log(funnel);

    if (!adminId || !projectId || !funnelName || !funnelSteps)
        return res.status(400).send('Needing data');

    Project.findById(projectId, (err, project) => {
        if(!project)
            return res.send('Project not found');
        project.funnels.push({
            name: funnelName,
            description: funnelDesc,
            steps: funnelSteps,
            created_by: adminId
        });
        project.save().then(projectsaved => {
            return res.status(200).json({ success: projectsaved });
        }).catch(err => {
            return  res.status(400).send(err);
        })
    })
});