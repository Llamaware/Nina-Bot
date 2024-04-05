
exports.resolveSequentially = async function(descriptions, callback) {
    let failure = false;

    if (typeof callback !== "function") {
        callback = () => {};
    }

    for (const description of descriptions) {
        const {
            required,
            generator,
            success,
            failed
        } = description;

        if (typeof generator !== "function") {
            throw new ValueError("Generator is not a function.");
        }

        const promise = generator();
        try {
            await promise;
            callback(success);
        } catch(e) {
            if (required) {
                console.error(e)
                failure = true;
            }
            callback(failed);
        }
    }
    return failure;
};

