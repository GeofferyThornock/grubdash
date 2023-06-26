const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function makeValidatorFor(field) {
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

function checkPriceValidator(req, res, next) {
    const { price } = req.body.data;
    if (price) {
        if (price <= 0 || typeof price !== "number") {
            next({
                status: 400,
                message: `price is either 0 or is not a number`,
            });
        } else {
            next();
        }
    } else {
        next({
            status: 400,
            message: `price is either 0 or is not a number`,
        });
    }
}

function urlExists(req, res, next) {
    const { dishId } = req.params;
    const dish = dishes.find((e) => e.id === dishId);

    if (dish) {
        res.locals.dish = dish;
        next();
    } else {
        next({
            status: 404,
            message: `Dish with id: ${dishId} not found`,
        });
    }
}
// Validators end

function create(req, res, next) {
    const { name, description, price, image_url } = req.body.data;

    const newDish = { id: nextId(), name, description, price, image_url };

    dishes.push(newDish);

    res.status(201).json({ data: newDish });
}

function list(req, res, next) {
    res.status(200).json({ data: dishes });
}

function read(req, res, next) {
    res.status(200).json({ data: res.locals.dish });
}

function update(req, res, next) {
    const { name, description, price, image_url } = req.body.data;
    const dish = res.locals.dish;

    if (req.body.data.id) {
        if (dish.id !== req.body.data.id) {
            return next({
                status: 400,
                message: `Dish id does not match route id. Dish: ${req.body.data.id}, Route: ${dish.id}`,
            });
        }
    }

    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;

    res.send({ data: dish });
}

module.exports = {
    list,
    create: [
        ...["name", "description", "image_url"].map(makeValidatorFor),
        checkPriceValidator,
        create,
    ],
    read: [urlExists, read],
    update: [
        urlExists,
        ...["name", "description", "image_url"].map(makeValidatorFor),
        checkPriceValidator,
        update,
    ],
};
