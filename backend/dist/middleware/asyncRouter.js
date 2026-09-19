"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncRouter = asyncRouter;
const express_1 = require("express");
// Express 4 does not forward rejected async handlers to error middleware.
function asyncRouter() {
    const router = (0, express_1.Router)();
    for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
        const register = router[method].bind(router);
        router[method] = ((path, ...handlers) => register(path, ...handlers.map(handler => ((req, res, next) => {
            Promise.resolve().then(() => handler(req, res, next)).catch(next);
        }))));
    }
    return router;
}
