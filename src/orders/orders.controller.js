const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function validator(field) {
    return function (req, res, next) {
        if (req.body.data[field]) {
            next();
        } else {
            next({
                status: 400,
                message: `Request body must include ${field}`,
            });
        }
    };
}

function dishValidator(req, res, next) {
    if (req.body.data.dishes && req.body.data.dishes.length) {
        const dishes = req.body.data.dishes;
        if (Array.isArray(dishes)) {
            dishes.forEach((e, index) => {
                if (e.quantity <= 0) {
                    next({
                        status: 400,
                        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
                    });
                } else if (typeof e.quantity !== "number") {
                    next({
                        status: 400,
                        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
                    });
                }
            });
            next();
        } else {
            next({
                status: 400,
                message: `Order must include at least one dish`,
            });
        }
    } else {
        next({
            status: 400,
            message: `Order must include a dish`,
        });
    }
}

//Validator functions end

function list(req, res, next) {
    res.status(200).json({ data: orders });
}

function create(req, res, next) {
    const { deliverTo, mobileNumber, status, dishes } = req.body.data;

    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes,
    };

    orders.push(newOrder);

    res.status(201).json({ data: newOrder });
}

module.exports = {
    list,
    create: [
        ...["deliverTo", "mobileNumber"].map(validator),
        dishValidator,
        create,
    ],
};
