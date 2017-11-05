/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var express = require('express');
var router = express.Router();

router.get('/get-all-webserver', function (req, res, next) {
    req.app.models.log.native(function (err, collection) {
        collection.aggregate(
        [
            {
                $group: {
                    _id: {
                        machine: "$machine"
                    },
                    count: {
                        "$sum": 1
                    }
                }
            }
        ], function (err, data) {
            if (err) {
                return res.json({
                    machines: []
                });
            } else {
                var machines = [];
                for (j = 0; j < data.length; j++) {
                    machines.push(data[j]._id.machine);
                }
                return res.json({
                    machines: machines
                })
            }
        });
    });
});
router.get('/get-most-request-path-by-server', function (req, res, next) {
    var server = req.param('server');
    server = (server == null) ? "" : server;
    req.app.models.log.native(function (err, collection) {
        collection.aggregate([
            {
                $match: {
                    machine: server
                }
            },
            {
                $group: {
                    _id: {
                        path: "$data.path"
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    count: -1
                }
            },
            {
                $limit: 3
            }
        ], function (err, data) {
            if (err) {
                return res.json({
                    paths: []
                });
            } else {
                var paths = [];
                for (j = 0; j < data.length; j++) {
                    paths.push({
                        path: data[j]._id.path,
                        count: data[j].count
                    });
                }
                return res.json({
                    paths: paths
                })
            }
        });
    });
});
router.get('/get-most-request-path-by-ip', function (req, res, next) {
    var server = req.param('server');
    server = (server == null) ? "" : server;
    req.app.models.log.native(function (err, collection) {
        collection.aggregate([
            {
                $match: {
                    machine: "NguyenTienMBP"
                }
            },
            {
                $group: {
                    _id: {
                        "ip": "$data.remote_addr",
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    count: -1
                }
            },
            {
                $limit: 5
            }
        ], function (err, data) {
            if (err) {
                return res.json({
                    paths: []
                });
            } else {
                var result = [];
                var matchCondition = {
                    "$or": []
                };
                for (j = 0; j < data.length; j++) {
                    matchCondition["$or"].push({
                        "ip": data[j]._id.ip
                    });
                    result.push({
                        ip: data[j]._id.ip,
                        ip_vist: data[j].count,
                        paths: []
                    })
                }
                req.app.models.log.native(function (err, collection) {
                    collection.aggregate([
                        {
                            $match: matchCondition
                        },
                        {
                            $group: {
                                _id: {
                                    "ip": "$data.remote_addr",
                                    path: "$data.path"
                                },
                                count: {
                                    $sum: 1
                                },last_visit:{
                                    $max:"$data.date_agent"
                                }
                            }
                        },
                        {
                            $sort: {
                                count: -1
                            }
                        },
                        {
                            $limit: 5
                        }
                    ], function (err, data) {
                        var paths = [];
                        for (i = 0; i < result.length; i++) {
                            for (j = 0; j < data.length; j++) {
                                if (result[i].ip == data[j]._id.ip) {
                                    result[i].paths.push({
                                        path: data[j]._id.path,
                                        count: data[j].count,
                                        last_vist:data[j].last_visit
                                    })
                                }
                            }
                        }
                        return res.json({
                            paths: result
                        })
                    });
                });
            }
        });
    });
});

module.exports = router;