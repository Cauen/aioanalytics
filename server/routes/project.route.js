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

