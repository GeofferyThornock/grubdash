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

function urlExists(req, res, next) {
    const { orderId } = req.params;
    const order = orders.find((e) => e.id === orderId);

    if (order) {
        res.locals.order = order;
        next();
    } else {
        next({
            status: 404,
            message: `Order with id: ${orderId} does not exist`,
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

function read(req, res, next) {
    res.send({ data: res.locals.order });
}

function update(req, res, next) {
    const { deliverTo, mobileNumber, status } = req.body.data;
    const order = res.locals.order;

    if (req.body.data.id) {
        if (order.id !== req.body.data.id) {
            return next({
                status: 400,
                message: `Order id does not match route id. Order: ${req.body.data.id}, Route: ${order.id}`,
            });
        }
    }

    if (status === "invalid") {
        return next({
            status: 400,
            message: "status cannot be invalid",
        });
    }

    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;

    res.send({ data: order });
}

function destroy(req, res, next) {
    const order = res.locals.order;
    const index = orders.findIndex((e) => order.id === e.id);
    if (order.status !== "pending") {
        return next({
            status: 400,
            message: "An order cannot be deleted unless it is pending",
        });
    }

    orders.splice(index, 1);
    res.status(204).send();
}

module.exports = {
    list,
    create: [
        ...["deliverTo", "mobileNumber"].map(validator),
        dishValidator,
        create,
    ],
    read: [urlExists, read],
    update: [
        urlExists,
        ...["deliverTo", "mobileNumber", "status"].map(validator),
        dishValidator,
        update,
    ],
    delete: [urlExists, destroy],
};
