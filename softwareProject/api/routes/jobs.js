const express = require('express');
const router = express.Router();
const mongoose =  require('mongoose');


const Job = require('../models/job');
const Reason = require('../models/reason');
const Fault = require('../models/fault');
const Machine = require('../models/machine');

router.get("/", (req, res, next)=> {
    Job.find()
    .select('inventory description jobNo _id')
    .populate('machine reason fault')
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            jobs: docs.map(doc => {
                return {
                    _id: doc._id,
                    jobNo:doc.jobNo,
                    machine:doc.machine,
                    reason: doc.reason,
                    fault:doc.fault,
                    inventory: doc.inventory,
                    description: doc.description,
                    request: {
                        type: 'GET',
                        url:'http://localhost:3000/jobs/' + doc._id
                    }
                }
            })
        });
    })
    .catch(err => {
        res.status(500).json({
            error:err
        })
    })
});

router.get('/jobs', function(req, res) {
    console.log('Get all machine details');
    
    Job.find({}) 
    .select('inventory description jobNo _id')
    .populate('machine reason fault')
    .exec(function(err,jobs){
        if(err){
            console.log("Error");
        } else {
            res.json(jobs);
        }
    });
  });
 
router.post("/", (req, res, next)=> {
    Reason.findById(req.body.reasonId)
    .then(reason => {
        if(!reason) {
            return res.status(404).json({
                message: "Reason not found"
            });
        }
       })
    Fault.findById(req.body.faultId)
    .then(fault => {
        if(!fault) {
            return res.status(404).json({
                message:"Fault not found"
            });
        }
    })
    Machine.findById(req.body.machineId)
    .then(machine => {
        if(!machine) {
            return res.status(404).json({
                message:"Machine not found"
            });
        }
    })
    const job = new Job ({
        _id: mongoose.Types.ObjectId(),
        jobNo:req.body.jobNo,
        inventory: req.body.inventory,
        description:req.body.description,
        machine:req.body.machineId,
        reason: req.body.reasonId,
        fault: req.body.faultId,
    });
    return job
    .save()
    
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Job Stored',
            createdJob: {
                _id: result._id,
                jobNo: result.jobNo,
                machine:result.machine,
                reason: result.reason,
                fault: result.fault,
                inventory: result.inventory,
                description:result.description
            },
            request: {
                type: 'GET',
                url:'http://localhost:3000/jobs/' + result._id
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.get('/:jobId', (req, res, next)=>{
    Job.findById(req.params.jobId)
    .populate('machine reason fault')
    .exec()
    .then(job => {
        if(!job){
            return res.status(404).json({
                message: "Job not found"
            });
        }
        res.status(200).json({
            job: job,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/jobs'
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
   
});

router.get('/jobs/:id', function(req, res) {
    console.log('Get a job details');
    Job.findById(req.params.id) 
    .populate('machine reason fault')
    .exec(function(err,job){
        if(err){
            console.log("Error");
        } else {
            res.json(job);
        }
    });
  });

/*router.get('/:serialNo', (req, res, next)=>{
    Job.findById(req.params.serialNo)
    .populate('machine reason fault')
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            jobs: docs.map(doc => {
                return {
                    _id: doc._id,
                    jobNo:doc.jobNo,
                    serialNo:doc.serialNo,
                    department: doc.department,
                    request: {
                        type: 'GET',
                        url:'http://localhost:3000/jobs/' + doc._id
                    }
                }
            })
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
   
});*/
module.exports = router;