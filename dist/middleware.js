import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const userMiddleware = (req, res, next) => {
    const header = req.headers["authorization"];
    const decoded = jwt.verify(header, process.env.JWT_PASSWORD);
    if (decoded) {
        //@ts-ignore
        req.userId = decoded.id;
        next();
    }
    else {
        res.status(401).json({
            message: " Invalid Token"
        });
    }
};
//# sourceMappingURL=middleware.js.map