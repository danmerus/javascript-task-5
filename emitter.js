'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
getEmitter.isStar = true;
module.exports = getEmitter;

function addToStorage(storage, data) {
    var event = data[0];
    var action;
    if (data[3] !== undefined) {
        action = [data[1], data[2], data[3]];
    } else {
        action = [data[1], data[2]];
    }
    for (var p in storage) {
        if (storage.hasOwnProperty(p) && p === event) {
            storage[p].push(action);

            return;
        }
    }
    storage[event] = [action];

}
function helper(storage, actions, q, temp, count) { // eslint-disable-line max-params
    var extension = actions[q][2];
    var times = extension[1];
    if (extension[0] === 's' && times > 0) {
        actions[q][1].call(actions[q][0]);
        storage[temp][q][2][1] -= 1;
    }
    if (extension[0] === 't' && count % extension[1] === 0) {
        actions[q][1].call(actions[q][0]);
    }
}

function performEvent(storage, event, count) { // eslint-disable-line max-statements, complexity
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
        if (actions[q].length === 2) {
            actions[q][1].call(actions[q][0]);
        } else {
            helper(storage, actions, q, temp, count);
        }
    }
    if (events.length > 1) {
        performEvent(storage, events[0], count);
    }
}

function deleteFromStorage(storage, data) {
    var event = data[0];
    var context = data[1];
    var actions = [];
    var temp;
    for (var p in storage) {
        if (storage.hasOwnProperty(p) && p === event){
            actions = storage[p];
            temp = p;
        }
    }
    for (var w = 0; w < actions.length; w ++) {
        if (actions[w][0] === context) {
            actions.splice(w, 1);
        }
    }
    storage[temp] = actions;

    return storage;
}

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    return {

        storage: {},
        count: 0,

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
            this.count += 1;
            performEvent(this.storage, event, this.count);
            
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
            addToStorage(this.storage, [event, context, handler, ['s', times]]);
            
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
            addToStorage(this.storage, [event, context, handler, ['t', frequency]]);
            
            return this;
        }
    };
}
