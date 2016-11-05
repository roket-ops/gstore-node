'use strict';

const is = require('is');

/**
 * Create shallow copy of option
 * @param defaultOptions
 * @param options
 */
const options = (defaultOptions, options) => {
    options = options || {};

    Object.keys(defaultOptions).forEach((k) => {
        if (!options.hasOwnProperty(k)) {
            options[k] = defaultOptions[k];
        }
    });
    return options;
};

/**
 * Wraps a callback style function to conditionally return a promise.
 * Credits: Dave Gramlich
 * --> utility function taken from the google-cloud-node library
 *
 * @param {function} originalMethod - The method to promisify.
 * @return {function} wrapped
 */
const promisify = (originalMethod) => {
  if (originalMethod.__promisified) {
    return originalMethod;
  }

  const wrapper = function() {
    const args = Array.prototype.slice.call(arguments);
    const hasCallback = is.fn(args[args.length - 1]);
    const context = this;

    if (hasCallback) {
      return originalMethod.apply(context, args);
    }

    return new Promise(function(resolve, reject) {
      args.push(function() {
        const callbackArgs = Array.prototype.slice.call(arguments);
        const err = callbackArgs.shift();

        if (err) {
          return reject(err);
        }

        resolve(callbackArgs);
      });

      originalMethod.apply(context, args);
    });
  };

  wrapper.__promisified = true;
  return wrapper;
}

module.exports = {
    options,
    promisify
};
