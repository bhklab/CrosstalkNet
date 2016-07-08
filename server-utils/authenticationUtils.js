'use strict'

var users = [
    {"name": "Matt", "password": "$2a$04$qOVrwY7Yki4D1Mebx.vsl.EvBnpY6wzkT7piTsjDRIBiAb/xkAE2u", "accessLevel": 1 },
    {"name": "Venkata", "password": "$2a$04$185npFsC325KgmY7bI8TFueD/7Z/1qLIiMhbGuZeEeipCMHP88Mwu", "accessLevel": 1 },
    {"name": "Alex", "password": "$2a$04$YCfSDbMU9SsoyOn8iKe0YONtZK3c4jsn9mhP607d6IphTWE5IKW/u", "accessLevel": 1 },
    {"name": "Benjamin", "password": "$2a$04$pHV29eRLD.dtupqubnPHluv3nfJ39q4Xqzg1uotXK42OXDU9qFYgi", "accessLevel": 1 },
    {"name": "Benjamin", "password": "$2a$04$Hw8Vlm9Nb/nFeQ5/hwRzGuRkqXr3nXnQHfxY0Ww.uVUwMRd7bIf2e", "accessLevel": 1 },
    {"name": "Benjamin", "password": "$2a$04$QFJh0igLsSThou2zdczXUOFi7txXlO8i3ERLgjl1Mhtfehrk2qmQ.", "accessLevel": 1 },
    {"name": "guest", "password": "$2a$04$wTZsuZbWB4HfjSfcJzrSlOiY4LOZ5Iav.3/o64oWZdrUwQo.MacZi", "accessLevel": 0}
];

function getUser(name, callback) {
    var user = null;

    for (var i = 0; i < users.length; i++) {
        if (users[i].name == name) {
            user = users[i];
            break;
        }
    }

    callback(user);
}

module.exports = {
    getUser: getUser
};
