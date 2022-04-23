export function assertArgHasValue(v, name) {
    if(v === null) {
        throw new AssertionError(`${name} can not be null`);
    }

    if(v === undefined) {
        throw new AssertionError(`${name} can not be undefined`);
    }
}

class AssertionError extends Error {
    constructor(msg) {
        super(msg);
        this.name = "AssertionError";
    }
}
