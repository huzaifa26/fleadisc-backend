export const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        console.log(req.roles);
        if (!req?.roles) return res.sendStatus(401);
        console.log(req.roles);
        const rolesArray = allowedRoles.map(role => parseInt(role));
        const result = req.roles.map(role => rolesArray.includes(role)).find(val => val === true);
        console.log(result);
        if (!result) return res.sendStatus(401);
        next();
    }
}
