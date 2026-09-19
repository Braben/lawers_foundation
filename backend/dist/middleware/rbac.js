"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserRole = void 0;
exports.requirePermission = requirePermission;
const access_1 = require("../services/access");
const errors_1 = require("./errors");
exports.getUserRole = access_1.bootstrapRole;
function requirePermission(permission) {
    return async (req, res, next) => {
        try {
            const request = req;
            if (!request.user)
                throw new errors_1.HttpError(401, 'Authentication required');
            const access = request.access || await (0, access_1.resolveAccess)(request.user);
            request.access = access;
            if (!access.permissions.includes(permission))
                throw new errors_1.HttpError(403, `Access to ${permission} is disabled for your role.`);
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
