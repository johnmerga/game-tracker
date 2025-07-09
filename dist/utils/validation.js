"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatValidationError = exports.validateGameNameParam = exports.validate = void 0;
const zod_1 = require("zod");
const types_1 = require("../types");
const validate = (schema, data) => {
    try {
        const parsedData = schema.parse(data);
        return { success: true, data: parsedData };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return { success: false, error: error.errors };
        }
        return {
            success: false,
            error: [{ message: "Validation failed due to an unknown error." }],
        };
    }
};
exports.validate = validate;
const validateGameNameParam = (gameName) => {
    return (0, exports.validate)(types_1.GameNameParamSchema, { gameName });
};
exports.validateGameNameParam = validateGameNameParam;
const formatValidationError = (errors) => {
    return {
        status: "error",
        message: "Validation failed",
        details: errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
            code: err.code,
        })),
    };
};
exports.formatValidationError = formatValidationError;
