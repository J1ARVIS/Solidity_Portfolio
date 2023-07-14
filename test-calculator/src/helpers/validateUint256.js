export function checkUintInputExceeded(numberA, numberB) {
    if (numberA > 2 ** 256 - 1 || numberB > 2 ** 256 - 1) {
        alert("Supported numbers exceeded");
        return false;
    }
    return true;
}

export function checkUintInputPositive(numberA, numberB) {
    if (numberA < 0 || numberB < 0) {
        alert("Only positive numbers supported");
        return false;
    }
    return true;
}

export function checkUintResultExceeded(numberA, numberB, operation) {
    let result;
    if (operation == "add") {
        result = numberA + numberB;
    } else if (operation == "multiply") { result = numberA * numberB };

    if (result > 2 ** 256 - 1) {
        alert("Supported calculation result exceeded");
        return false;
    }
    return true;
}

export function checkUintResultPositive(numberA, numberB) {
    if (numberA - numberB < 0) {
        alert("Only a positive calculation result is supported");
        return false;
    }
    return true;
}

export function checkUintResultInteger(numberA, numberB) {
    if (numberA % numberB !== 0) {
        alert("Calculation result will be limited to an integer");
    }
}
