const fs = require('fs');
const request = require("request");
const APIkey = "test";

function RandomString(length) {
    let radom13chars = function () {
        return Math.random().toString(16).substring(2, 15)
    }
    let loops = Math.ceil(length / 13)
    return new Array(loops).fill(radom13chars).reduce((string, func) => {
        return string + func()
    }, '').substring(0, length)
}

function getEmail(callback) {
    request.get('http://localhost:1337/api/getemail', {
        headers: {
            'x-api-key' : APIkey
        }
    }, (err, res, body) => {
        if (res.statusCode == 200) {
            callback(JSON.parse(body).email);
        } else {
            callback(0);
        }
    });
}

function createAccount(username, password, verify, verificationtype)
{
    try {
        getEmail((email) => {
            if (email != 0) {
                request.get(`http://localhost:1337/discord/api/createaccount?username=${username}&password=${password}&email=${email}`, {
                    headers: {
                        'x-api-key' : APIkey
                    }
                }, (err, res, body) => {
                    console.log(res);
                    console.log(body);
                    if (res.statusCode == 200) {
                        if (!verify) {
                            console.log("[GEN] Created Account, saved to tokens.txt");
                            fs.writeFileSync("./data/tokens.txt", JSON.stringify({token: JSON.parse(body).token, verification: 0}));
                        } else {
                            if (verificationtype == undefined) {
                                console.log(`[GEN] Created Account, verifying with email...`);
                                var token = JSON.parse(body).token;
                                request.get(`http://localhost:1337/discord/api/verifyaccount?token=${token}&type=1`, {
                                    headers: {
                                        'x-api-key' : APIkey
                                    }
                                }, (err, res, body) => {
                                    if (res.statusCode == 200) {
                                        console.log(`[GEN] Email Verified token: ${token}`);
                                        request.get(`http://localhost:1337/discord/api/verifyaccount?token=${token}&type=2`, {
                                        headers: {
                                            'x-api-key' : APIkey
                                        }
                                    }, (err, res, body) => {
                                        if (res.statusCode == 200) {
                                            console.log(`[GEN] Phone verified token: ${token} -> Saving to tokens.txt`);
                                            fs.writeFileSync("./data/tokens.txt", JSON.stringify({token: token, verification: 3}));
                                        }
                                      });
                                    }
                                });
                            } else {
                                console.log(`[GEN] Created Account, verifying by ${verificationtype == 1 ? "email" : "phone"}..`);
                                var token = JSON.parse(body).token;
                                request.get(`http://localhost:1337/discord/api/verifyaccount?token=${token}&type=${verificationtype}`, {
                                    headers: {
                                        'x-api-key' : APIkey
                                    }
                                }, (err, res, body) => {
                                    if (res.statusCode == 200) {
                                        console.log(`[GEN] ${verificationtype == 1 ? "Email" : "Phone"} verified token: ${token} -> Saving to tokens.txt`);
                                        fs.writeFileSync("./data/tokens.txt", JSON.stringify({token: token, verification: verificationtype}));
                                    }
                                });
                            }
                        }
                    }
                });
            }
        });
    }
    catch (err) {
        
    }
}

function startAccountCreator()
{
    console.log("[GEN] Creating Accounts..");
    setInterval(() => {
        createAccount(RandomString(15), RandomString(15), true, 0); 
    }, 15000);
}

startAccountCreator();