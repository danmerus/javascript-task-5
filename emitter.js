'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
getEmitter.isStar = true;
module.exports = getEmitter;

function addToStorage(storage, data) {
    let [event, action] = [data[0], [...data]];
    action.shift(); // возможно тут не совсем то
    storage[event] = storage[event] || [];
    storage[event].push(action); // сразу так мало кода!

}
function helper(storage, actions, q, temp) { // eslint-disable-line max-params
    var extension = actions[q][2];
    var times = extension[1];
    if (extension[0] === 's' && times > 0 && actions[q][1] !== undefined) {
        actions[q][1].call(actions[q][0]);
        storage[temp][q][2][1] -= 1;
    }
    if (extension[0] === 't') {
        storage[temp][q][2][2] += 1;
    }
    if (extension[0] === 't' && (extension[2] - 1) % extension[1] === 0) {
        actions[q][1].call(actions[q][0]);
    }
}

function performEvent(obj, event) { // eslint-disable-line max-statements, complexity
    var storage = obj.storage;
    var events = event.split('.');
    var actions = [];
    var temp;
    for (var p in storage) {
        if (storage.hasOwnProperty(p) && p === event) {
            actions = storage[p];
            temp = p;
        }
    }
    for (var q = 0; q < actions.length; q++) {
        if (actions[q].length === 2 && actions[q][1] !== undefined) {
            actions[q][1].call(actions[q][0]);
        } else {
            helper(storage, actions, q, temp);
        }
    }
    if (events.length > 1) {
        events.pop();
        events = events.join('.');
        performEvent(obj, events);
    }
}

function dele(storage, event, context) {
    var actions = [];
    var temp;
    var tempActions = [];
    for (var p in storage) {
        if (storage.hasOwnProperty(p) && p === event) {
            actions = storage[p];
            temp = p;
        }
    }
    tempActions = actions;
    for (var w = 0; w < actions.length; w++) {
        if (actions[w][0] === context) {
            tempActions.splice(w, 1);
        }
    }
    storage[temp] = tempActions;
}

function deleteFromStorage(storage, data) { // eslint-disable-line max-statements, complexity
    var event = data[0];
    var context = data[1];
    dele(storage, event, context);
    for (var k in storage) {
        if (storage.hasOwnProperty(k) && k.startsWith(event + '.')) {
            dele(storage, k, context);
        }
    }

    return storage;
}

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    return {

        storage: {},

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object}
         */
        on: function (event, context, handler) {

            addToStorage(this.storage, [event, context, handler]);

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object}
         */
        off: function (event, context) {
            this.storage = deleteFromStorage(this.storage, [event, context]);

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object}
         */
        emit: function (event) {
            var events = event.split('.');
            if (events.length === 2 && this[events[0]] === undefined) {
                this[events[0]] = 1;
            } else if (events.length === 2) {
                this[events[0]]++;
            }
            performEvent(this, event);

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object}
         */
        several: function (event, context, handler, times) {
            if (times <= 0) {
                addToStorage(this.storage, [event, context, handler]);
            } else if (times > 0) {
                addToStorage(this.storage, [event, context, handler, ['s', times]]);
            }

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object}
         */
        through: function (event, context, handler, frequency) {
            if (frequency <= 0) {
                addToStorage(this.storage, [event, context, handler]);
            } else if (frequency > 0) {
                addToStorage(this.storage, [event, context, handler, ['t', frequency, 0]]);
            }

            return this;
        }
    };
}
